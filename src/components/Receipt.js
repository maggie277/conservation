import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button } from '@mui/material';
import { jsPDF } from 'jspdf';

const Receipt = () => {
  const { state } = useLocation();
  const { projectId } = useParams();
  const { amount } = state;

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Donation Receipt', 10, 10);
    doc.text(`Project ID: ${projectId}`, 10, 20);
    doc.text(`Amount: $${amount}`, 10, 30);
    doc.text('Thank you for your donation!', 10, 40);
    doc.save('receipt.pdf');
  };

  return (
    <div>
      <h1>Donation Receipt</h1>
      <p>Project ID: {projectId}</p>
      <p>Amount: ${amount}</p>
      <p>Thank you for your donation!</p>
      <Button variant="contained" color="primary" onClick={generatePDF}>Save as PDF</Button>
    </div>
  );
};

export default Receipt;
