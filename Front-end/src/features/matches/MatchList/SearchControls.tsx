import React from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { FaFilter } from 'react-icons/fa';

interface SearchControlsProps {
  searchQuery: string;
  handleSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  clearSearch: () => void;
  openFiltersModal: () => void;
  getActiveFiltersCount: () => number;
}

export const SearchControls: React.FC<SearchControlsProps> = ({
  searchQuery,
  handleSearchChange,
  clearSearch,
  openFiltersModal,
  getActiveFiltersCount
}) => {
  return (
    <div className="search-controls">
      <div className="search-and-filter">
        <div className="search-container">
          <SearchIcon className="search-icon" />
          <input
            type="text"
            placeholder="Buscar partidas..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchQuery && (
            <button className="clear-search" onClick={clearSearch}>
              <ClearIcon />
            </button>
          )}
        </div>

        <button
          className="advanced-filters-toggle"
          onClick={openFiltersModal}
        >
          <FaFilter /> Filtros
          {getActiveFiltersCount() > 0 && (
            <span className="filter-count-badge">{getActiveFiltersCount()}</span>
          )}
        </button>
      </div>
    </div>
  );
};