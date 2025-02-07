import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig'; // Ensure correct import path
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { Button, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { verifyOrganization } from '../utils/verifyOrganization'; // Ensure correct import path
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import './Register.css'; // Ensure this import is correct
import registerBackground from '../pictures/register-image.jpg'; // Ensure the correct path

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
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      const uid = userCredential.user.uid;

      if (user.type === 'organization') {
        const companyId = user.companyId;
        const result = await verifyOrganization(companyId);

        if (result.verified) {
          await addDoc(collection(db, 'users'), {
            uid: uid,
            email: user.email,
            type: user.type,
            companyId: companyId,
          });
          setVerificationStatus('Company verified and registered!');
        } else {
          setVerificationStatus(result.message);
          return;
        }
      } else {
        await addDoc(collection(db, 'users'), {
          uid: uid,
          email: user.email,
          type: user.type,
        });
      }

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
              error={user.type === 'organization' && !/^ZMW\d{6}$/.test(user.companyId)}
              helperText={
                user.type === 'organization' && !/^ZMW\d{6}$/.test(user.companyId)
                  ? 'Company ID must start with "ZMW" followed by 6 digits.'
                  : ''
              }
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
