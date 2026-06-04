// ============================================================
// API Service - Frontend HTTP Client
// ============================================================
// This file centralizes all API calls to the backend.
// Using a single file for API calls means if the backend URL
// changes, we only update it in one place.

import axios from 'axios';

// Create an axios instance with our backend URL as the base
// The Vite proxy will forward /api/* to http://localhost:5000
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // 30 second timeout (AI calls can take a few seconds)
});

// ============================================================
// Standup API Calls
// ============================================================

export const standupAPI = {

  // Generate AI summary from raw notes (doesn't save to DB)
  generate: (notes) =>
    api.post('/standups/generate', { notes }),

  // Save a standup to the database
  save: (rawInput, aiSummary, source = 'manual') =>
    api.post('/standups', { rawInput, aiSummary, source }),

  // Get all standups (optionally filtered by search term)
  getAll: (search = '') =>
    api.get('/standups', { params: search ? { search } : {} }),

  // Delete a standup by its ID
  deleteById: (id) =>
    api.delete(`/standups/${id}`),
};

// ============================================================
// GitHub API Calls
// ============================================================

export const githubAPI = {

  // Fetch recent activity for a GitHub user
  getActivity: (username) =>
    api.get(`/github/${username}`),

  // Generate a standup summary from GitHub commit history
  generateFromGitHub: (username) =>
    api.post('/github/generate', { username }),
};

export default api;
