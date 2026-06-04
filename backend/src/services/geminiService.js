// ============================================================
// Gemini AI Service
// ============================================================
// This service handles all communication with Google's Gemini API.
// We use the @google/generative-ai SDK to send prompts and 
// receive AI-generated responses.

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize the Gemini client with our API key from .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const GeminiService = {

  // ----------------------------------------------------------
  // Generate a professional standup summary from raw notes
  // ----------------------------------------------------------
  async generateStandupSummary(userInput) {
    // Get the Gemini Pro model
    // 'gemini-flash-latest' is fast and cost-effective for text tasks
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // This is our prompt engineering - we tell the AI exactly what
    // format to return so our frontend can display it consistently
    const prompt = `You are a professional Agile Scrum assistant.

Convert the following standup notes into a concise professional daily standup report.

Return ONLY this format with no extra text, markdown, or explanations:

Completed:
• [item]

Planned:
• [item]

Blockers:
• [item or "None reported"]

Standup Notes:
${userInput}`;

    // Send the prompt to Gemini and wait for the response
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    // Extract the text from the response object
    return response.text();
  },

  // ----------------------------------------------------------
  // Generate a standup summary from GitHub commit messages
  // This is the MCP-inspired feature!
  // ----------------------------------------------------------
  async generateFromCommits(commits) {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // Format the commits into a readable list for the AI
    const commitList = commits.map(c => `• ${c}`).join('\n');

    const prompt = `You are a professional Agile Scrum assistant.

The following are recent GitHub commit messages from a developer.
Convert them into a professional daily standup report.

Return ONLY this format with no extra text, markdown, or explanations:

Completed:
• [summarized item from commits]

Planned:
• [logical next steps based on the work]

Blockers:
• [any inferred blockers or "None reported"]

Recent Commits:
${commitList}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
};

module.exports = GeminiService;
