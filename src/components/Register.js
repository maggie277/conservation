import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button, TextField, RadioGroup, FormControlLabel, Radio, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import './Register.css';
import registerBackground from '../pictures/home.jpg';

const Register = () => {
  const [user, setUser] = useState({
    email: '',
    password: '',
    type: 'general', // Default to general user
    organizationId: ''
  });

  const [errors, setErrors] = useState({});
  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!user.email) newErrors.email = 'Email is required';
    if (!user.password) newErrors.password = 'Password is required';
    if (user.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCredential.user.uid;

      const userData = {
        uid,
        email: user.email,
        type: user.type,
        createdAt: new Date().toISOString(),
        profileComplete: false
      };

      // Add type-specific fields
      if (user.type === 'cooperative') {
        userData.cooperative = {
          id: user.organizationId,
          verified: false
        };
      } else if (user.type === 'donor') {
        userData.donor = {
          interests: []
        };
      }

      await setDoc(doc(db, 'users', uid), userData);
      setVerificationStatus('Registration successful! Redirecting to your profile...');
      
      setTimeout(() => navigate('/profile'), 1500);
    } catch (error) {
      setVerificationStatus(
        error.code === 'auth/email-already-in-use' 
          ? 'Email already in use' 
          : 'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="register-page">
      <img src={registerBackground} alt="Background" className="background" />
      <div className="form-container">
        <Typography variant="h4" gutterBottom className="title">
          Join Our Platform
        </Typography>
        
        <form onSubmit={handleSubmit} className="register-form">
          <TextField
            name="email"
            label="Email"
            type="email"
            value={user.email}
            onChange={handleChange}
            error={!!errors.email}
            helperText={errors.email}
            fullWidth
            margin="normal"
            required
          />
          
          <TextField
            name="password"
            label="Password"
            type="password"
            value={user.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
            margin="normal"
            required
          />

          <div className="user-type-section">
            <Typography variant="subtitle1">I am a:</Typography>
            <RadioGroup 
              name="type" 
              value={user.type} 
              onChange={handleChange}
              row
            >
              <FormControlLabel value="general" control={<Radio />} label="General User" />
              <FormControlLabel value="farmer" control={<Radio />} label="Farmer" />
              <FormControlLabel value="cooperative" control={<Radio />} label="Cooperative" />
              <FormControlLabel value="donor" control={<Radio />} label="Donor/Investor" />
            </RadioGroup>
          </div>

          {user.type === 'cooperative' && (
            <TextField
              name="organizationId"
              label="Cooperative ID"
              value={user.organizationId}
              onChange={handleChange}
              fullWidth
              margin="normal"
              placeholder="ZMAG123456"
            />
          )}

          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            fullWidth
            size="large"
            className="submit-button"
          >
            Register
          </Button>

          {verificationStatus && (
            <Typography 
              className={`status-message ${
                verificationStatus.includes('success') ? 'success' : 'error'
              }`}
            >
              {verificationStatus}
            </Typography>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;