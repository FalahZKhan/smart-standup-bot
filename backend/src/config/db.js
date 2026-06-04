// ============================================================
// Database Configuration (PostgreSQL)
// ============================================================
// We use the 'pg' library (node-postgres) to connect to PostgreSQL.
// The Pool class manages a pool of database connections, which is
// more efficient than creating a new connection for every request.

const { Pool } = require('pg');

// Load environment variables from .env file
require('dotenv').config();

// Create a connection pool using the DATABASE_URL from .env
// PostgreSQL connection string format:
// postgresql://username:password@host:port/database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Optional SSL config for production (e.g., Heroku, Railway)
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test the connection when the server starts
pool.connect((err, client, release) => {
  if (err) {
    console.error(' Error connecting to PostgreSQL:', err.message);
    console.error('   Make sure your DATABASE_URL in .env is correct.');
  } else {
    console.log(' Connected to PostgreSQL successfully');
    release(); // Release the client back to the pool
  }
});

// Export the pool so other files can use it to run queries
module.exports = pool;
