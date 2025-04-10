import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { Button, TextField } from '@mui/material';
import './ProjectForm.css';

const ProjectForm = ({ currentUser }) => {
  const [project, setProject] = useState({
    title: '',
    description: '',
    goal: '',
    imageUrl: '',
    category: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setProject({ ...project, [e.target.name]: e.target.value });
  };

  const handleTagToggle = (tag) => {
    setProject(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!project.title || !project.description || !project.goal) {
        throw new Error('Please fill all required fields');
      }

      await addDoc(collection(db, "projects"), {
        ...project,
        userId: currentUser.uid,
        createdAt: new Date(),
        fundingGoal: project.goal,
        status: 'active'
      });

      // Reset form
      setProject({
        title: '',
        description: '',
        goal: '',
        imageUrl: '',
        category: '',
        tags: []
      });
      
      alert('Farm project created successfully!');
    } catch (err) {
      console.error("Error uploading project:", err);
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="project-form-container">
      <h2>Create New Farm Project</h2>
      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit}>
        <TextField
          name="title"
          label="Project Title"
          value={project.title}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />
        
        <TextField
          name="description"
          label="Project Description"
          value={project.description}
          onChange={handleChange}
          fullWidth
          multiline
          rows={4}
          margin="normal"
          required
        />
        
        <TextField
          name="goal"
          label="Funding Goal (ZMW)"
          type="number"
          value={project.goal}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
        />

        <div className="form-section">
          <label>Category</label>
          <select
            name="category"
            value={project.category}
            onChange={handleChange}
            className="form-select"
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-section">
          <label>Tags</label>
          <div className="tags-container">
            {TAGS.map(tag => (
              <label key={tag} className="tag-label">
                <input
                  type="checkbox"
                  checked={project.tags.includes(tag)}
                  onChange={() => handleTagToggle(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label>Image URL</label>
          <TextField
            name="imageUrl"
            value={project.imageUrl}
            onChange={handleChange}
            fullWidth
            margin="normal"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          fullWidth
          style={{ marginTop: '20px' }}
        >
          {loading ? 'Creating Project...' : 'Create Farm Project'}
        </Button>
      </form>
    </div>
  );
};

export default ProjectForm;