import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { verifyOrganization } from '../utils/verifyOrganization';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import './Register.css';
import registerBackground from '../pictures/home.jpg'; // Updated image

const useStyles = makeStyles({
  root: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'var(--green)',
      },
      '&:hover fieldset': {
        borderColor: 'var(--green-hover)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--green)',
      },
    },
    '& .MuiInputLabel-root': {
      color: 'var(--green)',
    },
    '& .MuiButton-containedPrimary': {
      backgroundColor: 'var(--green)',
      '&:hover': {
        backgroundColor: 'var(--green-hover)',
      },
    },
    '& .MuiRadio-root': {
      color: 'var(--green)',
      '&.Mui-checked': {
        color: 'var(--green)',
      },
    },
  },
});

const Register = () => {
  const classes = useStyles();
  const [user, setUser] = useState({
    email: '',
    password: '',
    type: 'farmer', // Changed from 'individual'
    cooperativeId: '', // Changed from 'companyId'
  });

  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cooperativeId' && user.type === 'cooperative') {
      setUser({ ...user, [name]: value.startsWith('ZMAG') ? value : `ZMAG${value}` });
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCredential.user.uid;

      const userData = {
        uid,
        email: user.email,
        type: user.type,
        has_seen_onboarding: false,
        createdAt: new Date().toISOString()
      };

      if (user.type === 'cooperative') {
        const cooperativeId = user.cooperativeId;
        const result = await verifyOrganization(cooperativeId);
        
        if (result.verified) {
          userData.cooperativeId = cooperativeId;
          userData.verified = true;
        } else {
          setVerificationStatus(result.message || "Cooperative verification failed");
          return;
        }
      }

      await setDoc(doc(db, 'users', uid), userData);
      setVerificationStatus('Registration successful! Redirecting...');
      setTimeout(() => navigate(user.type === 'farmer' ? '/create-project' : '/cooperative-dashboard'), 1500);
    } catch (error) {
      setVerificationStatus(error.message.includes('email-already-in-use') 
        ? 'Email already used by a farming account' 
        : 'Registration error. Please try again.');
    }
  };

  return (
    <div className="register-page">
      <img src={registerBackground} alt="Zambian farmers in field" className="background" />
      <div className="form-container">
        <h2>Join TerraFund Zambia</h2>
        <form className={classes.root} onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="Email"
            type="email"
            value={user.email}
            onChange={handleChange}
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
            fullWidth
            margin="normal"
            required
          />
          <RadioGroup 
            name="type" 
            value={user.type} 
            onChange={handleChange} 
            row
          >
            <FormControlLabel 
              value="farmer" 
              control={<Radio />} 
              label="Individual Farmer" 
            />
            <FormControlLabel 
              value="cooperative" 
              control={<Radio />} 
              label="Farming Cooperative" 
            />
          </RadioGroup>
          
          {user.type === 'cooperative' && (
            <TextField
              name="cooperativeId"
              label="Cooperative ID"
              value={user.cooperativeId}
              onChange={handleChange}
              fullWidth
              margin="normal"
              helperText="Format: ZMAG followed by 6 digits"
              required
            />
          )}
          
          <Button 
            type="submit" 
            variant="contained"
            fullWidth
            style={{ marginTop: '20px', padding: '12px' }}
          >
            Register as {user.type === 'farmer' ? 'Farmer' : 'Cooperative'}
          </Button>
          
          {verificationStatus && (
            <p className={`status-message ${verificationStatus.includes('success') ? 'success' : 'error'}`}>
              {verificationStatus}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;