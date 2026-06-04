// ============================================================
// App.jsx - Main Application Component
// ============================================================
// This is the root component that brings everything together.
// It manages:
// - Tab switching (Manual vs GitHub)
// - Standup history state
// - Loading the history on startup
// - Passing callbacks to child components

import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StandupForm from './components/StandupForm';
import GitHubStandup from './components/GitHubStandup';
import HistoryList from './components/HistoryList';
import { standupAPI } from './services/api';

const App = () => {
  // Which tab is active: 'manual' or 'github'
  const [activeTab, setActiveTab] = useState('manual');
  
  // All standups from the database
  const [standups, setStandups] = useState([]);
  
  // Whether history is being loaded
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  // Search term for filtering history
  const [searchQuery, setSearchQuery] = useState('');

  // --------------------------------------------------------
  // Load standup history from the backend
  // useCallback memoizes this function so it can be passed
  // as a prop without causing unnecessary re-renders
  // --------------------------------------------------------
  const loadHistory = useCallback(async (query = '') => {
    setIsLoadingHistory(true);
    try {
      const response = await standupAPI.getAll(query);
      setStandups(response.data.data);
    } catch (err) {
      console.error('Failed to load history:', err.message);
      // Don't show an error - the list will just be empty
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Load history when the app first renders
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Reload history when search query changes
  // We use a small delay (debounce) so we don't spam the API
  useEffect(() => {
    const timer = setTimeout(() => {
      loadHistory(searchQuery);
    }, 300);
    return () => clearTimeout(timer); // Cleanup timer on re-render
  }, [searchQuery, loadHistory]);

  // --------------------------------------------------------
  // Handle standup deletion
  // --------------------------------------------------------
  const handleDelete = async (id) => {
    try {
      await standupAPI.deleteById(id);
      // Remove from local state immediately for instant UI feedback
      setStandups(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to delete:', err.message);
      alert('Failed to delete standup. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* ====== LEFT COLUMN: Input & Generation ====== */}
          <div className="space-y-4">
            
            {/* Tab selector */}
            <div className="card p-1 flex gap-1">
              <button
                onClick={() => setActiveTab('manual')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${activeTab === 'manual' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Manual Standup
              </button>
              <button
                onClick={() => setActiveTab('github')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${activeTab === 'github' 
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub Activity
              </button>
            </div>

            {/* Tab content */}
            {activeTab === 'manual' ? (
              <StandupForm onSaved={() => loadHistory(searchQuery)} />
            ) : (
              <GitHubStandup onSaved={() => loadHistory(searchQuery)} />
            )}
          </div>

          {/* ====== RIGHT COLUMN: History Feed ====== */}
          <div>
            <HistoryList
              standups={standups}
              onDelete={handleDelete}
              isLoading={isLoadingHistory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onSearchClear={() => setSearchQuery('')}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
