import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendResetEmail } from '../services/authService';
import { TextField, Button, Typography, Box, Container, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import loginBackground from '../pictures/signin.jpg';
import './Auth.css';

const StyledContainer = styled(Container)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  position: 'relative',
});

const BackgroundImage = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  zIndex: -1,
});

const FormContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  padding: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
  width: '100%',
  maxWidth: '450px',
  animation: 'fadeIn 0.5s ease-out',
}));

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    const { error: sendError } = await sendResetEmail(email);
    
    if (sendError) {
      setError(sendError);
    } else {
      setMessage(`Password reset email sent to ${email}. Please check your inbox.`);
      setEmail('');
    }
    setIsLoading(false);
  };

  return (
    <StyledContainer maxWidth={false}>
      <BackgroundImage src={loginBackground} alt="Zambian farmland" />
      <FormContainer>
        <Typography variant="h4" gutterBottom sx={{ color: 'var(--green)', textAlign: 'center' }}>
          Reset Password
        </Typography>
        <Typography variant="body1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
          Enter your email address to receive a password reset link
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="email"
            sx={{ mb: 2 }}
          />
          
          {message && (
            <Typography color="primary" paragraph sx={{ textAlign: 'center' }}>
              {message}
            </Typography>
          )}
          
          {error && (
            <Typography color="error" paragraph sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          )}
          
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={isLoading}
            sx={{ 
              backgroundColor: 'var(--green)',
              color: 'white',
              padding: '12px',
              mt: 2,
              '&:hover': {
                backgroundColor: 'var(--green-dark)',
              }
            }}
          >
            {isLoading ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>
        
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Link 
            href="/login" 
            sx={{ 
              color: 'var(--green)',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              }
            }}
          >
            Back to Login
          </Link>
        </Box>
      </FormContainer>
    </StyledContainer>
  );
};

export default ForgotPassword;