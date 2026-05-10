const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * Verifies the Bearer token from the Authorization header.
 * Attaches decoded user info to req.user
 */
const auth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );
    // Support both { userId } (authRoutes) and { id } (legacy) payloads
    req.user = {
      userId: decoded.userId || decoded.id,
      id: decoded.userId || decoded.id,
      role: decoded.role || 'user',
    };
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = auth;
