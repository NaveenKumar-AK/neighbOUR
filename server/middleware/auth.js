const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_key_here'; // In a real app, use environment variables

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token, authorization denied.' });
    }

    const verified = jwt.verify(token, JWT_SECRET);
    if (!verified) {
      return res.status(401).json({ error: 'Token verification failed, authorization denied.' });
    }

    req.user = verified.id; // user id
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { auth, JWT_SECRET };
