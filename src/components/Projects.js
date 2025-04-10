import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import ProjectFilters from './ProjectFilters';
import './projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    category: 'All',
    tags: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        title: doc.data().title || 'Untitled Project',
        description: doc.data().description || '',
        category: doc.data().category || 'Uncategorized',
        goal: doc.data().fundingGoal || doc.data().goal || '0',
        tags: doc.data().tags || [],
        imageUrl: doc.data().imageUrl || null,
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
      setProjects(projectsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = [...projects];
    
    if (activeFilters.category !== 'All') {
      result = result.filter(p => p.category === activeFilters.category);
    }

    if (activeFilters.tags.length > 0) {
      result = result.filter(p => 
        p.tags?.some(tag => activeFilters.tags.includes(tag))
      );
    }

    setFilteredProjects(result);
  }, [projects, activeFilters]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading farm projects...</p>
      </div>
    );
  }

  const displayProjects = filteredProjects.length > 0 ? filteredProjects : projects;

  return (
    <div className="projects-page">
      <div className="projects-header">
        <h1>Sustainable Farm Projects</h1>
        <p>Support Zambian farmers and land restoration initiatives</p>
      </div>

      <ProjectFilters 
        onFilterChange={handleFilterChange}
        availableCategories={[
          'All', 
          'Crop Farming', 
          'Livestock', 
          'Agroforestry',
          'Water Conservation',
          'Soil Restoration'
        ]}
        availableTags={[
          'Smallholder', 
          'Women-led', 
          'Organic', 
          'Drought-resistant',
          'Community Project'
        ]}
      />

      <div className="projects-grid">
        {displayProjects.length > 0 ? (
          displayProjects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-image-container">
                {project.imageUrl ? (
                  <img 
                    src={project.imageUrl} 
                    alt={project.title}
                    className="project-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      e.target.parentNode.classList.add('image-error');
                    }}
                  />
                ) : (
                  <div className="image-placeholder">
                    <img src="/farm-placeholder.png" alt="Farm project" />
                  </div>
                )}
              </div>
              
              <div className="project-content">
                <h3>{project.title}</h3>
                <div className="project-meta">
                  <span className="category">{project.category}</span>
                  <span className="goal">ZMW {project.goal}</span>
                </div>
                
                <p className="project-description">
                  {project.description.length > 100 ? (
                    <>
                      {project.description.substring(0, 100)}...
                    </>
                  ) : (
                    project.description
                  )}
                </p>
                
                {project.tags?.length > 0 && (
                  <div className="tags">
                    {project.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                
                <Link 
                  to={`/projects/${project.id}`}
                  className="details-link"
                >
                  View Farm Details
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="no-projects">
            <h3>No farm projects found matching your filters</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;