import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button, TextField, Typography, Link, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import './Login.css';
import loginBackground from '../pictures/signin.jpg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/projects');
    } catch (err) {
      let errorMessage = 'Invalid login. Try again or reset password.';
      
      // More specific error messages
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <Box className="login-page">
      <img src={loginBackground} alt="Zambian farmland" className="background" />
      <Box className="form-container">
        <Typography variant="h4" component="h2" gutterBottom sx={{ 
          color: 'var(--green)',
          textAlign: 'center',
          fontWeight: 600
        }}>
          Welcome to TerraFund Zambia
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="email"
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="current-password"
            sx={{ mb: 1 }}
          />
          
          <Box sx={{ textAlign: 'right', mb: 2 }}>
            <Link 
              href="/forgot-password" 
              sx={{ 
                color: 'var(--green)',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Forgot password?
            </Link>
          </Box>
          
          <Button 
            type="submit" 
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ 
              backgroundColor: 'var(--green)',
              color: 'white',
              padding: '12px',
              marginTop: '10px',
              '&:hover': {
                backgroundColor: 'var(--green-dark)',
              },
              '&:disabled': {
                backgroundColor: 'var(--green-light)',
              }
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          
          {error && (
            <Typography color="error" sx={{ 
              textAlign: 'center',
              mt: 2,
              fontSize: '0.875rem'
            }}>
              {error}
            </Typography>
          )}
          
          <Typography variant="body2" sx={{ 
            textAlign: 'center',
            mt: 3,
            color: 'var(--gray)'
          }}>
            New to TerraFund?{' '}
            <Link 
              href="/register" 
              sx={{ 
                color: 'var(--green)',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': {
                  textDecoration: 'underline',
                }
              }}
            >
              Join as a farmer
            </Link>
          </Typography>
        </form>
      </Box>
    </Box>
  );
};

export default Login;