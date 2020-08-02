const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../model/User');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/sendEmail');
const crypto = require('crypto');

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

exports.getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({ success: true, data: user });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError('Please send email', 401));
  }
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('User Not Found', 404));
  }

  const resetToken = user.getPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `You can reset your password with this link: ${resetUrl}. If you haven't requested for it then IGNORE`;

  try {
    await sendMail({
      email: user.email,
      subject: 'Password Reset Token',
      message,
    });
    res
      .status(200)
      .json({ success: true, message: 'Email Sent. Check your inbox.' });
  } catch (error) {
    console(error);
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpiresIn = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('Email could not be send. Please try again later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.resettoken)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken,
    passwordResetTokenExpiresIn: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Invalid Token', 401));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiresIn = -undefined;
  await user.save();

  createSendToken(user, 200, res);
});
