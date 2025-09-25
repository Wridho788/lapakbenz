import React, { useState, useRef, useEffect } from 'react';
import { useChapters } from '../api/hooks';
import './ChapterFilter.css';

interface Chapter {
  id: string;
  name: string;
  code?: string;
}

interface ChapterFilterProps {
  selectedChapters: string[];
  onSelectionChange: (selectedChapters: string[]) => void;
  disabled?: boolean;
}

const ChapterFilter: React.FC<ChapterFilterProps> = ({
  selectedChapters,
  onSelectionChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Fetch chapters data
  const { data: chaptersData, isLoading, error } = useChapters({ limit: 200, offset: 0 });
  const chapters: Chapter[] = chaptersData?.content?.result || [];

  // Filter chapters based on search query
  const filteredChapters = chapters.filter((chapter) =>
    chapter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (chapter.code && chapter.code.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // CHANGED: Handle single selection toggle
  const handleChapterToggle = (chapterId: string) => {
    if (disabled) return;

    console.log('🔍 Chapter toggle clicked:', chapterId);
    console.log('📋 Current selection:', selectedChapters);
    
    const isCurrentlySelected = selectedChapters.includes(chapterId);
    
    if (isCurrentlySelected) {
      // If already selected, deselect it (empty array for single selection)
      onSelectionChange([]);
      console.log('🔄 Deselected chapter:', chapterId);
    } else {
      // Select this chapter only (single selection - replace any existing)
      onSelectionChange([chapterId]);
      console.log('✅ Selected single chapter:', chapterId);
    }
  };

  // CHANGED: Remove Select All functionality for single selection
  const handleClearSelection = () => {
    if (disabled) return;
    onSelectionChange([]);
    console.log('🧹 Cleared chapter selection');
  };

  // CHANGED: Updated display text for single selection
  const getSelectedChapterNames = () => {
    if (selectedChapters.length === 0) return 'All Chapters';
    
    const selectedChapter = chapters.find(c => c.id === selectedChapters[0]);
    if (selectedChapter) {
      return selectedChapter.code ? 
        `${selectedChapter.name} (${selectedChapter.code})` : 
        selectedChapter.name;
    }
    
    return 'Unknown Chapter';
  };


  if (error) {
    console.error('Chapter filter error:', error);
  }

  return (
    <div className="chapter-filter" ref={dropdownRef}>
      <button
        className={`chapter-filter-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        type="button"
      >
        <span className="chapter-filter-text">{getSelectedChapterNames()}</span>
        <svg
          className={`chapter-filter-icon ${isOpen ? 'rotated' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="chapter-filter-dropdown">
          <div className="chapter-filter-header">
            <div className="chapter-filter-search">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search chapters..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="chapter-filter-search-input"
              />
              <svg
                className="chapter-filter-search-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.333 12.667A5.333 5.333 0 1 0 7.333 2a5.333 5.333 0 0 0 0 10.667ZM14 14l-2.9-2.9"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            
            {/* CHANGED: Single selection actions */}
            <div className="chapter-filter-actions">
              <span className="chapter-filter-info">Select one chapter</span>
              {selectedChapters.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="chapter-filter-action-btn clear-btn"
                >
                  Clear Selection
                </button>
              )}
            </div>
          </div>

          <div className="chapter-filter-list">
            {isLoading && (
              <div className="chapter-filter-loading">
                <span>Loading chapters...</span>
              </div>
            )}

            {!isLoading && filteredChapters.length === 0 && (
              <div className="chapter-filter-empty">
                <span>No chapters found</span>
              </div>
            )}

            {!isLoading && filteredChapters.map((chapter) => {
              const isSelected = selectedChapters.includes(chapter.id);
              
              return (
                <label 
                  key={chapter.id} 
                  className={`chapter-filter-item ${isSelected ? 'selected' : ''}`}
                >
                  {/* CHANGED: Using radio button behavior for single selection */}
                  <input
                    type="radio"
                    name="chapter-selection"
                    checked={isSelected}
                    onChange={() => handleChapterToggle(chapter.id)}
                    className="chapter-filter-radio"
                    disabled={disabled}
                  />
                  <span className="chapter-filter-radio-mark"></span>
                  <span className="chapter-filter-label">
                    {chapter.name}
                    {chapter.code && (
                      <span className="chapter-filter-code"> ({chapter.code})</span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>

          {/* CHANGED: Updated footer for single selection */}
          <div className="chapter-filter-footer">
            {selectedChapters.length > 0 ? (
              <span className="chapter-filter-count selected">
                ✓ {getSelectedChapterNames()} selected
              </span>
            ) : (
              <span className="chapter-filter-count">
                Choose from {chapters.length} available chapters
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterFilter;