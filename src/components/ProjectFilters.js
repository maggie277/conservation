import React, { useState } from 'react';
import './ProjectFilters.css';

// Constants aligned with UploadProject
const CATEGORIES = [
  'All',
  'Crop Farming', 
  'Livestock', 
  'Agroforestry',
  'Water Conservation',
  'Soil Restoration'
];

const TAGS = [
  'Smallholder', 
  'Women-led', 
  'Organic', 
  'Drought-resistant',
  'Community Project'
];

const ProjectFilters = ({ onFilterChange }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeTags, setActiveTags] = useState([]);

  const handleCategoryChange = (category) => {
    const newFilters = {
      category,
      tags: activeTags
    };
    setActiveCategory(category);
    onFilterChange(newFilters);
  };

  const handleTagToggle = (tag) => {
    const newTags = activeTags.includes(tag)
      ? activeTags.filter(t => t !== tag)
      : [...activeTags, tag];
    
    const newFilters = {
      category: activeCategory,
      tags: newTags
    };
    
    setActiveTags(newTags);
    onFilterChange(newFilters);
  };

  return (
    <div className="filters-container">
      <div className="filter-section">
        <h3>Filter by Farming Type</h3>
        <div className="category-filters">
          {CATEGORIES.map(category => (
            <button
              key={category}
              className={`category-filter ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category === 'All' ? 'All Farming Projects' : category}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Filter by Project Features</h3>
        <div className="tag-filters">
          {TAGS.map(tag => (
            <button
              key={tag}
              className={`tag-filter ${activeTags.includes(tag) ? 'active' : ''}`}
              onClick={() => handleTagToggle(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;