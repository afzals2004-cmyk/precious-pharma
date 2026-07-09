import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './db.js';
import router from './routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', router);

// Health Check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Precious Pharma API Running' });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
