import React, { useState, useEffect } from "react";
import { 
  Button, 
  TextField, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle,
  Chip,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  doc, 
  updateDoc, 
  collection, 
  addDoc, 
  onSnapshot,
  deleteDoc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ShareIcon from '@mui/icons-material/Share';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import './ProjectCard.css';

const ProjectCard = ({ 
  project = {},
  handleDeleteProject = () => {},
  isProfileView = false,
  currentUserId = '',
  onUpdate = () => {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState({...project});
  const [showFundingDialog, setShowFundingDialog] = useState(false);
  const [fundingAmount, setFundingAmount] = useState(project.fundsReceived || 0);
  const [updates, setUpdates] = useState([]);
  const [newUpdate, setNewUpdate] = useState('');
  const [showUpdates, setShowUpdates] = useState(false);

  // Fetch updates in real-time
  useEffect(() => {
    if (!project.id) return;
    
    const updatesRef = collection(db, 'projects', project.id, 'updates');
    const unsubscribe = onSnapshot(updatesRef, (snapshot) => {
      const updatesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setUpdates(updatesData.sort((a, b) => b.createdAt - a.createdAt));
    });

    return () => unsubscribe();
  }, [project.id]);

  const handleAddUpdate = async () => {
    if (!newUpdate.trim()) return;
    
    try {
      const update = {
        text: newUpdate,
        createdAt: new Date(),
        userId: currentUserId
      };
      
      const updatesRef = collection(db, 'projects', project.id, 'updates');
      await addDoc(updatesRef, update);
      setNewUpdate('');
    } catch (error) {
      console.error("Error adding update:", error);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await updateDoc(doc(db, 'projects', project.id), {
        ...editedProject,
        updatedAt: new Date()
      });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleUpdateFunding = async () => {
    try {
      await updateDoc(doc(db, 'projects', project.id), {
        fundsReceived: Number(fundingAmount),
        status: Number(fundingAmount) >= project.fundingGoal ? 'Funded' : 'Active',
        updatedAt: new Date()
      });
      setShowFundingDialog(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating funding:", error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: project.title,
        text: project.description.substring(0, 100),
        url: `${window.location.origin}/projects/${project.id}`,
      });
    } catch (err) {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(project.title)}&url=${encodeURIComponent(`${window.location.origin}/projects/${project.id}`)}`,
        '_blank'
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProject(prev => ({ 
      ...prev, 
      [name]: name === 'fundingGoal' || name === 'fundsReceived' ? 
        Number(value) || 0 : value 
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZM', {
      style: 'currency',
      currency: 'ZMW'
    }).format(amount);
  };

  const calculateProgress = (fundsReceived, fundingGoal) => {
    if (!fundingGoal || fundingGoal === 0) return 0;
    return Math.min(100, (fundsReceived / fundingGoal) * 100);
  };

  return (
    <div className={`project-card ${isEditing ? 'editing' : ''}`}>
      {isEditing ? (
        <div className="edit-form">
          <TextField
            label="Title"
            name="title"
            value={editedProject.title}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="Description"
            name="description"
            value={editedProject.description}
            onChange={handleInputChange}
            multiline
            rows={4}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="Funding Goal (ZMW)"
            name="fundingGoal"
            type="number"
            value={editedProject.fundingGoal}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            label="Contact Email"
            name="contactEmail"
            value={editedProject.contactEmail}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            type="email"
          />
          
          <TextField
            label="Contact Phone"
            name="contactPhone"
            value={editedProject.contactPhone}
            onChange={handleInputChange}
            fullWidth
            margin="normal"
            placeholder="e.g., 0961234567"
          />
          
          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleSaveEdit}
              fullWidth
            >
              Save Changes
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => setIsEditing(false)}
              fullWidth
            >
              Cancel
            </Button>
          </Box>
        </div>
      ) : (
        <>
          <div className="project-image-container">
            <img 
              src={project.imageUrl || 'https://via.placeholder.com/300x200?text=Project+Image'} 
              alt={project.title} 
              className="project-image"
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = 'https://via.placeholder.com/300x200?text=Image+Not+Available';
              }}
            />
            
            <div className="project-status">
              <Chip 
                label={project.status || 'Active'} 
                color={
                  project.status === 'Funded' ? 'success' : 
                  project.status === 'Completed' ? 'primary' : 'default'
                } 
                size="small"
              />
            </div>
          </div>

          <div className="project-content">
            <Typography variant="h6" className="project-title">
              {project.title}
            </Typography>
            
            <Typography variant="body2" className="project-description">
              {project.description.substring(0, 150)}{project.description.length > 150 ? '...' : ''}
            </Typography>
            
            <Divider sx={{ my: 1 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                <strong>Goal:</strong> {formatCurrency(project.fundingGoal || 0)}
              </Typography>
              <Typography variant="body2">
                <strong>Funded:</strong> {formatCurrency(project.fundsReceived || 0)}
              </Typography>
            </Box>
            
            <div className="project-progress">
              <div 
                className="progress-bar" 
                style={{
                  width: `${calculateProgress(project.fundsReceived, project.fundingGoal)}%`
                }}
              ></div>
            </div>
            
            {/* Updates section */}
            <Box sx={{ mt: 2 }}>
              <Button 
                size="small" 
                onClick={() => setShowUpdates(!showUpdates)}
                sx={{ mb: 1 }}
              >
                {showUpdates ? 'Hide Updates' : `Show Updates (${updates.length})`}
              </Button>
              
              {showUpdates && (
                <Box className="updates-container">
                  {updates.length > 0 ? (
                    updates.map(update => (
                      <Box key={update.id} className="update-item">
                        <Typography variant="body2">{update.text}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {update.createdAt?.toLocaleString() || 'Recently'}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No updates yet
                    </Typography>
                  )}
                  
                  {/* Add update form for project owner */}
                  {isProfileView && currentUserId === project.userId && (
                    <Box sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        value={newUpdate}
                        onChange={(e) => setNewUpdate(e.target.value)}
                        placeholder="Post an update about this project..."
                        variant="outlined"
                        size="small"
                      />
                      <Button 
                        variant="contained" 
                        size="small" 
                        onClick={handleAddUpdate}
                        sx={{ mt: 1 }}
                        disabled={!newUpdate.trim()}
                      >
                        Post Update
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
            
            {/* Contact information if funded */}
            {project.fundsReceived > 0 && (
              <Box className="contact-info">
                <Typography variant="subtitle2">Contact Information:</Typography>
                <Typography variant="body2">Email: {project.contactEmail || 'Not provided'}</Typography>
                <Typography variant="body2">Phone: {project.contactPhone || 'Not provided'}</Typography>
              </Box>
            )}
          </div>

          <div className="project-actions">
            {isProfileView ? (
              <>
                <Tooltip title="Share project">
                  <IconButton onClick={handleShare} size="small">
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Edit project">
                  <IconButton onClick={() => setIsEditing(true)} size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Update funding">
                  <IconButton 
                    onClick={() => {
                      setFundingAmount(project.fundsReceived || 0);
                      setShowFundingDialog(true);
                    }} 
                    size="small"
                    color="success"
                  >
                    <CheckCircleIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete project">
                  <IconButton 
                    onClick={() => handleDeleteProject(project.id)} 
                    size="small"
                    color="error"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            ) : (
              <Button 
                variant="contained" 
                onClick={handleShare}
                startIcon={<ShareIcon />}
                fullWidth
              >
                Share Project
              </Button>
            )}
          </div>
        </>
      )}

      {/* Update Funding Dialog */}
      <Dialog open={showFundingDialog} onClose={() => setShowFundingDialog(false)}>
        <DialogTitle>Update Project Funding</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Enter the total amount received for this project so far.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Amount Received (ZMW)"
            type="number"
            fullWidth
            value={fundingAmount}
            onChange={(e) => setFundingAmount(Number(e.target.value))}
            InputProps={{
              inputProps: { min: 0 }
            }}
          />
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Current progress: {Math.round(calculateProgress(fundingAmount, project.fundingGoal))}%
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFundingDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateFunding} 
            variant="contained"
          >
            Update Funding
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ProjectCard;