import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyResetToken, resetPassword } from '../services/authService';
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

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyToken = async () => {
      const oobCode = searchParams.get('oobCode');
      if (!oobCode) {
        setError('Invalid reset link');
        return;
      }

      setIsLoading(true);
      const { email: verifiedEmail, error: verifyError } = await verifyResetToken(oobCode);
      setIsLoading(false);

      if (verifyError) {
        setError(verifyError);
      } else {
        setEmail(verifiedEmail);
      }
    };

    verifyToken();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const oobCode = searchParams.get('oobCode');
    if (!oobCode) {
      setError('Invalid reset link');
      return;
    }

    setIsLoading(true);
    setError('');
    
    const { error: resetError } = await resetPassword(oobCode, newPassword);
    setIsLoading(false);

    if (resetError) {
      setError(resetError);
    } else {
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <StyledContainer maxWidth={false}>
      <BackgroundImage src={loginBackground} alt="Zambian farmland" />
      <FormContainer>
        <Typography variant="h4" gutterBottom sx={{ color: 'var(--green)', textAlign: 'center' }}>
          Reset Password
        </Typography>
        
        {email && (
          <Typography variant="body1" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            Reset password for {email}
          </Typography>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="new-password"
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            fullWidth
            margin="normal"
            required
            autoComplete="new-password"
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
            disabled={isLoading || !email}
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
            {isLoading ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>
        
        {!email && !error && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography color="textSecondary">
              Verifying reset link...
            </Typography>
          </Box>
        )}
      </FormContainer>
    </StyledContainer>
  );
};

export default ResetPassword;