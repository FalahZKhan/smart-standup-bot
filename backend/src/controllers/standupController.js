// ============================================================
// Standup Controller
// ============================================================
// Controllers handle incoming HTTP requests and send responses.
// They call services and models to do the actual work, keeping
// the business logic separated from route definitions.

const StandupModel = require('../models/standupModel');
const GeminiService = require('../services/geminiService');

const StandupController = {

  // ----------------------------------------------------------
  // POST /api/standups/generate
  // Generates an AI summary from raw notes (does NOT save yet)
  // ----------------------------------------------------------
  async generate(req, res) {
    try {
      const { notes } = req.body;

      // Validate that notes were provided
      if (!notes || notes.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Standup notes are required'
        });
      }

      if (notes.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Notes are too short. Please provide more detail.'
        });
      }

      // Call the Gemini AI service to generate a summary
      const aiSummary = await GeminiService.generateStandupSummary(notes);

      // Return the generated summary (user will decide to save or not)
      return res.status(200).json({
        success: true,
        data: { aiSummary }
      });

    } catch (error) {
      console.error('Error generating standup:', error.message);
      
      // Handle Gemini API specific errors
      if (error.message?.includes('API_KEY')) {
        return res.status(500).json({
          success: false,
          message: 'Gemini API key is invalid or missing. Check your .env file.'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Failed to generate AI summary. Please try again.'
      });
    }
  },

  // ----------------------------------------------------------
  // POST /api/standups
  // Saves a standup to the database
  // ----------------------------------------------------------
  async save(req, res) {
    try {
      const { rawInput, aiSummary, source = 'manual' } = req.body;

      // Validate required fields
      if (!rawInput || !aiSummary) {
        return res.status(400).json({
          success: false,
          message: 'Both raw input and AI summary are required'
        });
      }

      // Save to PostgreSQL using our model
      const standup = await StandupModel.create({ rawInput, aiSummary, source });

      return res.status(201).json({
        success: true,
        message: 'Standup saved successfully!',
        data: standup
      });

    } catch (error) {
      console.error('Error saving standup:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to save standup. Please try again.'
      });
    }
  },

  // ----------------------------------------------------------
  // GET /api/standups
  // Retrieves all standups (or search results)
  // ----------------------------------------------------------
  async getAll(req, res) {
    try {
      const { search } = req.query;
      
      let standups;
      if (search && search.trim()) {
        // If a search query is provided, use the search method
        standups = await StandupModel.search(search.trim());
      } else {
        // Otherwise return all standups
        standups = await StandupModel.findAll();
      }

      return res.status(200).json({
        success: true,
        data: standups,
        count: standups.length
      });

    } catch (error) {
      console.error('Error fetching standups:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch standups.'
      });
    }
  },

  // ----------------------------------------------------------
  // DELETE /api/standups/:id
  // Deletes a standup by ID
  // ----------------------------------------------------------
  async deleteById(req, res) {
    try {
      const { id } = req.params;

      // Validate that the ID is a number
      if (!id || isNaN(parseInt(id))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid standup ID'
        });
      }

      // Attempt to delete the record
      const deleted = await StandupModel.deleteById(parseInt(id));

      // If nothing was returned, the record didn't exist
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Standup not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Standup deleted successfully',
        data: deleted
      });

    } catch (error) {
      console.error('Error deleting standup:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete standup.'
      });
    }
  }
};

module.exports = StandupController;
