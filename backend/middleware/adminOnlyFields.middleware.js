/**
 * Middleware to remove admin-only fields from request body for non-admin users
 * This prevents regular users from updating admin-only fields
 */
exports.filterAdminOnlyFields = (req, res, next) => {
  // If user is admin, allow all fields
  if (req.user && req.user.role === 'admin') {
    return next();
  }

  // Define admin-only fields (for orders: assignedTo, adminNotes, priority, tags, estimatedDeliveryDate)
  const adminOnlyFields = ['assignedTo', 'adminNotes', 'priority', 'tags', 'estimatedDeliveryDate', 'dueDate'];

  // Remove admin-only fields from request body if user is not admin
  adminOnlyFields.forEach(field => {
    if (req.body[field] !== undefined) {
      delete req.body[field];
    }
  });

  next();
};

