import axios from 'axios';

const verifyToken = async (transactionToken) => {
  const xmlRequest = `
    <?xml version="1.0" encoding="utf-8"?>
    <API3G>
      <CompanyToken>Your_Company_Token</CompanyToken>
      <Request>verifyToken</Request>
      <TransactionToken>${transactionToken}</TransactionToken>
    </API3G>
  `;

  try {
    const response = await axios.post('https://secure.3gdirectpay.com/API/v6/', xmlRequest, {
      headers: { 'Content-Type': 'application/xml' },
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying transaction token:', error);
    throw error;
  }
};

export default verifyToken;
