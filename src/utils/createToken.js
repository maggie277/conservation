import axios from 'axios';

const createToken = async (transactionData) => {
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
    return response.data;
  } catch (error) {
    console.error('Error creating transaction token:', error);
    throw error;
  }
};

export default createToken;
