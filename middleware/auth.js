const jwt = require('jsonwebtoken');
const catchAsync = require('./../utils/catchAsync');
const User = require('../models/User')
const { promisify } = require('util');
const AppError = require('../utils/appError')

const auth = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
   // console.log(token)
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
console.log(token)
  if (!token) {
    return  AppError(res,400, false,'Please loginn to continue');
  }
//console.log(process.env.JWT_SECRET,'//////////')
  // 2) Verification token
  const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  console.log(decoded)

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  
  console.log(currentUser,'/////')
  if (!currentUser) {
    return  AppError(res,400, false,'No user with this token');
  }

  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
 
  next();
});
  
module.exports = auth;