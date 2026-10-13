
const isValidName = (name) => {
  return typeof name === 'string' && name.trim().length >= 2;
};

const isValidEmail = (email) => {
  return typeof email === 'string' &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

module.exports = {
  isValidName,
  isValidEmail
};
