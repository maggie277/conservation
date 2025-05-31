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
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography
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
    fundingGoal: 0,
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
    conservationPractices: [],
    contactEmail: '',
    contactPhone: '',
    status: 'Active'
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
            
            // Set contact info from profile if available
            setProject(prev => ({
              ...prev,
              contactEmail: profileData.email || '',
              contactPhone: profileData.phone || ''
            }));
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
    const { name, value } = e.target;
    setProject(prev => ({ ...prev, [name]: value }));
  };

  const handleSustainabilityChange = (e) => {
    const { name, value } = e.target;
    setProject(prev => ({
      ...prev,
      sustainabilityMetrics: {
        ...prev.sustainabilityMetrics,
        [name]: value
      }
    }));
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

      setProject(prev => ({ ...prev, imageUrl: res.data.secure_url }));
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

      setProject(prev => ({ ...prev, pdfUrl: res.data.secure_url }));
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
        fundingGoal: Number(project.fundingGoal) || 0,
        fundsReceived: 0,
        imageUrl: project.imageUrl,
        pdfUrl: project.pdfUrl || null,
        userId: user.uid,
        createdAt: new Date(),
        category: project.category,
        tags: project.tags,
        status: 'Active',
        contactEmail: project.contactEmail,
        contactPhone: project.contactPhone
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
      navigate('/profile');
    } catch (err) {
      console.error('Error uploading project', err);
      setError('Failed to save project. Please try again.');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!profileComplete) {
    return (
      <Box className="profile-incomplete-container">
        <Typography variant="h5" gutterBottom>
          Upload a New Farming Project
        </Typography>
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
      </Box>
    );
  }

  return (
    <Box className="upload-project-container">
      <Box className="upload-project-content">
        <Typography variant="h4" className="upload-project-header" gutterBottom>
          Upload a New Farming Project
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Box component="form" className="upload-project-form" onSubmit={handleSubmit}>
          <TextField
            name="title"
            label="Project Title"
            value={project.title}
            onChange={handleChange}
            fullWidth
            required
            margin="normal"
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
            margin="normal"
            placeholder="Describe your farming project in detail..."
          />
          
          <TextField
            name="fundingGoal"
            label="Funding Goal (ZMW)"
            type="number"
            value={project.fundingGoal}
            onChange={handleChange}
            required
            margin="normal"
            placeholder="e.g. 5000"
            inputProps={{
              min: 0,
              step: 1
            }}
            InputProps={{
              startAdornment: <InputAdornment position="start">ZMW</InputAdornment>,
            }}
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Farming Category</InputLabel>
            <Select
              value={project.category}
              onChange={(e) => setProject({...project, category: e.target.value})}
              label="Farming Category"
            >
              {CATEGORIES.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box marginY={2}>
            <Typography variant="subtitle1" gutterBottom>
              Project Characteristics (Select all that apply)
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {TAGS.map(tag => (
                <FormControlLabel
                  key={tag}
                  control={
                    <Checkbox
                      checked={project.tags.includes(tag)}
                      onChange={() => handleTagChange(tag)}
                      size="small"
                    />
                  }
                  label={tag}
                />
              ))}
            </Box>
          </Box>

          {SUSTAINABLE_CATEGORIES.includes(project.category) && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Sustainability Metrics
              </Typography>
              <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={2} marginBottom={2}>
                <TextField
                  name="waterSaved"
                  label="Estimated Water Saved (liters/year)"
                  value={project.sustainabilityMetrics.waterSaved}
                  onChange={handleSustainabilityChange}
                  required
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
                  required
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
                  placeholder="e.g. Increased pollinator presence"
                />
              </Box>

              <TextField
                name="landSize"
                label="Total Land Area (hectares)"
                value={project.landSize}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="e.g. 5"
              />

              <Box marginY={2}>
                <Typography variant="subtitle1" gutterBottom>
                  Conservation Practices (Select all that apply)
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {CONSERVATION_PRACTICES.map(practice => (
                    <FormControlLabel
                      key={practice}
                      control={
                        <Checkbox
                          checked={project.conservationPractices.includes(practice)}
                          onChange={() => handlePracticeChange(practice)}
                          size="small"
                        />
                      }
                      label={practice}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}

          <Box marginY={2}>
            <Typography variant="subtitle1" gutterBottom>
              Contact Information
            </Typography>
            <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(250px, 1fr))" gap={2}>
              <TextField
                name="contactEmail"
                label="Contact Email"
                value={project.contactEmail}
                onChange={handleChange}
                fullWidth
                type="email"
                margin="normal"
              />
              <TextField
                name="contactPhone"
                label="Contact Phone"
                value={project.contactPhone}
                onChange={handleChange}
                fullWidth
                margin="normal"
                placeholder="e.g., 0961234567"
              />
            </Box>
          </Box>

          <Box marginY={2}>
            <Typography variant="subtitle1" gutterBottom>
              Project Image (Required)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload a cover image for your project (max 5MB)
            </Typography>
            <Button 
              variant="contained" 
              component="label" 
              disabled={uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : null}
            >
              {uploading ? 'Uploading...' : 'Select Image'}
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
            {project.imageUrl && (
              <Box marginTop={2}>
                <img 
                  src={project.imageUrl} 
                  alt="Project preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
                />
              </Box>
            )}
          </Box>

          <Box marginY={2}>
            <Typography variant="subtitle1" gutterBottom>
              Project Document (Optional)
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload additional documentation like business plan (PDF format, max 10MB)
            </Typography>
            <Button 
              variant="contained" 
              component="label" 
              disabled={uploadingPdf}
              startIcon={uploadingPdf ? <CircularProgress size={20} /> : null}
            >
              {uploadingPdf ? 'Uploading...' : 'Select PDF'}
              <input type="file" hidden accept="application/pdf" onChange={handlePdfChange} />
            </Button>
            {project.pdfUrl && (
              <Box marginTop={2}>
                <Button 
                  variant="outlined" 
                  href={project.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View Uploaded Document
                </Button>
              </Box>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={uploading || uploadingPdf || !project.imageUrl || !project.category}
            sx={{ marginTop: 3 }}
          >
            {uploading || uploadingPdf ? 'Uploading...' : 'Submit Farming Project'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default UploadProject;