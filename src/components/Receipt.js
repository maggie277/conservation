import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const Receipt = () => {
  const { projectId } = useParams();
  const { search } = useLocation();
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const token = new URLSearchParams(search).get('ID');
    if (token) {
      const verifyToken = async (transactionToken) => {
        const response = await fetch('http://localhost:4000/verify-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ CompanyToken: '8D3DA73D-9D7F-4E09-96D4-3D44E7A83EA3', transactionToken })
        });

        const responseData = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseData, 'text/xml');
        const result = xmlDoc.getElementsByTagName('Result')[0].childNodes[0].nodeValue;
        const resultExplanation = xmlDoc.getElementsByTagName('ResultExplanation')[0].childNodes[0].nodeValue;
        setPaymentDetails({ result, resultExplanation });
      };

      verifyToken(token).catch(console.error);
    }
  }, [search]);

  return (
    <div>
      <h1>Donation Receipt for Project {projectId}</h1>
      {paymentDetails ? (
        <>
          <p>Result: {paymentDetails.result}</p>
          <p>Explanation: {paymentDetails.resultExplanation}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
      <p>Thank you for your donation!</p>
    </div>
  );
};

export default Receipt;
