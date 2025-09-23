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

  const handleChapterToggle = (chapterId: string) => {
    if (selectedChapters.includes(chapterId)) {
      onSelectionChange(selectedChapters.filter(id => id !== chapterId));
    } else {
      onSelectionChange([...selectedChapters, chapterId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedChapters.length === filteredChapters.length) {
      // Deselect all filtered chapters
      const filteredIds = filteredChapters.map(chapter => chapter.id);
      onSelectionChange(selectedChapters.filter(id => !filteredIds.includes(id)));
    } else {
      // Select all filtered chapters
      const filteredIds = filteredChapters.map(chapter => chapter.id);
      const newSelection = [...new Set([...selectedChapters, ...filteredIds])];
      onSelectionChange(newSelection);
    }
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const getSelectedChapterNames = () => {
    if (selectedChapters.length === 0) return 'All Chapters';
    if (selectedChapters.length === 1) {
      const chapter = chapters.find(c => c.id === selectedChapters[0]);
      return chapter ? chapter.name : 'Unknown Chapter';
    }
    return `${selectedChapters.length} chapters selected`;
  };

  const allFilteredSelected = filteredChapters.length > 0 && 
    filteredChapters.every(chapter => selectedChapters.includes(chapter.id));

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
            
            <div className="chapter-filter-actions">
              <button
                type="button"
                onClick={handleSelectAll}
                className="chapter-filter-action-btn"
                disabled={filteredChapters.length === 0}
              >
                {allFilteredSelected ? 'Deselect All' : 'Select All'}
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="chapter-filter-action-btn"
                disabled={selectedChapters.length === 0}
              >
                Clear All
              </button>
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

            {!isLoading && filteredChapters.map((chapter) => (
              <label key={chapter.id} className="chapter-filter-item">
                <input
                  type="checkbox"
                  checked={selectedChapters.includes(chapter.id)}
                  onChange={() => handleChapterToggle(chapter.id)}
                  className="chapter-filter-checkbox"
                />
                <span className="chapter-filter-checkmark"></span>
                <span className="chapter-filter-label">
                  {chapter.name}
                  {chapter.code && (
                    <span className="chapter-filter-code"> ({chapter.code})</span>
                  )}
                </span>
              </label>
            ))}
          </div>

          {selectedChapters.length > 0 && (
            <div className="chapter-filter-footer">
              <span className="chapter-filter-count">
                {selectedChapters.length} of {chapters.length} chapters selected
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChapterFilter;