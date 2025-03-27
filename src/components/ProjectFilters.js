import React, { useState } from 'react';
import './ProjectFilters.css';

const CATEGORIES = ['All', 'Farming', 'Wildlife', 'Forestry', 'Water Conservation', 'Climate Change'];
const TAGS = [
  'Sustainable Agriculture', 'Organic Farming', 'Wildlife Protection',
  'Reforestation', 'Soil Conservation', 'Water Management'
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
        <h3>Filter by Category</h3>
        <div className="category-filters">
          {CATEGORIES.map(category => (
            <button
              key={category}
              className={`category-filter ${activeCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <h3>Filter by Tags</h3>
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