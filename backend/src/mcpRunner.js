// ============================================================
// MCP-Style Tool Runner
// ============================================================
// This is a lightweight, MCP-inspired abstraction layer that
// dynamically invokes registered tools by name.

const tools = require('./tools');

const runTool = async (toolName, args = {}) => {
  if (!toolName || typeof toolName !== 'string') {
    throw new Error('Tool name is required');
  }

  const tool = tools[toolName];
  if (!tool) {
    throw new Error(`Tool not found: ${toolName}`);
  }

  return tool(args);
};

module.exports = { runTool };
