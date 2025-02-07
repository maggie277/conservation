export const verifyOrganization = async (companyId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Check if companyId matches the pattern ZMW followed by 6 digits
      const isValidFormat = /^ZMW\d{6}$/.test(companyId);

      if (isValidFormat) {
        resolve({ verified: true });
      } else {
        resolve({ verified: false, message: 'Company ID not recognized. It should start with "ZMW" followed by 6 digits.' });
      }
    }, 1500); // Simulate a 1.5-second delay
  });
};