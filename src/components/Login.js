import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
      setError('Invalid login. Try again or reset password.');
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <img src={loginBackground} alt="Zambian farmland" className="background" />
      <div className="form-container">
        <h2>Welcome to TerraFund Zambia</h2>
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
          />
          <Button 
            type="submit" 
            variant="contained"
            fullWidth
            disabled={isLoading}
            style={{ 
              backgroundColor: 'var(--green)',
              padding: '12px',
              marginTop: '20px',
              color: 'white'
            }}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          {error && <p className="error-message">{error}</p>}
          <p className="signup-link">
            New to TerraFund? <a href="/register">Join as a farmer</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;