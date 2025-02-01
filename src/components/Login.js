import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import './Login.css'; // Ensure this import is correct
import loginBackground from '../pictures/login.jpg'; // Import the image

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
  },
});

const Login = () => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize the navigate hook

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); // Redirect to default dashboard route
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-page">
      <img src={loginBackground} alt="Background" className="background" /> {/* Use imported image */}
      <div className="form-container">
        <form className={classes.root} onSubmit={handleSubmit}>
          <TextField
            name="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            name="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
          <Button type="submit" color="primary" variant="contained">Login</Button>
          {error && <p>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
