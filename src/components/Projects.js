import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Button } from '@mui/material';
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

  useEffect(() => {
    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ ...doc.data(), id: doc.id });
      });
      setProjects(projectsData);
      filterProjects(projectsData, activeFilters);
    });

    return () => unsubscribe();
  }, []);

  const filterProjects = (projectsToFilter, filters) => {
    let result = [...projectsToFilter];
    
    if (filters.category !== 'All') {
      result = result.filter(project => project.category === filters.category);
    }

    if (filters.tags.length > 0) {
      result = result.filter(project => 
        project.tags && filters.tags.every(tag => project.tags.includes(tag))
      );
    }

    setFilteredProjects(result);
  };

  const handleFilterChange = (newFilters) => {
    setActiveFilters(newFilters);
    filterProjects(projects, newFilters);
  };

  return (
    <div className="projects-container">
      {/* Fixed Upload Button */}
      <div className="upload-button-container">
        <Link to="/projects/upload-project">
          <Button variant="contained" color="primary">Upload a Project</Button>
        </Link>
      </div>

      {/* Project Filters */}
      <ProjectFilters onFilterChange={handleFilterChange} />

      {/* Projects List Expands Downwards */}
      <div className="projects-list">
        {(filteredProjects.length > 0 ? filteredProjects : projects).map((project) => (
          <div key={project.id} className="project-card">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.title} className="project-image" />
            ) : (
              <div className="project-image-placeholder">Image not available</div>
            )}
            <div className="project-details">
              <h2>{project.title}</h2>
              {project.category && (
                <span className="project-category">{project.category}</span>
              )}
              <p>{project.description}</p>
              <p>{`Needed: ${project.goal}`}</p>
              {project.tags && project.tags.length > 0 && (
                <div className="project-tags">
                  {project.tags.map(tag => (
                    <span key={tag} className="project-tag">{tag}</span>
                  ))}
                </div>
              )}
              <Link to={`/projects/${project.id}`}>View Project</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;