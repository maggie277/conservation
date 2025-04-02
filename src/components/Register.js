import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { Button, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { verifyOrganization } from '../utils/verifyOrganization';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import './Register.css';
import registerBackground from '../pictures/register-image.jpg';

const useStyles = makeStyles({
  root: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'var(--brown)',
      },
      '&:hover fieldset': {
        borderColor: 'var(--brown-hover)',
      },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--brown)',
      },
    },
    '& .MuiInputBase-input': {
      color: '#333333',
    },
    '& .MuiInputLabel-root': {
      color: 'var(--brown)',
    },
    '& .MuiButton-containedPrimary': {
      backgroundColor: 'var(--brown)',
      '&:hover': {
        backgroundColor: 'var(--brown-hover)',
      },
    },
    '& .MuiRadio-root': {
      color: 'var(--brown)',
      '&.Mui-checked': {
        color: 'var(--brown)',
      },
    },
  },
});

const Register = () => {
  const classes = useStyles();
  const [user, setUser] = useState({
    email: '',
    password: '',
    type: 'individual',
    companyId: '',
  });

  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'companyId' && user.type === 'organization') {
      setUser({ ...user, [name]: value.startsWith('ZMW') ? value : `ZMW${value}` });
    } else {
      setUser({ ...user, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Create auth user
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCredential.user.uid;

      // 2. Prepare base user data
      const userData = {
        uid,
        email: user.email,
        type: user.type,
        has_seen_onboarding: false, // Critical onboarding flag
        createdAt: new Date().toISOString()
      };

      // 3. Handle organization-specific data
      if (user.type === 'organization') {
        const companyId = user.companyId;
        const result = await verifyOrganization(companyId);

        if (result.verified) {
          userData.companyId = companyId;
          userData.organizationVerified = true;
        } else {
          setVerificationStatus(result.message);
          return;
        }
      }

      // 4. Save to Firestore (using UID as document ID)
      await setDoc(doc(db, 'users', uid), userData);

      // 5. Redirect on success
      setVerificationStatus('Registration successful!');
      navigate('/projects');
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'This email is already associated with an account.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'The email address is not valid.';
            break;
          case 'auth/weak-password':
            errorMessage = 'The password is too weak. Please choose a stronger password.';
            break;
          default:
            errorMessage = error.message;
        }
      }
      setVerificationStatus(errorMessage);
    }
  };

  return (
    <div className="register-page">
      <img src={registerBackground} alt="Background" className="background" />
      <div className="form-container">
        <form className={classes.root} onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="Email"
            value={user.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
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
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            required
          />
          <RadioGroup 
            name="type" 
            value={user.type} 
            onChange={handleChange} 
            row
          >
            <FormControlLabel 
              value="individual" 
              control={<Radio />} 
              label="Individual" 
            />
            <FormControlLabel 
              value="organization" 
              control={<Radio />} 
              label="Organization" 
            />
          </RadioGroup>
          
          {user.type === 'organization' && (
            <TextField
              name="companyId"
              label="Company ID"
              value={user.companyId}
              onChange={handleChange}
              fullWidth
              margin="normal"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              error={user.type === 'organization' && !/^ZMW\d{6}$/.test(user.companyId)}
              helperText={
                user.type === 'organization' && !/^ZMW\d{6}$/.test(user.companyId)
                  ? 'Company ID must start with "ZMW" followed by 6 digits.'
                  : ''
              }
              required
            />
          )}
          
          <Button 
            type="submit" 
            color="primary" 
            variant="contained"
            fullWidth
            style={{ marginTop: '20px' }}
          >
            Register
          </Button>
          
          {verificationStatus && (
            <p style={{ 
              color: verificationStatus.includes('success') ? 'green' : 'red',
              marginTop: '10px'
            }}>
              {verificationStatus}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;