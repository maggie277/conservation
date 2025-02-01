import React, { useState } from 'react';
import axios from 'axios';
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
  const [selectedImage, setSelectedImage] = useState(null);

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = project.imageUrl;

      if (selectedImage) {
        // Upload image to Cloudinary
        const formData = new FormData();
        formData.append("file", selectedImage);
        formData.append("upload_preset", "ml_default"); // Use your actual upload preset

        const uploadResponse = await axios.post(
          "https://api.cloudinary.com/v1_1/dz5gjdu9v/image/upload",
          formData
        );

        imageUrl = uploadResponse.data.secure_url; // Get Cloudinary image URL
      }

      // Save the project data to Firestore
      await addDoc(collection(db, "projects"), {
        ...project,
        imageUrl: imageUrl // Save Cloudinary image URL
      });

      // Reset form
      setProject({ title: '', description: '', goal: '', imageUrl: '' });
      setSelectedImage(null);

      console.log('Project added successfully');
    } catch (err) {
      console.error("Error uploading project:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField 
        name="title" 
        label="Title" 
        value={project.title} 
        onChange={handleChange} 
        fullWidth 
      />
      <TextField 
        name="description" 
        label="Description" 
        value={project.description} 
        onChange={handleChange} 
        fullWidth 
        multiline 
      />
      <TextField 
        name="goal" 
        label="Funding Goal" 
        value={project.goal} 
        onChange={handleChange} 
        fullWidth 
      />
      <TextField 
        name="imageUrl" 
        label="Image URL" 
        value={project.imageUrl} 
        onChange={handleChange} 
        fullWidth 
      />
      <input 
        type="file" 
        onChange={handleFileChange} 
      />
      <Button 
        type="submit" 
        color="primary" 
        variant="contained"
      >
        Create Project
      </Button>
    </form>
  );
};

export default ProjectForm;
