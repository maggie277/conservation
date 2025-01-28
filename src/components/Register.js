import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { Button, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { verifyOrganization } from '../utils/verifyOrganization';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import './Register.css'; // Ensure this import is correct
import backgroundImage from '../pictures/register-image.jpg'; // Import the image

const useStyles = makeStyles({
  root: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: 'var(--brown)', // Use variable for consistent color
      },
      '&:hover fieldset': {
        borderColor: 'var(--brown-hover)', // Use variable for consistent color
      },
      '&.Mui-focused fieldset': {
        borderColor: 'var(--brown)', // Use variable for consistent color
      },
    },
    '& .MuiInputBase-input': {
      color: '#333333', // Dark Gray
    },
    '& .MuiInputLabel-root': {
      color: 'var(--brown)', // Use variable for consistent color
    },
    '& .MuiButton-containedPrimary': {
      backgroundColor: 'var(--brown)', // Use variable for consistent color
      '&:hover': {
        backgroundColor: 'var(--brown-hover)', // Use variable for consistent color
      },
    },
    '& .MuiRadio-root': {
      color: 'var(--brown)', // Default Brown Color
      '&.Mui-checked': {
        color: 'var(--brown)', // Brown Color When Checked
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
    companyId: '', // Add company ID state
  });

  const [verificationStatus, setVerificationStatus] = useState(null);
  const navigate = useNavigate(); // Initialize the navigate hook

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.type === 'organization') {
      try {
        const result = await verifyOrganization(user.companyId);
        if (result.verified) {
          await registerUser();
          setVerificationStatus('Company verified and registered!');
          navigate('/projects'); // Redirect to projects page
        }
      } catch (err) {
        setVerificationStatus(err.message || 'Verification failed. Company ID not recognized.');
      }
    } else {
      await registerUser();
      setVerificationStatus('Individual registered!');
      navigate('/projects'); // Redirect to projects page
    }
  };

  const registerUser = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        email: user.email,
        type: user.type,
      });
      setUser({ email: '', password: '', type: 'individual', companyId: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="register-page">
      <img src={backgroundImage} alt="Background" className="background" /> {/* Use imported image */}
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
          />
          <RadioGroup name="type" value={user.type} onChange={handleChange} row>
            <FormControlLabel value="individual" control={<Radio />} label="Individual" />
            <FormControlLabel value="organization" control={<Radio />} label="Organization" />
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
            />
          )}
          <Button type="submit" color="primary" variant="contained">Register</Button>
          {verificationStatus && <p>{verificationStatus}</p>}
        </form>
      </div>
    </div>
  );
};

export default Register;
