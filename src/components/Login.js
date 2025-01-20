import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginStatus, setLoginStatus] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === 'email') {
      setEmail(e.target.value);
    } else if (e.target.name === 'password') {
      setPassword(e.target.value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoginStatus('Successfully logged in!');
      navigate('/projects'); // Redirect to projects page
    } catch (err) {
      setLoginStatus('Login failed. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField name="email" label="Email" value={email} onChange={handleChange} fullWidth />
      <TextField name="password" label="Password" type="password" value={password} onChange={handleChange} fullWidth />
      <Button type="submit" color="primary" variant="contained">Login</Button>
      {loginStatus && <p>{loginStatus}</p>}
    </form>
  );
};

export default Login;
