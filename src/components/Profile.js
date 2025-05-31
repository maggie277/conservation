import React, { useEffect, useState } from "react";
import { 
  doc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  orderBy
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { 
  Button, 
  TextField, 
  Typography, 
  Divider,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Link,
  Avatar
} from '@mui/material';
import ProjectCard from "../components/ProjectCard";
import "./Profile.css";

const Profile = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    website: '',
    nrcPassport: '',
    address: '',
    cooperativeId: '',
    cooperativeAddress: ''
  });
  const [errors, setErrors] = useState({});
  const [editingProject, setEditingProject] = useState(null);
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        await fetchUserData(user.uid);
        if (['farmer', 'cooperative', 'donor'].includes(userData?.type)) {
          await fetchUserDonations(user.uid);
        }
      } else {
        setCurrentUser(null);
        setUserData(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [userData?.type]);

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
          website: data.website || '',
          nrcPassport: data.nrcPassport || '',
          address: data.address || '',
          cooperativeId: data.cooperativeId || '',
          cooperativeAddress: data.cooperativeAddress || ''
        });

        if (['farmer', 'cooperative'].includes(data.type)) {
          await fetchUserProjects(uid);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchUserProjects = async (uid) => {
    try {
      const projectsQuery = query(
        collection(db, 'projects'),
        where('userId', '==', uid)
      );
      const snapshot = await getDocs(projectsQuery);
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchUserDonations = async (uid) => {
    try {
      const donationsQuery = query(
        collection(db, 'donations'),
        where('donorId', '==', uid),
        orderBy('donationDate', 'desc')
      );
      const snapshot = await getDocs(donationsQuery);
      
      const donationsData = await Promise.all(snapshot.docs.map(async doc => {
        const donation = doc.data();
        let projectName = 'General Donation';
        let projectLink = null;
        let projectImage = null;
        
        if (donation.projectId) {
          try {
            const projectDoc = await getDoc(doc(db, 'projects', donation.projectId));
            if (projectDoc.exists()) {
              const projectData = projectDoc.data();
              projectName = projectData.title;
              projectLink = `/projects/${donation.projectId}`;
              projectImage = projectData.imageUrl || null;
            }
          } catch (error) {
            console.error("Error fetching project:", error);
          }
        }
        
        return {
          id: doc.id,
          ...donation,
          projectName,
          projectLink,
          projectImage,
          date: donation.donationDate?.toDate?.() || new Date(donation.donationDate)
        };
      }));
      
      setDonations(donationsData);
    } catch (error) {
      console.error("Error fetching donations:", error);
    }
  };

  const isProfileComplete = () => {
    if (!userData) return false;
    
    const requiredCommonFields = {
      displayName: true,
      bio: true
    };
    
    const typeSpecificFields = {
      farmer: {
        nrcPassport: true,
        address: true
      },
      cooperative: {
        cooperativeId: true,
        cooperativeAddress: true
      },
      donor: {}
    };
    
    const allRequiredFields = {
      ...requiredCommonFields,
      ...(typeSpecificFields[userData.type] || {})
    };
    
    return Object.keys(allRequiredFields).every(
      field => formData[field] && formData[field].toString().trim() !== ''
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.displayName) newErrors.displayName = "Display name is required";
    if (!formData.bio) newErrors.bio = "Bio is required";
    
    if (userData?.type === 'farmer') {
      if (!formData.nrcPassport) newErrors.nrcPassport = "NRC/Passport is required";
      if (!formData.address) newErrors.address = "Address is required";
    }
    
    if (userData?.type === 'cooperative') {
      if (!formData.cooperativeId) newErrors.cooperativeId = "Cooperative ID is required";
      if (!formData.cooperativeAddress) newErrors.cooperativeAddress = "Cooperative address is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), {
        ...formData,
        profileComplete: isProfileComplete(),
        updatedAt: new Date().toISOString()
      });
      setIsEditingProfile(false);
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

  const handleEditProject = (project) => {
    setEditingProject(project);
  };

  const handleSaveProjectEdit = async (projectId) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), editingProject);
      setEditingProject(null);
      await fetchUserProjects(currentUser.uid);
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };

  const handleCancelProjectEdit = () => {
    setEditingProject(null);
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
            <div style={{ marginTop: '20px' }}>
              <Button 
                variant="contained" 
                color="primary" 
                href="/projects"
                style={{ marginRight: '10px' }}
              >
                Browse Projects
              </Button>
              <Button 
                variant="contained" 
                color="secondary" 
                href="/projects/upload-project"
              >
                Create Project
              </Button>
            </div>
          </div>
        );
      case 'donor':
        return (
          <div className="profile-section">
            <Typography variant="h6" color="textPrimary">Donor Profile</Typography>
            <Typography>
              Thank you for supporting Zambian agriculture!
            </Typography>
            <div style={{ marginTop: '20px' }}>
              <Button 
                variant="contained" 
                color="primary" 
                href="/projects"
              >
                Browse Projects to Donate
              </Button>
            </div>
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

  const renderDonationsTable = () => {
    if (donations.length === 0) {
      return (
        <Typography variant="body1" style={{ margin: '20px 0' }}>
          You haven't made any donations yet.
        </Typography>
      );
    }

    return (
      <TableContainer component={Paper} style={{ marginTop: '20px' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Project</strong></TableCell>
              <TableCell><strong>Amount</strong></TableCell>
              <TableCell><strong>Date</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donations.map((donation) => (
              <TableRow key={donation.id}>
                <TableCell>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {donation.projectImage && (
                      <Avatar 
                        src={donation.projectImage} 
                        alt={donation.projectName}
                        sx={{ width: 40, height: 40 }}
                      />
                    )}
                    {donation.projectLink ? (
                      <Link href={donation.projectLink} color="primary" underline="hover">
                        {donation.projectName}
                      </Link>
                    ) : (
                      <Typography>{donation.projectName}</Typography>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {donation.amount.toLocaleString('en-ZM', {
                    style: 'currency',
                    currency: 'ZMW'
                  })}
                </TableCell>
                <TableCell>
                  {donation.date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={donation.status || 'Completed'} 
                    color={
                      donation.status === 'Completed' ? 'success' : 
                      donation.status === 'Pending' ? 'warning' : 'primary'
                    } 
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  if (loading) {
    return (
      <div className="loader-overlay">
        <div className="loader-content">
          <CircularProgress 
            size={60}
            thickness={4}
            sx={{ color: 'var(--green)' }}
          />
          <Typography variant="h6" className="loader-text">
            Loading your profile...
          </Typography>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="no-profile">
        <Typography variant="h5">Please sign in to view your profile</Typography>
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
        {isEditingProfile ? (
          <div className="edit-form">
            <Typography variant="h4" gutterBottom style={{ color: 'var(--green-dark)' }}>
              Edit Profile
            </Typography>
            
            {!isProfileComplete() && (
              <Alert severity="warning" sx={{ mb: 3 }}>
                Please complete all required fields to unlock full platform features
              </Alert>
            )}
            
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
                label="Bio*"
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                multiline
                rows={4}
                fullWidth
                margin="normal"
                error={!!errors.bio}
                helperText={errors.bio}
              />
            </div>
            
            {userData?.type === 'farmer' && (
              <>
                <div className="form-group">
                  <TextField
                    label="NRC/Passport*"
                    value={formData.nrcPassport}
                    onChange={(e) => setFormData({...formData, nrcPassport: e.target.value})}
                    fullWidth
                    margin="normal"
                    error={!!errors.nrcPassport}
                    helperText={errors.nrcPassport}
                  />
                </div>
                <div className="form-group">
                  <TextField
                    label="Farm Address*"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    fullWidth
                    margin="normal"
                    error={!!errors.address}
                    helperText={errors.address}
                  />
                </div>
              </>
            )}
            
            {userData?.type === 'cooperative' && (
              <>
                <div className="form-group">
                  <TextField
                    label="Cooperative ID*"
                    value={formData.cooperativeId}
                    onChange={(e) => setFormData({...formData, cooperativeId: e.target.value})}
                    fullWidth
                    margin="normal"
                    error={!!errors.cooperativeId}
                    helperText={errors.cooperativeId}
                  />
                </div>
                <div className="form-group">
                  <TextField
                    label="Cooperative Address*"
                    value={formData.cooperativeAddress}
                    onChange={(e) => setFormData({...formData, cooperativeAddress: e.target.value})}
                    fullWidth
                    margin="normal"
                    error={!!errors.cooperativeAddress}
                    helperText={errors.cooperativeAddress}
                  />
                </div>
              </>
            )}
            
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
                onClick={() => setIsEditingProfile(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="profile-header">
              <Typography variant="h3" style={{ color: 'var(--green-dark)' }}>
                {formData.displayName || currentUser.email}
              </Typography>
              <Typography variant="subtitle1" style={{ color: 'var(--gray)' }}>
                {userData.type === 'farmer' ? 'Farmer' : 
                 userData.type === 'cooperative' ? 'Agricultural Cooperative' :
                 userData.type === 'donor' ? 'Donor' : 'User'}
              </Typography>
              
              {!isProfileComplete() && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  Complete your profile to access all features
                </Alert>
              )}
            </div>
            
            <Divider style={{ margin: '20px 0', backgroundColor: 'var(--sand)' }} />
            
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              indicatorColor="primary"
              textColor="primary"
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Profile" />
              {['farmer', 'cooperative'].includes(userData?.type) && (
                <Tab label="My Projects" disabled={!isProfileComplete()} />
              )}
              {['donor', 'cooperative'].includes(userData?.type) && (
                <Tab label="My Donations" />
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
                      onClick={() => setIsEditingProfile(true)}
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
              ) : activeTab === 1 && ['farmer', 'cooperative'].includes(userData?.type) ? (
                <div className="projects-section">
                  <Typography variant="h5" style={{ color: 'var(--green-dark)', marginBottom: 20 }}>
                    My Agricultural Projects
                  </Typography>
                  
                  {projects.length > 0 ? (
                    <div className="projects-grid">
                      {projects.map((project) => (
                        <ProjectCard
                          key={project.id}
                          project={project}
                          isProfileView={true}
                          handleDeleteProject={handleDeleteProject}
                          handleEditProject={handleEditProject}
                          isEditing={editingProject?.id === project.id}
                          editedProject={editingProject?.id === project.id ? editingProject : {}}
                          setEditedProject={setEditingProject}
                          handleSaveProjectEdit={handleSaveProjectEdit}
                          handleCancelEdit={handleCancelProjectEdit}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="no-projects">
                      <Typography variant="body1" style={{ color: 'var(--black)', marginBottom: 20 }}>
                        {isProfileComplete() 
                          ? "You haven't created any projects yet."
                          : "Please complete your profile to create projects."}
                      </Typography>
                      {isProfileComplete() && (
                        <Button 
                          variant="contained" 
                          className="create-project-btn"
                          href="/projects/upload-project"
                        >
                          Create Your First Project
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="donations-section">
                  <Typography variant="h5" style={{ color: 'var(--green-dark)' }}>
                    My Donations
                  </Typography>
                  {renderDonationsTable()}
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