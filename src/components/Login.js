import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Button, TextField } from '@mui/material';

const Login = () => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      setCredentials({ email: '', password: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField name="email" label="Email" value={credentials.email} onChange={handleChange} fullWidth />
      <TextField name="password" label="Password" type="password" value={credentials.password} onChange={handleChange} fullWidth />
      <Button type="submit" color="primary" variant="contained">Login</Button>
    </form>
  );
};

export default Login;
