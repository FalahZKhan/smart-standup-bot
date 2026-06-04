// ============================================================
// GitHub Controller
// ============================================================
// Handles HTTP requests related to GitHub activity integration.
// This is the "MCP-inspired" feature - in production this could
// use a real GitHub MCP server for richer data access.

const { runTool } = require('../mcpRunner');
const GeminiService = require('../services/geminiService');

const GitHubController = {

  // ----------------------------------------------------------
  // GET /api/github/:username
  // Fetches recent GitHub activity for a given username
  // ----------------------------------------------------------
  async getActivity(req, res) {
    try {
      const { username } = req.params;
      const sanitizedUsername = username ? String(username).trim() : '';

      if (!sanitizedUsername) {
        return res.status(400).json({
          success: false,
          message: 'GitHub username is required'
        });
      }

      // MCP-style tool call to fetch GitHub activity
      const { commits, repos } = await runTool('get_github_activity', {
        username: sanitizedUsername
      });

      if (commits.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'No recent public activity found for this user.',
          data: { commits: [], repos }
        });
      }

      return res.status(200).json({
        success: true,
        data: { commits, repos }
      });

    } catch (error) {
      console.error('GitHub API error:', error.message);

      // Handle 404 - user doesn't exist
      if (error.response?.status === 404) {
        return res.status(404).json({
          success: false,
          message: `GitHub user "${req.params.username}" not found`
        });
      }

      // Handle rate limiting
      if (error.response?.status === 403) {
        return res.status(429).json({
          success: false,
          message: 'GitHub API rate limit exceeded. Add a GITHUB_TOKEN to your .env to increase the limit.'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch GitHub activity'
      });
    }
  },

  // ----------------------------------------------------------
  // POST /api/github/generate
  // Generates a standup from GitHub commit messages using Gemini
  // ----------------------------------------------------------
  async generateFromGitHub(req, res) {
    try {
      const { username } = req.body;
      const sanitizedUsername = username ? String(username).trim() : '';

      if (!sanitizedUsername) {
        return res.status(400).json({
          success: false,
          message: 'GitHub username is required'
        });
      }

      // Step 1: Fetch recent activity from GitHub via tool runner
      const { commits } = await runTool('get_github_activity', {
        username: sanitizedUsername
      });

      if (commits.length === 0) {
        return res.status(200).json({
          success: false,
          message: 'No recent public activity found. Try a username with recent activity.'
        });
      }

      // Step 2: Extract just the commit messages for Gemini
      const commitMessages = commits.map(c => {
        const repoLabel = c.repo ? c.repo.split('/')[1] || c.repo : 'unknown';
        return `[${repoLabel}] ${c.message}`;
      });

      // Step 3: Send commit messages to Gemini to generate a standup
      let aiSummary = '';
      try {
        aiSummary = await GeminiService.generateFromCommits(commitMessages);
      } catch (error) {
        console.error('Gemini generation error:', error.message);
        return res.status(200).json({
          success: false,
          message: 'AI summary temporarily unavailable due to rate limits. Showing recent GitHub activity instead. Please try again in a minute or after your quota resets.',
          data: {
            aiSummary: null,
            commits,
            rawInput: commitMessages.join('\n')
          },
          error: {
            type: 'gemini',
            message: error.message
          }
        });
      }

      // Step 4: Return the summary and the raw commits for display
      return res.status(200).json({
        success: true,
        data: {
          aiSummary,
          commits,
          rawInput: commitMessages.join('\n')
        }
      });

    } catch (error) {
      console.error('Error generating from GitHub:', error.message);

      if (error.response?.status === 404) {
        return res.status(404).json({
          success: false,
          message: `GitHub user not found`
        });
      }

      if (error.response?.status === 403) {
        return res.status(429).json({
          success: false,
          message: 'GitHub API rate limit exceeded.'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to generate standup from GitHub activity'
      });
    }
  }
};

module.exports = GitHubController;
