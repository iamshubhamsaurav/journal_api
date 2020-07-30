const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../model/User');
const APIFeatures = require('../utils/apiFeatures');

exports.getUsers = catchAsync(async (req, res, next) => {
  const features = APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const users = await features.query;
  res.status(200).json({ success: true, count: users.length, data: users });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User Not Found', 404));
  }
  res.status(200).json({ success: true, data: user });
});

exports.createUser = catchAsync(async (req, res, next) => {
  if (req.body.role === 'admin') {
    return next(new AppError('user role cannot be set to admin', 403));
  }
  const user = await User.create(req.body);
  res.status(200).json({ success: true, data: user });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.role === 'admin') {
    return next(new AppError('user role cannot be set to admin', 403));
  }
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ success: true, dta: user });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, data: {} });
});
