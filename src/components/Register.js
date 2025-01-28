import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { Button, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { verifyOrganization } from '../utils/verifyOrganization';
import { useNavigate } from 'react-router-dom';
import './Register.css'; // Import the CSS file

const Register = () => {
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
    <form onSubmit={handleSubmit}>
      <TextField
        name="email"
        label="Email" // The label appears above the input box
        value={user.email}
        onChange={handleChange}
        fullWidth
        margin="normal"
        variant="outlined"
        InputLabelProps={{ shrink: true }} // Ensures the label stays above the input
      />
      <TextField
        name="password"
        label="Password" // The label appears above the input box
        type="password"
        value={user.password}
        onChange={handleChange}
        fullWidth
        margin="normal"
        variant="outlined"
        InputLabelProps={{ shrink: true }} // Ensures the label stays above the input
      />
      <RadioGroup name="type" value={user.type} onChange={handleChange} row>
        <FormControlLabel value="individual" control={<Radio />} label="Individual" />
        <FormControlLabel value="organization" control={<Radio />} label="Organization" />
      </RadioGroup>
      {user.type === 'organization' && (
        <TextField
          name="companyId"
          label="Company ID" // The label appears above the input box
          value={user.companyId}
          onChange={handleChange}
          fullWidth
          margin="normal"
          variant="outlined"
          InputLabelProps={{ shrink: true }} // Ensures the label stays above the input
        />
      )}
      <Button type="submit" color="primary" variant="contained">Register</Button>
      {verificationStatus && <p>{verificationStatus}</p>}
    </form>
  );
};

export default Register;
