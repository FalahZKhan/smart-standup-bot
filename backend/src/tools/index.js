// ============================================================
// Tool Registry (MCP-Inspired)
// ============================================================
// This registry exposes external integrations as tools that can
// be invoked dynamically by name, similar to MCP-style tool calls.

const getGithubActivity = require('./githubTool');

module.exports = {
  get_github_activity: getGithubActivity
};
