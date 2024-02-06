const AppError = require('./../utils/appError');

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return AppError(res, 400, false, 'You are not authroized to this route');
    }
    next();
  };
};
module.exports = { restrictTo }