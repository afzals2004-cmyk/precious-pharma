import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function createAdmin() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        const email = 'admin@precious.com';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        const name = 'Admin User';
        const role = 'admin';

        console.log(`Creating admin user: ${email}...`);

        // Check if exists
        const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length > 0) {
            console.log('User already exists. Updating role to admin...');
            await connection.query('UPDATE users SET role = ?, password_hash = ? WHERE email = ?', ['admin', hashedPassword, email]);
        } else {
            await connection.query('INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)', [name, email, hashedPassword, role]);
        }

        console.log('Admin user created successfully!');
        console.log('Email:', email);
        console.log('Password:', password);

    } catch (err) {
        console.error('Error creating admin:', err);
    } finally {
        await connection.end();
    }
}

createAdmin();
