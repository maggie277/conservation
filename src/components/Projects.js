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
    tags: [],
    status: 'All'
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
        fundingGoal: doc.data().fundingGoal || 0,
        fundsReceived: doc.data().fundsReceived || 0,
        status: doc.data().status || 'Active',
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

    if (activeFilters.status !== 'All') {
      result = result.filter(p => p.status === activeFilters.status);
    }

    setFilteredProjects(result);
  }, [projects, activeFilters]);

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Funded': return '#2e7d32';
      case 'Completed': return '#1565c0';
      default: return '#f57c00';
    }
  };

  const calculateProgress = (fundsReceived, fundingGoal) => {
    if (!fundingGoal || fundingGoal === 0) return 0;
    return Math.min(100, (fundsReceived / fundingGoal) * 100);
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
        availableStatuses={['All', 'Active', 'Funded', 'Completed']}
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
                <div 
                  className="project-status-badge"
                  style={{ backgroundColor: getStatusColor(project.status) }}
                >
                  {project.status}
                </div>
              </div>
              
              <div className="project-content">
                <h3>{project.title}</h3>
                <div className="project-meta">
                  <span className="category">{project.category}</span>
                  <span className="goal">ZMW {project.fundingGoal.toLocaleString()}</span>
                </div>
                
                <div className="funding-progress-container">
                  <div className="funding-progress">
                    <div 
                      className="progress-bar"
                      style={{ width: `${calculateProgress(project.fundsReceived, project.fundingGoal)}%` }}
                    ></div>
                  </div>
                  <div className="funding-stats">
                    <span>ZMW {project.fundsReceived.toLocaleString()} raised</span>
                    <span>{Math.round(calculateProgress(project.fundsReceived, project.fundingGoal))}%</span>
                  </div>
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