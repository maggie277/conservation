// src/utils/verifyOrganization.js

const validCompanyIds = ['12345', '67890', 'ABCDE']; // Example company IDs for demo purposes

export const verifyOrganization = async (companyId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (validCompanyIds.includes(companyId)) {
        resolve({ verified: true });
      } else {
        reject({ verified: false, message: 'Company ID not recognized.' });
      }
    }, 1500);
  });
};
