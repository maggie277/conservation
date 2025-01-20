import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { List, ListItem, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';

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
    <List>
      {projects.map((project) => (
        <ListItem button component={Link} to={`/projects/${project.id}`} key={project.id}>
          <ListItemText primary={project.title} secondary={`Needed: ${project.goal}`} />
        </ListItem>
      ))}
    </List>
  );
};

export default Projects;
