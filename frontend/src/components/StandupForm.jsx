// ============================================================
// StandupForm Component
// ============================================================
// The main form for entering daily standup notes manually.
// Includes character counter, validation, and generate button.

import React, { useState } from 'react';
import { standupAPI } from '../services/api';
import SummaryPreview from './SummaryPreview';

const MAX_CHARS = 2000;

// Template to help users understand the format
const TEMPLATE = `Yesterday:
• 

Today:
• 

Blockers:
• None`;

const StandupForm = ({ onSaved }) => {
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const charCount = notes.length;
  const isOverLimit = charCount > MAX_CHARS;

  // Show a success notification that fades after 3 seconds
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // --------------------------------------------------------
  // Handle Generate button click
  // Sends notes to backend → Gemini → returns summary
  // --------------------------------------------------------
  const handleGenerate = async () => {
    if (!notes.trim()) {
      setError('Please enter your standup notes first.');
      return;
    }
    if (isOverLimit) {
      setError(`Notes must be under ${MAX_CHARS} characters.`);
      return;
    }

    setError('');
    setSummary('');
    setIsGenerating(true);

    try {
      const response = await standupAPI.generate(notes);
      setSummary(response.data.data.aiSummary);
      setRawInput(notes); // Save for when user clicks "Save"
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate summary. Is the backend running?');
    } finally {
      setIsGenerating(false);
    }
  };

  // --------------------------------------------------------
  // Handle Save button click (shown in SummaryPreview)
  // --------------------------------------------------------
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await standupAPI.save(rawInput, summary, 'manual');
      showSuccess('Standup saved successfully!');
      onSaved(); // Trigger history reload in parent
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save standup.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <label className="font-semibold text-gray-900 dark:text-white text-sm">
            Daily Standup Notes
          </label>
          {/* Character counter */}
          <span className={`text-xs font-mono ${
            isOverLimit ? 'text-red-500' : 
            charCount > MAX_CHARS * 0.8 ? 'text-amber-500' : 
            'text-gray-400 dark:text-gray-500'
          }`}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>

        {/* Textarea */}
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setError(''); // Clear error as user types
          }}
          placeholder="Enter your standup notes here...&#10;&#10;Yesterday:&#10;• What you completed&#10;&#10;Today:&#10;• What you plan to do&#10;&#10;Blockers:&#10;• Any impediments"
          rows={8}
          className={`input resize-none font-mono text-sm leading-relaxed
            ${isOverLimit ? 'border-red-400 focus:ring-red-400' : ''}`}
        />

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
          {/* Template and Clear buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setNotes(TEMPLATE)}
              className="btn-secondary text-xs py-1.5 px-3"
              title="Load template"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Template
            </button>
            {notes && (
              <button
                onClick={() => { setNotes(''); setSummary(''); setError(''); }}
                className="btn-secondary text-xs py-1.5 px-3"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !notes.trim() || isOverLimit}
            className="btn-primary"
          >
            {isGenerating ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Generating...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate AI Summary
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 animate-fade-in">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Success notification */}
      {successMsg && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-sm text-green-700 dark:text-green-400 animate-fade-in">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* AI Summary Preview with Save button */}
      {summary && (
        <SummaryPreview
          summary={summary}
          onSave={handleSave}
          isSaving={isSaving}
          source="manual"
        />
      )}
    </div>
  );
};

export default StandupForm;
