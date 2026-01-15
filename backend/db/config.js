/*
 * Database Configuration
 * This file sets up the PostgreSQL connection pool using the pg library.
 * The pool manages multiple database connections efficiently.
 * Environment variables are loaded from .env file.
 */

const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool to PostgreSQL database
const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  password: process.env.DATABASE_PASSWORD,
  port: process.env.DATABASE_PORT,
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;