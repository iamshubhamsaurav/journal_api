const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../model/User');
const jwt = require('jsonwebtoken');

const signToken = (id) => {
  return jwt.sign(id, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }
  res.cookie('jwt', token, cookieOptions);
  //Remove the password from output
  user.password = undefined;
  res.status(statusCode).json({ success: true, token, data: user });
};

exports.signup = catchAsync(async (req, res, next) => {
  if (req.body.role === 'admin') {
    return next(new AppError('user role cannot be set to admin', 403));
  }
  const { name, email, password, role } = req.body;
  const user = await User.create({ name, email, password, role });
  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email & password', 400));
  }
  const user = User.findOne({ email: email }).select('+password');
  if (!user || !user.correctPassword(password, user.password)) {
    return next(new AppError('Invalid Login', 401));
  }
  createSendToken(user, 200, res);
});
