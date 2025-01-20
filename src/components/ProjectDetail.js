import React from 'react';
import { useParams } from 'react-router-dom';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '../firebaseConfig';
import { doc } from 'firebase/firestore';
import { Paper, Typography } from '@mui/material';
import { FacebookShareButton, TwitterShareButton } from 'react-share';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project] = useDocumentData(doc(db, 'projects', projectId));

  if (!project) return <p>Loading...</p>;

  return (
    <Paper>
      <Typography variant="h4">{project.title}</Typography>
      <Typography variant="body1">{project.description}</Typography>
      <Typography variant="body2">Goal: {project.goal}</Typography>
      <img src={project.imageUrl} alt={project.title} style={{ width: '100%' }} />
      <FacebookShareButton url={window.location.href}>
        Share on Facebook
      </FacebookShareButton>
      <TwitterShareButton url={window.location.href}>
        Share on Twitter
      </TwitterShareButton>
    </Paper>
  );
};

export default ProjectDetail;
