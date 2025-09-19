export default function authMiddleware(req, res, next) {
  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  // Set user info on request object for easy access
  req.user = {
    _id: req.session.userId,
    role: req.session.userRole,
    status: req.session.userStatus,
    name: req.session.userName
  };
  next();
}