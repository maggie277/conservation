import React, { useState } from 'react';
import { auth, db } from '../firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import { Button, TextField, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { verifyOrganization } from '../utils/verifyOrganization';

const Register = () => {
  const [user, setUser] = useState({
    email: '',
    password: '',
    type: 'individual',
  });

  const [verificationStatus, setVerificationStatus] = useState(null);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user.type === 'organization') {
      try {
        const result = await verifyOrganization(user.email);
        if (result.verified) {
          await registerUser();
          setVerificationStatus('Organization verified and registered!');
        }
      } catch (err) {
        setVerificationStatus(err.message || 'Verification failed. Organization not recognized.');
      }
    } else {
      await registerUser();
      setVerificationStatus('Individual registered!');
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
      setUser({ email: '', password: '', type: 'individual' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField name="email" label="Email" value={user.email} onChange={handleChange} fullWidth />
      <TextField name="password" label="Password" type="password" value={user.password} onChange={handleChange} fullWidth />
      <RadioGroup name="type" value={user.type} onChange={handleChange} row>
        <FormControlLabel value="individual" control={<Radio />} label="Individual" />
        <FormControlLabel value="organization" control={<Radio />} label="Organization" />
      </RadioGroup>
      <Button type="submit" color="primary" variant="contained">Register</Button>
      {verificationStatus && <p>{verificationStatus}</p>}
    </form>
  );
};

export default Register;
