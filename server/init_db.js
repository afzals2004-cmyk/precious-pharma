import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD ? process.env.DB_PASSWORD.length : 0);

async function initDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true
    });

    try {
        console.log('Connected to MySQL server...');

        // Create DB first if it doesn't exist (handled in schema, but good to ensure connection doesn't fail on db name)
        // Actually schema.sql has 'CREATE DATABASE IF NOT EXISTS', so we just connect without DB selected OR select it after.
        // But mysql2 options has `database: ...`. 
        // If the DB doesn't exist, connecting with `database` set might fail.
        // So let's connect without a database first, then run the schema.

        const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        console.log('Executing schema...');

        await connection.query(schemaSql);
        console.log('Database initialized successfully!');

    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await connection.end();
    }
}

initDatabase();
