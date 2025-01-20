import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Button, TextField } from '@mui/material';

const ProjectForm = () => {
  const [project, setProject] = useState({
    title: '',
    description: '',
    goal: '',
    imageUrl: ''
  });

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'projects'), project);
      setProject({ title: '', description: '', goal: '', imageUrl: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField name="title" label="Title" value={project.title} onChange={handleChange} fullWidth />
      <TextField name="description" label="Description" value={project.description} onChange={handleChange} fullWidth multiline />
      <TextField name="goal" label="Funding Goal" value={project.goal} onChange={handleChange} fullWidth />
      <TextField name="imageUrl" label="Image URL" value={project.imageUrl} onChange={handleChange} fullWidth />
      <Button type="submit" color="primary" variant="contained">Create Project</Button>
    </form>
  );
};

export default ProjectForm;
