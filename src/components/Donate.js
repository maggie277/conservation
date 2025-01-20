import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, TextField } from '@mui/material';

const Donate = () => {
  const { projectId } = useParams();
  const [amount, setAmount] = useState('');
  const [donationStatus, setDonationStatus] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Simulate payment process with mock API
    try {
      await mockPaymentAPI(amount);
      setDonationStatus('Payment successful!');
      navigate(`/receipt/${projectId}`, { state: { amount } });
    } catch (err) {
      setDonationStatus('Payment failed. Please try again.');
    }
  };

  const mockPaymentAPI = (amount) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount > 0) {
          resolve(true); // Simulated successful payment
        } else {
          reject(new Error('Invalid amount'));
        }
      }, 1500);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField name="amount" label="Amount" value={amount} onChange={handleChange} fullWidth />
      <Button type="submit" color="primary" variant="contained">Pay</Button>
      {donationStatus && <p>{donationStatus}</p>}
    </form>
  );
};

export default Donate;
