import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

// --- PRODUCTS ---

// Get all products
router.get('/products', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get product by ID
router.get('/products/:id', async (req, res) => {
    try {
        const [products] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
        if (products.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(products[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- AUTH ---

// Register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.query('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// --- ORDERS ---

// Create Order
router.post('/orders', authenticateToken, async (req, res) => {
    const { items, total_price, status } = req.body; // items: [{product_id, quantity, price}]
    const userId = req.user.id;

    if (!items || items.length === 0) return res.status(400).json({ error: 'No items in order' });

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Create Order
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_price, status) VALUES (?, ?, ?)',
            [userId, total_price, status || 'pending']
        );
        const orderId = orderResult.insertId;

        // 2. Create Order Items
        for (const item of items) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price_at_time) VALUES (?, ?, ?, ?)',
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        await connection.commit();
        res.status(201).json({ message: 'Order placed successfully', orderId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

// Get User Orders
router.get('/orders', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const [orders] = await db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Order Details (Optional, for detailed view)
router.get('/orders/:id', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    constorderId = req.params.id;
    try {
        // Verify ownership
        const [order] = await db.query('SELECT * FROM orders WHERE id = ? AND user_id = ?', [orderId, userId]);
        if (order.length === 0) return res.status(404).json({ error: 'Order not found' });

        const [items] = await db.query(
            `SELECT oi.*, p.name, p.image_url 
             FROM order_items oi 
             JOIN products p ON oi.product_id = p.id 
             WHERE oi.order_id = ?`,
            [orderId]
        );

        res.json({ ...order[0], items });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Middleware to check if user is admin
const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
}

// ... existing order routes ...

// --- ADMIN API ---

// Admin: Get All Orders
router.get('/admin/orders', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [orders] = await db.query('SELECT o.*, u.name as user_name FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update Order Status
router.put('/admin/orders/:id', authenticateToken, authorizeAdmin, async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    if (!['pending', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Dashboard Stats
router.get('/admin/stats', authenticateToken, authorizeAdmin, async (req, res) => {
    try {
        const [userCount] = await db.query('SELECT COUNT(*) as count FROM users');
        const [orderCount] = await db.query('SELECT COUNT(*) as count FROM orders');
        const [revenue] = await db.query("SELECT SUM(total_price) as total FROM orders WHERE status != 'cancelled'");

        res.json({
            users: userCount[0].count,
            orders: orderCount[0].count,
            revenue: revenue[0].total || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
