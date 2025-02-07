import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { Button, Avatar } from '@mui/material';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        console.log("Fetching Firestore Data for:", user.uid);
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            console.log("User Data:", userDoc.data());
            setUserData(userDoc.data());
          } else {
            console.warn("No user data found in Firestore.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        console.warn("No authenticated user found.");
      }
      setLoading(false);
    };

    fetchUserData();
  }, [user]);

  if (loading) return <p>Loading profile...</p>;

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Profile Page</h1>
      {userData ? (
        <div>
          <Avatar 
            src={userData.profilePicture || 'https://via.placeholder.com/150'} 
            sx={{ width: 100, height: 100, margin: 'auto' }} 
          />
          <h2>{userData.name}</h2>
          <p>Email: {user.email}</p>
          <h3>My Projects</h3>
          {userData.projects?.length ? (
            <ul>
              {userData.projects.map((project) => (
                <li key={project.id}>{project.title}</li>
              ))}
            </ul>
          ) : (
            <p>No projects created yet.</p>
          )}
          <h3>My Contributions</h3>
          {userData.contributions?.length ? (
            <ul>
              {userData.contributions.map((donation, index) => (
                <li key={index}>Donated K{donation.amount} to {donation.projectTitle}</li>
              ))}
            </ul>
          ) : (
            <p>No contributions made yet.</p>
          )}
          <Button variant="contained" color="primary">Edit Profile</Button>
        </div>
      ) : (
        <p>No profile data found.</p>
      )}
    </div>
  );
};

export default Profile;
