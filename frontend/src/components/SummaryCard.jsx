// ============================================================
// SummaryCard Component
// ============================================================
// Displays a single saved standup in the history feed.
// Shows date, source badge, summary, and a delete button.

import React, { useState } from 'react';

const SummaryCard = ({ standup, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Format the timestamp into a human-friendly date/time
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit' 
      })
    };
  };

  const { date, time } = formatDate(standup.created_at);

  // Truncate long summaries for the collapsed view
  const isLong = standup.ai_summary.length > 300;
  const displayText = expanded || !isLong 
    ? standup.ai_summary 
    : standup.ai_summary.slice(0, 300) + '...';

  return (
    <div className="card p-4 hover:shadow-md transition-shadow duration-200 animate-fade-in">
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source badge */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium
            ${standup.source === 'github' 
              ? 'bg-gray-900 dark:bg-gray-700 text-white' 
              : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800'
            }`}>
            {standup.source === 'github' ? (
              <>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Manual
              </>
            )}
          </span>

          {/* Date and time */}
          <span className="text-xs text-gray-500 dark:text-gray-400">{date}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{time}</span>
        </div>

        {/* Delete button */}
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="btn-danger shrink-0"
            title="Delete standup"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        ) : (
          // Confirmation dialog inline
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-800">
            <span className="text-xs text-red-600 dark:text-red-400">Sure?</span>
            <button
              onClick={() => { onDelete(standup.id); setShowConfirm(false); }}
              className="text-xs font-medium text-red-600 dark:text-red-400 hover:text-red-700 underline"
            >
              Yes
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              No
            </button>
          </div>
        )}
      </div>

      {/* Summary text */}
      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans leading-relaxed">
        {displayText}
      </pre>

      {/* Expand/collapse for long summaries */}
      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {expanded ? '↑ Show less' : '↓ Show more'}
        </button>
      )}
    </div>
  );
};

export default SummaryCard;
