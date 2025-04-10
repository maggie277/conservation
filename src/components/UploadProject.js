import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { Button, TextField, CircularProgress } from '@mui/material';
import './UploadProject.css';

// Constants for categories and tags (aligned with ProjectFilters)
const CATEGORIES = [
  'Crop Farming', 
  'Livestock', 
  'Agroforestry',
  'Water Conservation',
  'Soil Restoration'
];

const TAGS = [
  'Smallholder', 
  'Women-led', 
  'Organic', 
  'Drought-resistant',
  'Community Project'
];

const UploadProject = () => {
  const [project, setProject] = useState({
    title: '',
    description: '',
    goal: '',
    imageUrl: '',
    pdfUrl: '',
    category: '',
    tags: []
  });

  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const mandatoryFields = {
    farmer: ['firstName', 'lastName', 'nrcPassport'],
    cooperative: ['cooperativeName', 'cooperativeAddress', 'cooperativePhone', 'missionStatement'],
  };

  useEffect(() => {
    const checkProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const q = query(collection(db, 'users'), where('uid', '==', user.uid));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const profileData = querySnapshot.docs[0].data();
            const profileType = profileData.type || 'farmer';
            const requiredFields = mandatoryFields[profileType];

            const isComplete = requiredFields.every((field) => {
              const value = profileData[field];
              return value !== null && value !== undefined && value.toString().trim() !== '';
            });

            setProfileComplete(isComplete);
          }
        } catch (err) {
          console.error('Error checking profile:', err);
          setError('Failed to verify profile completion');
        }
      }
      setLoading(false);
    };

    checkProfile();
  }, []);

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleTagChange = (tag) => {
    setProject(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image file is too large. Maximum size is 5MB.');
      return;
    }

    setUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');

    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dz5gjdu9v/image/upload',
        formData
      );

      if (!res.data.secure_url) {
        throw new Error('Cloudinary response does not contain image URL');
      }

      setProject((prev) => ({ ...prev, imageUrl: res.data.secure_url }));
    } catch (err) {
      console.error('Error uploading image', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handlePdfChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    const MAX_PDF_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_PDF_SIZE) {
      setError('PDF file is too large. Maximum size is 10MB.');
      return;
    }

    setUploadingPdf(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');
    try {
      const res = await axios.post(
        'https://api.cloudinary.com/v1_1/dz5gjdu9v/upload',
        formData
      );

      if (!res.data.secure_url) {
        throw new Error('Cloudinary response does not contain PDF URL');
      }

      setProject((prev) => ({ ...prev, pdfUrl: res.data.secure_url }));
    } catch (err) {
      console.error('Error uploading PDF', err);
      setError('Failed to upload PDF. Please try again.');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!profileComplete) {
      setError('Please complete your profile before uploading a project.');
      navigate('/profile');
      return;
    }

    if (!project.imageUrl) {
      setError('Please upload a project image before submitting.');
      return;
    }

    if (!project.category) {
      setError('Please select a category for your project.');
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('No user is logged in.');
        return;
      }

      await addDoc(collection(db, 'projects'), {
        title: project.title,
        description: project.description,
        goal: project.goal,
        imageUrl: project.imageUrl,
        pdfUrl: project.pdfUrl || null,
        userId: user.uid,
        createdAt: new Date(),
        category: project.category,
        tags: project.tags,
        status: 'active'
      });

      navigate('/projects');
    } catch (err) {
      console.error('Error uploading project', err);
      setError('Failed to save project. Please try again.');
    }
  };

  if (loading) {
    return <div className="loading-container"><CircularProgress /></div>;
  }

  if (!profileComplete) {
    return (
      <div className="profile-incomplete-container">
        <h2>Upload a New Farming Project</h2>
        <p>Please complete your profile before uploading a project.</p>
        <Button 
          variant="contained" 
          onClick={() => navigate('/profile')}
          className="complete-profile-btn"
        >
          Complete Your Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="upload-project-container">
      <div className="upload-project-content">
        <h1 className="upload-project-header">Upload a New Farming Project</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form className="upload-project-form" onSubmit={handleSubmit}>
          <TextField
            name="title"
            label="Project Title"
            value={project.title}
            onChange={handleChange}
            fullWidth
            required
            className="project-input"
            placeholder="e.g. Maize Farming Expansion"
          />
          
          <TextField
            name="description"
            label="Project Description"
            value={project.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={4}
            required
            className="project-input"
            placeholder="Describe your farming project in detail..."
          />
          
          <TextField
            name="goal"
            label="Funding Goal (ZMW)"
            type="text"
            value={project.goal}
            onChange={(e) => {
              const value = e.target.value;
              if (/^ZMW?\d*$/.test(value)) {
                setProject((prev) => ({ ...prev, goal: value.startsWith('ZMW') ? value : `ZMW${value}` }));
              }
            }}
            required
            className="project-input"
            placeholder="e.g. ZMW5000"
          />

          <div className="form-section">
            <h4>Farming Category (Required)</h4>
            <select 
              value={project.category}
              onChange={(e) => setProject({...project, category: e.target.value})}
              required
              className="category-select"
            >
              <option value="">Select a farming category</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="form-section">
            <h4>Project Characteristics (Select all that apply)</h4>
            <div className="tags-container">
              {TAGS.map(tag => (
                <label key={tag} className="tag-label">
                  <input
                    type="checkbox"
                    checked={project.tags.includes(tag)}
                    onChange={() => handleTagChange(tag)}
                  />
                  <span className="tag-text">{tag}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="upload-section">
            <h3 className="upload-section-header">Project Image</h3>
            <p className="upload-section-description">
              Upload a cover image for your project (required, max 5MB)
            </p>
            <Button 
              variant="contained" 
              component="label" 
              className="upload-button"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <CircularProgress size={24} className="upload-spinner" />
                  <span style={{ marginLeft: '8px' }}>Uploading...</span>
                </>
              ) : 'Select Image'}
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            {project.imageUrl && (
              <div className="preview-container">
                <img src={project.imageUrl} alt="Project preview" className="image-preview" />
              </div>
            )}
          </div>

          <div className="upload-section">
            <h3 className="upload-section-header">Project Document (Optional)</h3>
            <p className="upload-section-description">
              Upload additional documentation like business plan (PDF format, max 10MB)
            </p>
            <Button 
              variant="contained" 
              component="label" 
              className="upload-button"
              disabled={uploadingPdf}
            >
              {uploadingPdf ? (
                <>
                  <CircularProgress size={24} className="upload-spinner" />
                  <span style={{ marginLeft: '8px' }}>Uploading...</span>
                </>
              ) : 'Select PDF'}
              <input type="file" hidden accept="application/pdf" onChange={handlePdfChange} />
            </Button>
            {project.pdfUrl && (
              <div className="preview-container">
                <a href={project.pdfUrl} target="_blank" rel="noopener noreferrer" className="pdf-link">
                  View Uploaded Document
                </a>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="contained"
            className="submit-button"
            disabled={uploading || uploadingPdf || !project.imageUrl || !project.category}
          >
            {uploading || uploadingPdf ? 'Uploading...' : 'Submit Farming Project'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default UploadProject;