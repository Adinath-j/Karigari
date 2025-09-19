// Authentication middleware
export const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }
  next();
};

// Role-based authorization middleware
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!req.session.userRole || !roles.includes(req.session.userRole)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

// Admin only middleware
export const requireAdmin = requireRole(['admin']);

// Artisan only middleware
export const requireArtisan = requireRole(['artisan']);

// Customer only middleware
export const requireCustomer = requireRole(['customer']);

// Artisan or Admin middleware
export const requireArtisanOrAdmin = requireRole(['artisan', 'admin']);

// Any authenticated user middleware
export const requireAnyRole = requireRole(['customer', 'artisan', 'admin']);

// Check if user can access resource (own resource or admin)
export const requireOwnershipOrAdmin = (getUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const resourceUserId = await getUserId(req);
      
      if (req.session.userRole === 'admin' || req.session.userId === resourceUserId.toString()) {
        next();
      } else {
        res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Server error',
        error: error.message
      });
    }
  };
};

// Validate approved artisan status
export const requireApprovedArtisan = async (req, res, next) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.session.userRole !== 'artisan') {
      return res.status(403).json({
        success: false,
        message: 'Artisan access required'
      });
    }

    if (req.session.userStatus !== 'approved') {
      return res.status(403).json({
        success: false,
        message: 'Your artisan account is pending approval'
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};