import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('Adding role column to users table...');

        // Check if column exists
        const [columns] = await connection.query("SHOW COLUMNS FROM users LIKE 'role'");

        if (columns.length === 0) {
            await connection.query("ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER password_hash");
            console.log("Migration successful: Added 'role' column.");
        } else {
            console.log("Column 'role' already exists. Skipping.");
        }

    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await connection.end();
    }
}

migrate();
