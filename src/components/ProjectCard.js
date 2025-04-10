import React, { useState } from "react";
import './ProjectCard.css';

const ProjectCard = ({ 
  project = {},
  handleDeleteProject = () => {},
  isEditing = false,
  editedProject = {},
  setEditedProject = () => {},
  handleEditProject = () => {},
  handleSaveProjectEdit = () => {},
  handleCancelEdit = () => {},
  isProfileView = false
}) => {
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Safely get project data with defaults
  const {
    id = '',
    title = "Untitled Project",
    description = "No description available",
    category = "Uncategorized",
    fundingGoal = 0,
    imageUrl = "https://via.placeholder.com/600x400?text=Project+Image"
  } = project;

  // Safely get edited project data with defaults
  const {
    title: editedTitle = title,
    description: editedDescription = description,
    category: editedCategory = category,
    fundingGoal: editedFundingGoal = fundingGoal,
    imageUrl: editedImageUrl = imageUrl
  } = editedProject;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: title,
        text: description.substring(0, 100),
        url: window.location.href,
      });
    } catch (err) {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(window.location.href)}`,
        '_blank'
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({ 
      ...prev, 
      [name]: name === 'fundingGoal' ? Number(value) || 0 : value 
    }));
  };

  // Safe number formatting with fallback
  const formatFundingGoal = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return "0";
    return num.toLocaleString('en-US');
  };

  return (
    <div className={`project-card ${isProfileView ? 'profile-view' : ''} ${isEditing ? 'editing-mode' : ''}`}>
      {isEditing ? (
        <div className="edit-form">
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={editedTitle}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="description"
              value={editedDescription}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Category:</label>
              <input
                type="text"
                name="category"
                value={editedCategory}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Funding Goal (ZMW):</label>
              <input
                type="number"
                name="fundingGoal"
                value={editedFundingGoal}
                onChange={handleInputChange}
                min="0"
                step="1"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Image URL:</label>
            <input
              type="url"
              name="imageUrl"
              value={editedImageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="form-actions">
            <button 
              onClick={() => handleSaveProjectEdit(id)}
              className="save-btn"
            >
              Save Changes
            </button>
            <button 
              onClick={handleCancelEdit}
              className="cancel-btn"
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="project-image-container">
            <img 
              src={imageUrl} 
              alt={title} 
              className="project-image"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://via.placeholder.com/600x400?text=Image+Not+Available';
              }}
            />
          </div>

          <div className="project-content">
            <h3 className="project-title">{title}</h3>
            
            <div className="project-description">
              <p>
                {showFullDescription ? description : `${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`}
                {description.length > 100 && (
                  <button 
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="toggle-description"
                  >
                    {showFullDescription ? "Show Less" : "Show More"}
                  </button>
                )}
              </p>
            </div>
            
            <div className="project-meta">
              <span className="project-category">{category}</span>
              <span className="project-goal">ZMW {formatFundingGoal(fundingGoal)}</span>
            </div>
          </div>

          <div className="project-footer">
            {isProfileView ? (
              <div className="profile-actions">
                <button 
                  className="share-btn"
                  onClick={handleShare}
                >
                  <span className="share-icon">↗</span>
                  Share
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEditProject(project)}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteProject(id)}
                >
                  Delete
                </button>
              </div>
            ) : (
              <button 
                className="share-btn full-width"
                onClick={handleShare}
              >
                <span className="share-icon">↗</span>
                Share This Project
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectCard;