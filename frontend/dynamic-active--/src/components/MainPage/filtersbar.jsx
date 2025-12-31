import React from 'react';
import './filtersbar.css';

const FiltersBar = () => {
  return (
    <div className="filters-bar">
      <div className="filter-tags">
        <span className="filter-tag">
          Category: Prototyping, Not Urgent
          <button className="remove-filter">×</button>
        </span>
        <button className="reset-btn">Reset</button>
        <button className="add-filter-btn">⚡ Add Filter</button>
      </div>

      <div className="view-controls">
        <button className="sort-btn">⇅ Date Created</button>
        <button className="view-btn active">⊞</button>
        <button className="view-btn">☰</button>
      </div>
    </div>
  );
};

export default FiltersBar;