# Precious Pharma

A premium e-commerce pharmacy application built with Vite (Vanilla JS), Node.js, Express, and MySQL.

## Prerequisites

- Node.js installed.
- MySQL installed and running.
- A `.env` file with your database credentials (created during setup).

## Project Structure

- `src/`: Frontend source code (Vanilla JS, CSS).
- `server/`: Backend API code (Express, database connection).
- `dist/`: Build output (after running build).

## How to Run Locally

You need to run both the Frontend and Backend servers simultaneously.

### 1. Start the Backend Server
This handles the API and database connections.

Open a terminal and run:
```bash
npm run server
```
*Runs on http://localhost:3000*

### 2. Start the Frontend Development Server
This serves the website with hot-reloading.

Open a **second** terminal and run:
```bash
npm run dev
```
*Runs on http://localhost:5173* (or similar)

## Features

- **Premium UI**: Deep Green & Gold aesthetic.
- **Product Catalog**: Fetched dynamically from MySQL.
- **Product Details**: Individual product pages.
- **Shopping Cart**: Persistent cart using LocalStorage.
- **Checkout**: Order submission form.
- **Auth**: User Login and Registration logic.

## Database

The database schema is located in `server/schema.sql`.
To re-initialize the database (WARNING: clears data), run:
```bash
node server/init_db.js
```
