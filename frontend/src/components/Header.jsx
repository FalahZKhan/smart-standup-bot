// ============================================================
// Header Component
// ============================================================
// The top navigation bar showing the app title and theme toggle

import React from 'react';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              Smart Standup Bot
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight">
              AI-powered daily standups
            </p>
          </div>
        </div>

        {/* Right side: badge + theme toggle */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse-slow"></span>
            Gemini AI
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
