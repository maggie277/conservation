import React, { useState } from 'react';
import { useCreateProject } from '../hooks/useCreateProject';
import { USER_TYPES, PROJECT_CATEGORIES, CONSERVATION_PRACTICES } from '../constants';
import { useAuth } from '../context/AuthContext';

const ProjectForm = () => {
  const { currentUser } = useAuth();
  const [project, setProject] = useState({
    title: '',
    description: '',
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
  const { createProject, loading, error } = useCreateProject(currentUser?.type);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProject(project);
      // Redirect or show success message
    } catch (err) {
      console.error('Project creation failed:', err);
    }
  };

  const getAvailableCategories = () => {
    switch (currentUser?.type) {
      case USER_TYPES.NGO:
        return [
          PROJECT_CATEGORIES.SUSTAINABLE_AGRICULTURE,
          PROJECT_CATEGORIES.LAND_CONSERVATION,
          PROJECT_CATEGORIES.WATER_CONSERVATION
        ];
      case USER_TYPES.FARMER:
      case USER_TYPES.COOPERATIVE:
        return Object.values(PROJECT_CATEGORIES);
      case USER_TYPES.EXPERT:
        return [
          PROJECT_CATEGORIES.SOIL_RESTORATION,
          PROJECT_CATEGORIES.REGENERATIVE_AGRICULTURE
        ];
      default:
        return [];
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create New {currentUser?.type === USER_TYPES.NGO ? 'Conservation' : 'Agricultural'} Project</h2>
      
      <div>
        <label>Project Title</label>
        <input
          type="text"
          name="title"
          value={project.title}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Description</label>
        <textarea
          name="description"
          value={project.description}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Category</label>
        <select
          name="category"
          value={project.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          {getAvailableCategories().map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Show sustainability fields for conservation projects */}
      {[
        PROJECT_CATEGORIES.SUSTAINABLE_AGRICULTURE,
        PROJECT_CATEGORIES.LAND_CONSERVATION
      ].includes(project.category) && (
        <div className="sustainability-fields">
          <h3>Sustainability Metrics</h3>
          
          <div>
            <label>Water Saved/Year</label>
            <input
              type="text"
              name="waterSaved"
              value={project.sustainabilityMetrics.waterSaved}
              onChange={handleSustainabilityChange}
              placeholder="e.g., 5000 liters/year"
            />
          </div>

          <div>
            <label>Land Size (hectares)</label>
            <input
              type="text"
              name="landSize"
              value={project.landSize}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Conservation Practices</label>
            {CONSERVATION_PRACTICES.map(practice => (
              <div key={practice}>
                <input
                  type="checkbox"
                  id={practice}
                  checked={project.conservationPractices.includes(practice)}
                  onChange={() => {
                    setProject(prev => ({
                      ...prev,
                      conservationPractices: prev.conservationPractices.includes(practice)
                        ? prev.conservationPractices.filter(p => p !== practice)
                        : [...prev.conservationPractices, practice]
                    }));
                  }}
                />
                <label htmlFor={practice}>{practice}</label>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Project'}
      </button>
    </form>
  );
};

export default ProjectForm;