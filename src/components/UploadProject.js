import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Button, TextField } from '@mui/material';

const UploadProject = () => {
  const [project, setProject] = useState({
    title: '',
    description: '',
    goal: '',
    imageUrl: '' // Ensuring this gets updated before sending to Firebase
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default"); // Replace with your Cloudinary preset

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/dz5gjdu9v/image/upload", // Replace with your Cloudinary URL
        formData
      );

      console.log('Image URL:', res.data.secure_url); // Log the image URL for debugging

      // Update the state with the uploaded image URL
      setProject((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error("Error uploading image", err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!project.imageUrl) {
      alert("Please upload an image before submitting.");
      return;
    }

    try {
      await addDoc(collection(db, 'projects'), project);
      navigate('/projects'); // Redirect after submission
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
            if (/^K?\d*$/.test(value)) {  
              setProject((prev) => ({ ...prev, goal: value.startsWith("K") ? value : `K${value}` }));
            }
          }} 
          required
        />

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          id="file-input"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {/* Upload Button */}
        <Button
          variant="contained"
          component="label"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload Image"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </Button>

        {/* Show Image Preview if Uploaded */}
        {project.imageUrl && (
          <div>
            <img src={project.imageUrl} alt="Preview" width="150" />
          </div>
        )}

        <Button type="submit" variant="contained" color="primary" disabled={uploading}>
          Submit Project
        </Button>
      </form>
    </div>
  );
};

export default UploadProject;
