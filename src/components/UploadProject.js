import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../firebaseConfig';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { 
  Button, 
  TextField, 
  CircularProgress, 
  Checkbox, 
  FormControlLabel, 
  Alert,
  InputAdornment,
  Tooltip
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import './UploadProject.css';

const CATEGORIES = [
  'Crop Farming', 
  'Livestock', 
  'Agroforestry',
  'Water Conservation',
  'Soil Restoration',
  'Sustainable Agriculture',
  'Land Conservation',
  'Conservation Farming',
  'Regenerative Agriculture'
];

const SUSTAINABLE_CATEGORIES = [
  'Sustainable Agriculture',
  'Land Conservation',
  'Conservation Farming',
  'Regenerative Agriculture'
];

const TAGS = [
  'Smallholder',
  'Large-scale',
  'Women-led',
  'Youth-led',
  'Community-led',
  'Organic',
  'Permaculture',
  'Conservation Agriculture',
  'Drought-resistant',
  'Climate-smart',
  'Erosion-control',
  'Community Project',
  'Research Project',
  'Educational Project'
];

const CONSERVATION_PRACTICES = [
  'Terracing',
  'Cover Cropping',
  'Crop Rotation',
  'Agroforestry',
  'Reduced Tillage',
  'Composting',
  'Water Harvesting'
];

const UploadProject = () => {
  const [project, setProject] = useState({
    title: '',
    description: '',
    goal: '',
    imageUrl: '',
    pdfUrl: '',
    category: '',
    tags: [],
    sustainabilityMetrics: {
      waterSaved: '',
      carbonSequestration: '',
      biodiversityImpact: ''
    },
    landSize: '',
    conservationPractices: []
  });

  const [uploading, setUploading] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkProfile = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const profileData = userDoc.data();
            const profileType = profileData.type || 'farmer';
            
            const requiredCommonFields = ['displayName', 'bio'];
            
            const typeSpecificFields = {
              farmer: ['nrcPassport', 'address'],
              cooperative: ['cooperativeId', 'cooperativeAddress'],
              donor: []
            };
            
            const requiredFields = [...requiredCommonFields, ...(typeSpecificFields[profileType] || [])];
            
            const isComplete = requiredFields.every(field => {
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

  const handleSustainabilityChange = (e) => {
    setProject({
      ...project,
      sustainabilityMetrics: {
        ...project.sustainabilityMetrics,
        [e.target.name]: e.target.value
      }
    });
  };

  const handleTagChange = (tag) => {
    setProject(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handlePracticeChange = (practice) => {
    setProject(prev => ({
      ...prev,
      conservationPractices: prev.conservationPractices.includes(practice)
        ? prev.conservationPractices.filter(p => p !== practice)
        : [...prev.conservationPractices, practice]
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

    if (SUSTAINABLE_CATEGORIES.includes(project.category)) {
      if (!project.sustainabilityMetrics.waterSaved || 
          !project.sustainabilityMetrics.carbonSequestration) {
        setError('Please fill all required sustainability metrics');
        return;
      }
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('No user is logged in.');
        return;
      }

      const projectData = {
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
      };

      if (project.sustainabilityMetrics.waterSaved || 
          project.sustainabilityMetrics.carbonSequestration || 
          project.sustainabilityMetrics.biodiversityImpact) {
        projectData.sustainabilityMetrics = project.sustainabilityMetrics;
      }

      if (project.landSize) {
        projectData.landSize = project.landSize;
      }

      if (project.conservationPractices.length > 0) {
        projectData.conservationPractices = project.conservationPractices;
      }

      await addDoc(collection(db, 'projects'), projectData);
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
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please complete your profile before uploading a project
        </Alert>
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
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

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
            type="number"
            value={project.goal}
            onChange={(e) => {
              const value = e.target.value;
              if (/^\d*$/.test(value)) {
                setProject(prev => ({ ...prev, goal: value }));
              }
            }}
            required
            className="project-input"
            placeholder="e.g. 5000"
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*'
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start">ZMW</InputAdornment>,
            }}
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

          {SUSTAINABLE_CATEGORIES.includes(project.category) && (
            <>
              <div className="form-section">
                <h4>Sustainability Metrics</h4>
                <div className="metrics-grid">
                  <TextField
                    name="waterSaved"
                    label="Estimated Water Saved (liters/year)"
                    value={project.sustainabilityMetrics.waterSaved}
                    onChange={handleSustainabilityChange}
                    fullWidth
                    required
                    className="project-input"
                    placeholder="e.g. 5000"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Estimate annual water savings compared to conventional methods">
                            <HelpOutlineIcon color="action" />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    name="carbonSequestration"
                    label="Estimated Carbon Sequestration (tons CO2/year)"
                    value={project.sustainabilityMetrics.carbonSequestration}
                    onChange={handleSustainabilityChange}
                    fullWidth
                    required
                    className="project-input"
                    placeholder="e.g. 2"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Estimate annual carbon sequestration potential">
                            <HelpOutlineIcon color="action" />
                          </Tooltip>
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    name="biodiversityImpact"
                    label="Biodiversity Impact"
                    value={project.sustainabilityMetrics.biodiversityImpact}
                    onChange={handleSustainabilityChange}
                    fullWidth
                    className="project-input"
                    placeholder="e.g. Increased pollinator presence"
                  />
                </div>
              </div>

              <div className="form-section">
                <h4>Land Size (Optional)</h4>
                <TextField
                  name="landSize"
                  label="Total Land Area (hectares)"
                  value={project.landSize}
                  onChange={handleChange}
                  fullWidth
                  className="project-input"
                  placeholder="e.g. 5"
                />
              </div>

              <div className="form-section">
                <h4>Conservation Practices (Select all that apply)</h4>
                <div className="practices-container">
                  {CONSERVATION_PRACTICES.map(practice => (
                    <FormControlLabel
                      key={practice}
                      control={
                        <Checkbox
                          checked={project.conservationPractices.includes(practice)}
                          onChange={() => handlePracticeChange(practice)}
                        />
                      }
                      label={practice}
                    />
                  ))}
                </div>
              </div>
            </>
          )}

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