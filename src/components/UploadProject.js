import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Button, TextField } from '@mui/material';

const UploadProject = () => {
  const [project, setProject] = useState({
    title: '',
    description: '',
    goal: '',
    imageUrl: '', // Ensure this gets updated before submission
  });

  const [uploading, setUploading] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false); // Track if profile is complete
  const [loading, setLoading] = useState(true); // Add loading state
  const navigate = useNavigate();

  // Define mandatory fields for individual and organization profiles
  const mandatoryFields = {
    individual: ['firstName', 'lastName', 'age', 'nrcPassport'], // Updated to match your profile data
    organization: ['organizationName', 'organizationAddress', 'organizationPhone', 'organizationWebsite', 'missionStatement'],
  };

  // Check if the user's profile is complete
  useEffect(() => {
    const checkProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        const q = query(collection(db, 'users'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const profileData = querySnapshot.docs[0].data();
          const profileType = profileData.type; // 'individual' or 'organization'
          const requiredFields = mandatoryFields[profileType];

          // Log the profile data for debugging
          console.log('Profile Data:', profileData);

          // Check if all mandatory fields are filled
          const isComplete = requiredFields.every((field) => {
            const value = profileData[field];
            return value !== null && value !== undefined && value.toString().trim() !== '';
          });

          console.log('Profile Complete:', isComplete);
          setProfileComplete(isComplete);
        }
      }
      setLoading(false); // Set loading to false after checking
    };

    checkProfile();
  }, []);

  // Handle text input changes
  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  // Handle file upload to Cloudinary
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Replace with your Cloudinary preset

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dz5gjdu9v/image/upload', // Replace with your Cloudinary URL
        formData
      );

      if (!res.data.secure_url) {
        throw new Error('Cloudinary response does not contain image URL');
      }

      console.log('Image Uploaded Successfully:', res.data.secure_url);

      // Update the state with the uploaded image URL
      setProject((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error('Error uploading image', err);
    } finally {
      setUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!profileComplete) {
      alert('Please complete all mandatory fields in your profile before uploading a project.');
      navigate('/profile'); // Redirect to profile page
      return;
    }

    if (!project.imageUrl) {
      alert('Please upload an image before submitting.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        console.error('No user is logged in.');
        return;
      }

      // Add project to Firestore with the user's UID
      await addDoc(collection(db, 'projects'), {
        title: project.title,
        description: project.description,
        goal: project.goal,
        imageUrl: project.imageUrl,
        userId: user.uid, // Add the user's UID to the project
      });

      console.log('Project saved successfully:', project);
      navigate('/projects'); // Redirect after successful submission
    } catch (err) {
      console.error('Error uploading project', err);
    }
  };

  // Show loading state while checking profile
  if (loading) {
    return <p>Loading...</p>;
  }

  // If the profile is incomplete, show the "Complete Profile" message
  if (!profileComplete) {
    return (
      <div>
        <h2>Upload a New Project</h2>
        <p>Please complete all mandatory fields in your profile before uploading a project.</p>
        <Button variant="contained" onClick={() => navigate('/profile')}>
          Go to Profile
        </Button>
      </div>
    );
  }

  // If the profile is complete, show the upload form
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
              setProject((prev) => ({ ...prev, goal: value.startsWith('K') ? value : `K${value}` }));
            }
          }}
          required
        />

        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          id="file-input"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Upload Button */}
        <Button variant="contained" component="label" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
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