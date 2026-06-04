// ============================================================
// Standup Routes
// ============================================================
// Express Router groups all standup-related endpoints together.
// This keeps server.js clean and makes the API easy to navigate.

const express = require('express');
const router = express.Router();
const StandupController = require('../controllers/standupController');

// POST /api/standups/generate  → Generate AI summary (no DB save)
router.post('/generate', StandupController.generate);

// POST /api/standups            → Save a standup to the database
router.post('/', StandupController.save);

// GET  /api/standups            → Get all standups (supports ?search= query)
router.get('/', StandupController.getAll);

// DELETE /api/standups/:id      → Delete a standup by ID
router.delete('/:id', StandupController.deleteById);

module.exports = router;
