import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './projects.css';

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'projects'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const projectsData = [];
      querySnapshot.forEach((doc) => {
        projectsData.push({ ...doc.data(), id: doc.id });
      });
      setProjects(projectsData);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="projects-container">
      {/* Fixed Upload Button */}
      <div className="upload-button-container">
        <Link to="/projects/upload-project">
          <Button variant="contained" color="primary">Upload a Project</Button>
        </Link>
      </div>

      {/* Projects List Expands Downwards */}
      <div className="projects-list">
        {projects.map((project) => (
          <div key={project.id} className="project-card">
            {project.imageUrl ? (
              <img src={project.imageUrl} alt={project.title} className="project-image" />
            ) : (
              <div className="project-image-placeholder">Image not available</div>
            )}
            <div className="project-details">
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <p>{`Needed: ${project.goal}`}</p>
              <Link to={`/projects/${project.id}`}>View Project</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Projects;
