import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Button, CircularProgress, Box, Typography } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, 'projects', projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProject({ ...docSnap.data(), id: docSnap.id });
        } else {
          console.log('No such document!');
          navigate('/projects');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, navigate]);

  const handleDonate = () => {
    navigate(`/donate/${projectId}`);
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box className="not-found-container">
        <Typography variant="h5">Project not found</Typography>
        <Button variant="contained" onClick={() => navigate('/projects')}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <div className="project-detail-container">
      <div className="project-detail-content">
        <div className="project-header">
          <Typography variant="h2" className="project-title">
            {project.title}
          </Typography>
          
          {project.category && (
            <span className="project-category">{project.category}</span>
          )}
        </div>

        <div className="project-meta">
          <Typography variant="body1" className="project-goal">
            Funding Goal: <strong>{project.goal}</strong>
          </Typography>
        </div>

        {project.imageUrl && (
          <div className="project-image-container">
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="project-image"
            />
          </div>
        )}

        <Typography variant="body1" className="project-description">
          {project.description}
        </Typography>

        {project.tags && project.tags.length > 0 && (
          <div className="project-tags-container">
            <Typography variant="h6">Tags:</Typography>
            <div className="project-tags">
              {project.tags.map(tag => (
                <span key={tag} className="project-tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {project.pdfUrl && (
          <div className="project-document">
            <a 
              href={project.pdfUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="pdf-link"
            >
              <DescriptionIcon /> View Project Document
            </a>
          </div>
        )}

        <div className="project-actions">
          <Button 
            variant="contained" 
            className="donate-button"
            onClick={handleDonate}
          >
            Donate to this Project
          </Button>
          <Button 
            variant="outlined" 
            className="back-button"
            onClick={() => navigate('/projects')}
          >
            Back to Projects
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;