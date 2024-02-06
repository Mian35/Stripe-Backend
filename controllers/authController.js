
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');
const User = require('../models/User.js');


const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);




  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};
const register = (async (req, res, next) => {

  console.log("in the register api")
  console.log(req.body)
  const { firstname, lastname, email, password, role, address } = req.body
  let image = req.file
  if (!email || !password) {
    return AppError(res, 400, false, 'Please provide email and password!');
  }
  const userExist = await User.findOne({ email });
  if (userExist) {
    return AppError(res, 400, false, 'User already exist');
  }
  if (image !== undefined) {
    image = req.file.filename
  }
  const newUser = await User.create({
    firstname: firstname,
    lastname: lastname,
    email: email,
    password: password,
    role: role,
    address: address,
    ProfileImage: image

  });

  // const url = `${req.protocol}://${req.get('host')}/me`;
  // // console.log(url);
  // await new Email(newUser, url).sendWelcome();

  createSendToken(newUser, 201, req, res);
});


const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist
  if (!email || !password) {
    return AppError(res, 400, false, 'Please provide email and password!');
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return AppError(res, 400, false, 'Invalid  email and password!');
  }

  // 3) If everything ok, send token to client
  createSendToken(user, 200, req, res);

});

const getme = async (req, res, next) => {
  const user = await User.
  findById(req.params.id = req.user.id)
  next();
  AppError(res, 200, true, 'Your Information', user);
}

module.exports = { register, login, getme };