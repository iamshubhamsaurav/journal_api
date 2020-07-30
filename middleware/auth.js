exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppError('You are not authorized to access this route', 401)
    );
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    const user = await User.findById(decoded.id);
    req.user = user;
    next();
  } catch (error) {
    return next(
      new AppError(' You are not authorized to access this route', 401)
    );
  }
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return new AppError(
        `User role ${req.user.role} are not authorized to access this route`,
        401
      );
    }
    next();
  };
};
