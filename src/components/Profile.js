import React, { useEffect, useState } from "react";
import { 
  doc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  Button, 
  TextField, 
  Typography, 
  Card, 
  CardContent,
  Divider,
  Tabs,
  Tab,
  Box,
  CircularProgress
} from '@mui/material';
import ProjectCard from "../components/ProjectCard";
import "./Profile.css";

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserData(user.uid);
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setFormData({
          displayName: data.displayName || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || ''
        });

        if (['farmer', 'cooperative'].includes(data.type)) {
          const projectsQuery = query(
            collection(db, 'projects'),
            where('userId', '==', uid)
          );
          const snapshot = await getDocs(projectsQuery);
          setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.displayName) newErrors.displayName = "Display name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...formData,
        profileComplete: true,
        updatedAt: new Date().toISOString()
      });
      setIsEditing(false);
      await fetchUserData(currentUser.uid);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await deleteDoc(doc(db, 'projects', projectId));
        setProjects(prev => prev.filter(p => p.id !== projectId));
      } catch (error) {
        console.error("Error deleting project:", error);
      }
    }
  };

  const renderProfileContent = () => {
    if (!userData) return null;

    switch(userData.type) {
      case 'farmer':
        return (
          <div className="profile-section">
            <Typography variant="h6" color="textPrimary">Farmer Details</Typography>
            <Typography>
              <strong>NRC:</strong> {userData.nrcPassport || 'Not provided'}
            </Typography>
            <Typography>
              <strong>Farm Location:</strong> {userData.address || 'Not specified'}
            </Typography>
          </div>
        );
      case 'cooperative':
        return (
          <div className="profile-section">
            <Typography variant="h6" color="textPrimary">Cooperative Details</Typography>
            <Typography>
              <strong>ID:</strong> {userData.cooperativeId || 'Not registered'}
            </Typography>
            <Typography>
              <strong>Address:</strong> {userData.cooperativeAddress || 'Not specified'}
            </Typography>
            {userData.missionStatement && (
              <Typography>
                <strong>Mission:</strong> {userData.missionStatement}
              </Typography>
            )}
          </div>
        );
      case 'donor':
        return (
          <div className="profile-section">
            <Typography variant="h6" color="textPrimary">Donor Profile</Typography>
            <Typography>
              Thank you for supporting Zambian agriculture!
            </Typography>
          </div>
        );
      default:
        return (
          <div className="profile-section">
            <Typography variant="h6" color="textPrimary">User Profile</Typography>
            <Typography>
              Welcome to our agricultural platform!
            </Typography>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <CircularProgress size={60} style={{ color: 'var(--green)' }} />
        <Typography variant="h6" style={{ marginTop: 20 }}>Loading your profile...</Typography>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="no-profile">
        <Typography variant="h5">No profile data found</Typography>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        {isEditing ? (
          <div className="edit-form">
            <Typography variant="h4" gutterBottom style={{ color: 'var(--green-dark)' }}>
              Edit Profile
            </Typography>
            
            <div className="form-group">
              <TextField
                label="Display Name*"
                value={formData.displayName}
                onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                fullWidth
                margin="normal"
                error={!!errors.displayName}
                helperText={errors.displayName}
              />
            </div>
            
            <div className="form-group">
              <TextField
                label="Bio"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                multiline
                rows={4}
                fullWidth
                margin="normal"
              />
            </div>
            
            <div className="form-group">
              <TextField
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                fullWidth
                margin="normal"
              />
            </div>
            
            <div className="form-group">
              <TextField
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                fullWidth
                margin="normal"
              />
            </div>
            
            <div className="form-actions">
              <Button 
                variant="contained" 
                className="save-btn"
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
              <Button 
                variant="outlined"
                className="cancel-btn"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-header">
              <Typography variant="h3" style={{ color: 'var(--green-dark)' }}>
                {formData.displayName || userData.email}
              </Typography>
              <Typography variant="subtitle1" style={{ color: 'var(--gray)' }}>
                {userData.type === 'farmer' ? 'Farmer' : 
                 userData.type === 'cooperative' ? 'Agricultural Cooperative' :
                 userData.type === 'donor' ? 'Donor' : 'User'}
              </Typography>
            </div>
            
            <Divider style={{ margin: '20px 0', backgroundColor: 'var(--sand)' }} />
            
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
            >
              <Tab label="Profile" />
              {['farmer', 'cooperative'].includes(userData.type) && (
                <Tab label="My Projects" />
              )}
            </Tabs>
            
            <Box mt={3}>
              {activeTab === 0 ? (
                <>
                  {formData.bio && (
                    <Typography variant="body1" paragraph style={{ color: 'var(--black)' }}>
                      {formData.bio}
                    </Typography>
                  )}
                  
                  {renderProfileContent()}
                  
                  <div className="profile-details">
                    {formData.location && (
                      <Typography>
                        <strong style={{ color: 'var(--green-dark)' }}>Location:</strong> {formData.location}
                      </Typography>
                    )}
                    {formData.website && (
                      <Typography>
                        <strong style={{ color: 'var(--green-dark)' }}>Website:</strong> 
                        <a 
                          href={formData.website.startsWith('http') ? formData.website : `https://${formData.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: 'var(--green)', marginLeft: 8 }}
                        >
                          {formData.website}
                        </a>
                      </Typography>
                    )}
                  </div>
                  
                  <div className="profile-actions">
                    <Button 
                      variant="contained"
                      className="edit-btn"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                    <Button 
                      variant="outlined"
                      className="signout-btn"
                      onClick={handleSignOut}
                    >
                      Sign Out
                    </Button>
                  </div>
                </>
              ) : (
                <div className="projects-section">
                  <Typography variant="h5" style={{ color: 'var(--white)', marginBottom: 20 }}>
                    My Agricultural Projects
                  </Typography>
                  
                  {projects.length > 0 ? (
                    <div className="projects-grid">
                      {projects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          onDelete={() => handleDeleteProject(project.id)}
                          showActions={true}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="no-projects">
                      <Typography variant="body1" style={{ color: 'var(--black)', marginBottom: 20 }}>
                        You haven't created any projects yet.
                      </Typography>
                      <Button 
                        variant="contained" 
                        className="create-project-btn"
                        href="/projects/upload-project"
                      >
                        Create Your First Project
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </Box>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;