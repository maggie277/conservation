import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Button, TextField } from '@mui/material';

const UploadProject = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [project, setProject] = useState({
    title: '',
    description: '',
    goal: '',
    imageUrl: ''
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setSelectedImage(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("file", selectedImage);
    formData.append("upload_preset", "ml_default");

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dz5gjdu9v/image/upload",
        formData
      );
      setProject((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error("Error uploading image", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'projects'), project);
      navigate('/projects');
    } catch (err) {
      console.error("Error uploading project", err);
    }
  };

  return (
    <div>
      <h2>Upload a New Project</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          name="title"
          label="Title"
          value={project.title}
          onChange={handleChange}
          fullWidth
          required
        />
        <TextField
          name="description"
          label="Description"
          value={project.description}
          onChange={handleChange}
          fullWidth
          multiline
          required
        />
        <TextField
          name="goal"
          label="Funding Goal (e.g. K3000)"
          type="text"
          value={project.goal}
          onChange={(e) => {
            const value = e.target.value;
            if (/^K?\d*$/.test(value)) {  // Allow 'K' and numbers only
              setProject((prev) => ({ ...prev, goal: value.startsWith("K") ? value : `K${value}` }));
            }
          }} 
          required
        />
        <input type="file" onChange={handleFileChange} />
        <Button type="button" onClick={handleUpload} variant="contained">Upload Image</Button>
        {project.imageUrl && <img src={project.imageUrl} alt="Preview" width="100" />}
        <Button type="submit" variant="contained" color="primary">Submit Project</Button>
      </form>
    </div>
  );
};

export default UploadProject;
