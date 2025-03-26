export const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

export const validatePhone = (phone) => {
    const re = /^0(96|97|76|77)\d{7}$/;
    return re.test(phone);
};

export const validateAmount = (amount) => {
    return parseFloat(amount) >= 1;
};