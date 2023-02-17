const jwt = require('jsonwebtoken');

const createToken = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
  return token;
};

module.exports = createToken;