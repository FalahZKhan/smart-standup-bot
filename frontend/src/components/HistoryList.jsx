// ============================================================
// HistoryList Component
// ============================================================
// Displays the full history of saved standups.
// Supports search filtering and shows empty/loading states.

import React from 'react';
import SummaryCard from './SummaryCard';
import SearchBar from './SearchBar';

// Skeleton loader - shown while standups are loading
const SkeletonCard = () => (
  <div className="card p-4 animate-pulse">
    <div className="flex justify-between mb-3">
      <div className="flex gap-2">
        <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="h-5 w-24 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-7 w-16 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
    </div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
    </div>
  </div>
);

const HistoryList = ({ standups, onDelete, isLoading, searchQuery, onSearchChange, onSearchClear }) => {
  return (
    <div className="space-y-4">
      {/* Section header with search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-900 dark:text-white">History</h2>
          {/* Count badge */}
          {!isLoading && (
            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {standups.length}
            </span>
          )}
        </div>
        {/* Search bar */}
        <div className="w-full sm:w-72">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            onClear={onSearchClear}
          />
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {/* Standups list */}
      {!isLoading && standups.length > 0 && (
        <div className="space-y-3">
          {standups.map(standup => (
            <SummaryCard
              key={standup.id}
              standup={standup}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Empty state - no standups at all */}
      {!isLoading && standups.length === 0 && !searchQuery && (
        <div className="card p-10 text-center">
          <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="font-medium text-gray-600 dark:text-gray-400">No standups yet</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Generate and save your first standup above
          </p>
        </div>
      )}

      {/* Empty state - search has no results */}
      {!isLoading && standups.length === 0 && searchQuery && (
        <div className="card p-8 text-center">
          <p className="font-medium text-gray-600 dark:text-gray-400">No results found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            No standups match "<span className="font-medium">{searchQuery}</span>"
          </p>
        </div>
      )}
    </div>
  );
};

export default HistoryList;
