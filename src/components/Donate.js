import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button, TextField } from '@mui/material';

const Donate = () => {
  const { projectId } = useParams();
  const [amount, setAmount] = useState('');
  const [donationStatus, setDonationStatus] = useState(null);

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const transactionData = {
        CompanyToken: '8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3',
        PaymentAmount: amount,
        PaymentCurrency: 'USD',
        CompanyRef: `TRX-${Date.now()}`,
        RedirectURL: `http://localhost:3000/receipt/${projectId}`,
        BackURL: `http://localhost:3000/receipt/${projectId}`,
        CompanyRefUnique: '0',
        PTL: '5',
        ServiceType: '3854',
        ServiceDescription: 'Test Product',
        ServiceDate: new Date().toISOString().split('T')[0]
      };

      const response = await fetch('http://localhost:4000/create-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      const tokenResponse = await response.text();
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(tokenResponse, 'text/xml');
      const transToken = xmlDoc.getElementsByTagName('TransToken')[0].childNodes[0].nodeValue;
      const paymentURL = `https://secure.3gdirectpay.com/payv3.php?ID=${transToken}`;

      // Redirect the customer to the payment URL
      window.location.href = paymentURL;
    } catch (error) {
      setDonationStatus('Payment failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Donate to Project {projectId}</h1>
      <TextField name="amount" label="Amount" value={amount} onChange={handleChange} fullWidth />
      <Button type="submit" color="primary" variant="contained">Pay</Button>
      {donationStatus && <p>{donationStatus}</p>}
    </form>
  );
};

export default Donate;
