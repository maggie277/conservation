import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';
import { Typography } from '@mui/material';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProject(docSnap.data());
      }
    };

    fetchProject();
  }, [projectId]);

  if (!project) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <Typography variant="h4">{project.title}</Typography>
      <Typography variant="body1">{project.description}</Typography>
      <Typography variant="body2">Goal: ${project.goal}</Typography>
    </div>
  );
};

export default ProjectDetail;
