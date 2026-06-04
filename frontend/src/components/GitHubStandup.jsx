// ============================================================
// GitHubStandup Component
// ============================================================
// MCP-Inspired Feature: Generate standups from GitHub commits.
//
// How it works:
// 1. User enters a GitHub username
// 2. We fetch their recent public events via GitHub API
// 3. Extract commit messages
// 4. Send them to Gemini AI
// 5. Display the generated standup
//
// MCP NOTE: In a production environment, this feature could be
// powered by a GitHub MCP server. MCP (Model Context Protocol)
// is an open standard that lets AI agents interact with external
// services through a consistent interface. Instead of writing
// custom GitHub API code here, a GitHub MCP server would give
// the AI direct access to commits, PRs, and issues.
// Learn more: https://modelcontextprotocol.io

import React, { useState } from 'react';
import { githubAPI, standupAPI } from '../services/api';
import SummaryPreview from './SummaryPreview';

const GitHubStandup = ({ onSaved }) => {
  const [username, setUsername] = useState('');
  const [commits, setCommits] = useState([]);
  const [summary, setSummary] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // --------------------------------------------------------
  // Fetch GitHub activity and generate standup with Gemini
  // --------------------------------------------------------
  const handleGenerate = async () => {
    if (!username.trim()) {
      setError('Please enter a GitHub username.');
      return;
    }

    setError('');
    setSummary('');
    setCommits([]);
    setIsGenerating(true);

    try {
      // This hits our backend which: 
      // 1. Fetches GitHub events API
      // 2. Extracts commits
      // 3. Sends to Gemini
      const response = await githubAPI.generateFromGitHub(username.trim());
      const { data } = response;

      if (!data?.success) {
        const payload = data?.data || {};
        if (Array.isArray(payload.commits)) {
          setCommits(payload.commits);
          setRawInput(payload.rawInput || '');
        }
        setError(data?.message || 'Failed to generate from GitHub activity.');
        return;
      }

      const { aiSummary, commits: fetchedCommits, rawInput: raw } = data.data || {};

      if (!aiSummary || !Array.isArray(fetchedCommits)) {
        setError('Unexpected response from GitHub activity service.');
        return;
      }
      
      setSummary(aiSummary);
      setCommits(fetchedCommits);
      setRawInput(raw || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate from GitHub activity.');
    } finally {
      setIsGenerating(false);
    }
  };

  // --------------------------------------------------------
  // Save the generated standup to PostgreSQL
  // --------------------------------------------------------
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await standupAPI.save(rawInput, summary, 'github');
      showSuccess('GitHub standup saved!');
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save standup.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Info banner explaining the MCP concept */}
      <div className="flex gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
        <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="text-xs text-amber-800 dark:text-amber-300">
          <p className="font-semibold mb-1">MCP-Inspired Feature</p>
          <p className="leading-relaxed">
            This fetches your public GitHub commits and uses Gemini AI to generate a standup. 
            In production, this could use a <strong>GitHub MCP Server</strong> — an open standard 
            letting AI agents access GitHub data through a consistent interface.
          </p>
        </div>
      </div>

      {/* Input card */}
      <div className="card p-5">
        <label className="block font-semibold text-gray-900 dark:text-white text-sm mb-3">
          GitHub Username
        </label>

        <div className="flex gap-3">
          {/* Username input */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </div>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="e.g. torvalds, gaearon, addyosmani"
              className="input pl-10"
            />
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !username.trim()}
            className="btn-primary whitespace-nowrap"
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
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Generate From GitHub
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
          Uses GitHub's public events API. Works best with users who have recent public commits.
          No authentication required (60 req/hour limit).
        </p>
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

      {/* Show the raw commits that were found */}
      {commits.length > 0 && (
        <div className="card p-4 animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            Found {commits.length} recent github activity
          </h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {commits.map((commit, i) => (
              <div key={i} className="flex gap-2 text-xs">
                <span className="text-gray-400 dark:text-gray-500 font-mono shrink-0">
                  {commit.repo.split('/')[1]}
                </span>
                <span className="text-gray-600 dark:text-gray-400 truncate">{commit.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Summary with Save button */}
      {summary && (
        <SummaryPreview
          summary={summary}
          onSave={handleSave}
          isSaving={isSaving}
          source="github"
        />
      )}
    </div>
  );
};

export default GitHubStandup;
