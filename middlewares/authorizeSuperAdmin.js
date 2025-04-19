const authorizeSuperAdmin = (req, res, next) => {
    if (req.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only Super Admin can access this resource.',
      });
    }
    next();
  };
  
  export default authorizeSuperAdmin;
  