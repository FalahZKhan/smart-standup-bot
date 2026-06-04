// ============================================================
// Standup Model - Database Operations
// ============================================================
// This file contains all database queries related to standups.
// Separating DB logic here keeps controllers clean and focused
// on handling HTTP requests (separation of concerns).

const pool = require('../config/db');

const StandupModel = {

  // ----------------------------------------------------------
  // Create a new standup record in the database
  // Returns the newly created standup with its generated ID
  // ----------------------------------------------------------
  async create({ rawInput, aiSummary, source = 'manual' }) {
    const query = `
      INSERT INTO standups (raw_input, ai_summary, source)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    // $1, $2, $3 are parameterized placeholders - this prevents SQL injection
    const values = [rawInput, aiSummary, source];
    const result = await pool.query(query, values);
    return result.rows[0]; // Return the newly created row
  },

  // ----------------------------------------------------------
  // Get all standups, newest first
  // ----------------------------------------------------------
  async findAll() {
    const query = `
      SELECT * FROM standups
      ORDER BY created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  },

  // ----------------------------------------------------------
  // Get a single standup by its ID
  // ----------------------------------------------------------
  async findById(id) {
    const query = 'SELECT * FROM standups WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0]; // Returns undefined if not found
  },

  // ----------------------------------------------------------
  // Delete a standup by ID
  // Returns the deleted row so we can confirm it existed
  // ----------------------------------------------------------
  async deleteById(id) {
    const query = 'DELETE FROM standups WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0]; // Returns undefined if nothing was deleted
  },

  // ----------------------------------------------------------
  // Search standups by text (searches summary and raw input)
  // Uses PostgreSQL ILIKE for case-insensitive matching
  // ----------------------------------------------------------
  async search(query) {
    const searchQuery = `
      SELECT * FROM standups
      WHERE 
        ai_summary ILIKE $1 OR 
        raw_input ILIKE $1 OR
        source ILIKE $1 OR
        TO_CHAR(created_at, 'YYYY-MM-DD') ILIKE $1
      ORDER BY created_at DESC
    `;
    // Wrap the search term with % for partial matching
    const result = await pool.query(searchQuery, [`%${query}%`]);
    return result.rows;
  }
};

module.exports = StandupModel;
