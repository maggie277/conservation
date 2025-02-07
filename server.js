const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/create-token', async (req, res) => {
  const transactionData = req.body;
  const xmlRequest = `
    <?xml version="1.0" encoding="utf-8"?>
    <API3G>
      <CompanyToken>${transactionData.CompanyToken}</CompanyToken>
      <Request>createToken</Request>
      <Transaction>
        <PaymentAmount>${transactionData.PaymentAmount}</PaymentAmount>
        <PaymentCurrency>${transactionData.PaymentCurrency}</PaymentCurrency>
        <CompanyRef>${transactionData.CompanyRef}</CompanyRef>
        <RedirectURL>${transactionData.RedirectURL}</RedirectURL>
        <BackURL>${transactionData.BackURL}</BackURL>
        <CompanyRefUnique>${transactionData.CompanyRefUnique}</CompanyRefUnique>
        <PTL>${transactionData.PTL}</PTL>
      </Transaction>
      <Services>
        <Service>
          <ServiceType>${transactionData.ServiceType}</ServiceType>
          <ServiceDescription>${transactionData.ServiceDescription}</ServiceDescription>
          <ServiceDate>${transactionData.ServiceDate}</ServiceDate>
        </Service>
      </Services>
    </API3G>
  `;

  try {
    const response = await axios.post('https://secure.3gdirectpay.com/API/v6/', xmlRequest, {
      headers: { 'Content-Type': 'application/xml' },
    });
    res.send(response.data);
  } catch (error) {
    console.error('Error creating transaction token:', error);
    res.status(500).send('Error creating transaction token');
  }
});

app.post('/verify-token', async (req, res) => {
  const { transactionToken } = req.body;
  const xmlRequest = `
    <?xml version="1.0" encoding="utf-8"?>
    <API3G>
      <CompanyToken>${req.body.CompanyToken}</CompanyToken>
      <Request>verifyToken</Request>
      <TransactionToken>${transactionToken}</TransactionToken>
    </API3G>
  `;

  try {
    const response = await axios.post('https://secure.3gdirectpay.com/API/v6/', xmlRequest, {
      headers: { 'Content-Type': 'application/xml' },
    });
    res.send(response.data);
  } catch (error) {
    console.error('Error verifying transaction token:', error);
    res.status(500).send('Error verifying transaction token');
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
