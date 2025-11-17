/**
 * Professional Filters Section Component
 * 
 * Provides filtering and search capabilities for partnership requests
 * with accessibility features and professional UI/UX
 */

import React, { useCallback, useMemo } from 'react';
import { Filter, Search, X, RotateCcw } from 'lucide-react';
import { FiltersSectionProps } from '../../types/partnership';
import { FILTER_OPTIONS } from './constants';
import { createSearchDebouncer } from './helpers';

export function FiltersSection({ 
  filter, 
  setFilter, 
  searchTerm, 
  setSearchTerm, 
  statistics 
}: FiltersSectionProps) {
  
  // Debounced search function
  const debouncedSearch = useMemo(() => 
    createSearchDebouncer(setSearchTerm), 
    [setSearchTerm]
  );

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: string) => {
    setFilter(newFilter as typeof filter);
  }, [setFilter]);

  // Handle search input change
  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    debouncedSearch(value);
  }, [debouncedSearch]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, [setSearchTerm]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilter('all');
    setSearchTerm('');
  }, [setFilter, setSearchTerm]);

  // Check if filters are active
  const hasActiveFilters = filter !== 'all' || searchTerm.length > 0;

  return (
    <section className="card" aria-label="Filter and search partnership requests">
      <div className="card-content p-4">
        <div className="filters-container">
          {/* Filter Controls Row */}
          <div className="filters-row">
            {/* Status Filter */}
            <div className="filter-group">
              <label htmlFor="status-filter" className="filter-label">
                <Filter className="w-4 h-4" aria-hidden="true" />
                Status Filter
              </label>
              <select 
                id="status-filter"
                className="form-select filter-select"
                value={filter}
                onChange={(e) => handleFilterChange(e.target.value)}
                aria-describedby="status-filter-help"
              >
                {FILTER_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                    {statistics && option.value !== 'all' && (
                      ` (${statistics[option.value as keyof typeof statistics]})`
                    )}
                  </option>
                ))}
              </select>
              <p id="status-filter-help" className="sr-only">
                Filter applications by their review status
              </p>
            </div>

            {/* Search Input */}
            <div className="search-group">
              <label htmlFor="search-input" className="filter-label">
                <Search className="w-4 h-4" aria-hidden="true" />
                Search Applications
              </label>
              <div className="search-input-container">
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search by name, email, school, or course..."
                  className="form-input search-input"
                  defaultValue={searchTerm}
                  onChange={handleSearchChange}
                  aria-describedby="search-help"
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={clearSearch}
                    aria-label="Clear search"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
              <p id="search-help" className="sr-only">
                Search through partnership applications by applicant details
              </p>
            </div>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                className="btn btn-outline btn-sm reset-filters-btn"
                onClick={resetFilters}
                aria-label="Reset all filters and search"
                title="Clear all filters"
              >
                <RotateCcw className="w-4 h-4 mr-2" aria-hidden="true" />
                Reset
              </button>
            )}
          </div>

          {/* Statistics Summary */}
          {statistics && (
            <div className="filter-statistics" role="region" aria-label="Application statistics">
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-value">{statistics.total}</span>
                  <span className="stat-label">Total Applications</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value text-yellow-600">{statistics.pending}</span>
                  <span className="stat-label">Pending Review</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value text-green-600">{statistics.approved}</span>
                  <span className="stat-label">Approved</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value text-red-600">{statistics.rejected}</span>
                  <span className="stat-label">Rejected</span>
                </div>
              </div>
            </div>
          )}

          {/* Active Filters Indicator */}
          {hasActiveFilters && (
            <div className="active-filters" role="region" aria-label="Active filters">
              <span className="active-filters-label">Active filters:</span>
              <div className="active-filters-list">
                {filter !== 'all' && (
                  <span className="filter-chip">
                    Status: {FILTER_OPTIONS.find(opt => opt.value === filter)?.label}
                    <button
                      type="button"
                      className="filter-chip-remove"
                      onClick={() => setFilter('all')}
                      aria-label={`Remove status filter: ${filter}`}
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </span>
                )}
                {searchTerm && (
                  <span className="filter-chip">
                    Search: "{searchTerm}"
                    <button
                      type="button"
                      className="filter-chip-remove"
                      onClick={clearSearch}
                      aria-label={`Remove search term: ${searchTerm}`}
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}