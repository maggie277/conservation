import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Button, CircularProgress, Box, Typography, Avatar } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import './ProjectDetail.css';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creatorLoading, setCreatorLoading] = useState(false);
  const navigate = useNavigate();

  const fetchCreatorData = async (userId) => {
    setCreatorLoading(true);
    try {
      const creatorRef = doc(db, 'users', userId);
      const creatorSnap = await getDoc(creatorRef);
      
      if (creatorSnap.exists()) {
        setCreator({ id: creatorSnap.id, ...creatorSnap.data() });
        return;
      }

      const q = query(
        collection(db, 'users'),
        where('uid', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const creatorDoc = querySnapshot.docs[0];
        setCreator({ id: creatorDoc.id, ...creatorDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching creator:', error);
    } finally {
      setCreatorLoading(false);
    }
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectRef = doc(db, 'projects', projectId);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
          navigate('/projects');
          return;
        }

        const projectData = {
          ...projectSnap.data(),
          id: projectSnap.id,
          fundingGoal: projectSnap.data().fundingGoal || projectSnap.data().goal || '0',
          createdAt: projectSnap.data().createdAt || new Date()
        };
        setProject(projectData);

        if (projectData.userId) {
          await fetchCreatorData(projectData.userId);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();

    const unsubscribe = onSnapshot(doc(db, 'projects', projectId), (doc) => {
      if (doc.exists()) {
        setProject({
          ...doc.data(),
          id: doc.id,
          fundingGoal: doc.data().fundingGoal || doc.data().goal || '0',
          createdAt: doc.data().createdAt || new Date()
        });
      }
    });

    return () => unsubscribe();
  }, [projectId, navigate]);

  const handleDonate = () => {
    navigate(`/donate/${projectId}`);
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress />
        <Typography variant="body1">Loading farm project...</Typography>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box className="not-found-container">
        <Typography variant="h5">Farm project not found</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/projects')}
          className="back-button"
        >
          Back to Farm Projects
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

        {creatorLoading ? (
          <div className="creator-loading">Loading farmer information...</div>
        ) : creator ? (
          <div className="creator-section">
            <div className="creator-header">
              <Avatar 
                src={creator.photoURL} 
                className="creator-avatar"
                alt={creator.type === 'cooperative' ? 
                  (creator.organizationName || 'Cooperative') : 
                  (creator.displayName || 'Farmer')}
              >
                {creator.type === 'cooperative' ? <BusinessIcon /> : <PersonIcon />}
              </Avatar>
              <div>
                <Typography variant="h6" className="creator-name">
                  {creator.type === 'cooperative' 
                    ? (creator.organizationName || 'Farming Cooperative')
                    : (creator.displayName || 'Farmer')}
                </Typography>
                {creator.location && (
                  <Typography variant="body2" className="creator-location">
                    {creator.location}
                  </Typography>
                )}
              </div>
            </div>

            {creator.type === 'cooperative' && creator.missionStatement && (
              <Typography variant="body2" className="creator-mission">
                <strong>Our Mission:</strong> {creator.missionStatement}
              </Typography>
            )}
          </div>
        ) : (
          <div className="creator-not-found">
            <Typography variant="body2">
              Farmer information not available
            </Typography>
          </div>
        )}

        <div className="project-meta">
          <Typography variant="body1" className="project-goal">
            <strong>Funding Goal:</strong> ZMW {project.fundingGoal}
          </Typography>
          <Typography variant="body2" className="project-date">
            <strong>Posted on:</strong> {project.createdAt.toDate().toLocaleDateString()}
          </Typography>
        </div>

        {project.imageUrl && (
          <div className="project-image-container">
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
          </div>
        )}

        <div className="project-description-section">
          <Typography variant="h6">Project Details</Typography>
          <Typography variant="body1" className="project-description">
            {project.description}
          </Typography>
        </div>

        {project.tags && project.tags.length > 0 && (
          <div className="project-tags-container">
            <Typography variant="h6">Project Tags</Typography>
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
              <DescriptionIcon /> View Project Proposal
            </a>
          </div>
        )}

        <div className="project-actions">
          <Button 
            variant="contained" 
            className="donate-button"
            onClick={handleDonate}
          >
            Support This Farm
          </Button>
          <Button 
            variant="outlined" 
            className="back-button"
            onClick={() => navigate('/projects')}
          >
            View All Projects
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;