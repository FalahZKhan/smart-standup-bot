// ============================================================
// GitHub Routes
// ============================================================

const express = require('express');
const router = express.Router();
const GitHubController = require('../controllers/githubController');

// GET  /api/github/:username  → Fetch recent GitHub activity for a user
router.get('/:username', GitHubController.getActivity);

// POST /api/github/generate   → Generate standup from GitHub commits
router.post('/generate', GitHubController.generateFromGitHub);

module.exports = router;
