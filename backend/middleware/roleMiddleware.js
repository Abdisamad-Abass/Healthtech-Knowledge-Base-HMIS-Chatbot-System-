module.exports = (allowedRoles = []) => {
  return (req, res, next) => {
    // Authentication check
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    // Role check
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "You do not have permission to access this resource.",
      });
    }

    next();
  };
};
