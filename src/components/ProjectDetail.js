import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@mui/material';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProject = async () => {
      const docRef = doc(db, 'projects', projectId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProject(docSnap.data());
      } else {
        console.log('No such document!');
      }
    };

    fetchProject();
  }, [projectId]);

  const handleDonate = () => {
    navigate(`/donate/${projectId}`);
  };

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      <p>Needed: {project.goal}</p>
      <Button variant="contained" color="primary" onClick={handleDonate}>Donate</Button>
    </div>
  );
};

export default ProjectDetail;
