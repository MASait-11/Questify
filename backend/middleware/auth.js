/*
 * Authentication Middleware
 * This middleware checks if a user is logged in by verifying the session.
 * Use this middleware on routes that require authentication.
 * If not authenticated, returns 401 Unauthorized.
 */

function requireAuth(req, res, next) {
  // Check if user session exists
  if (req.session && req.session.userId) {
    // User is authenticated, proceed to next middleware/route
    next();
  } else {
    // User is not authenticated
    res.status(401).json({ error: 'Authentication required' });
  }
}

module.exports = { requireAuth };