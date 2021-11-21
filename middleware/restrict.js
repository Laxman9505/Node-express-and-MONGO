const AppError = require('../utils/appError');
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(new AppError('You are not authorized to perform this action', 403));
    }
    next();
  };
};
