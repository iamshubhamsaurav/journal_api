const AppError = require('./appError');

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendDevelopmentError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (err.code === 11000) error = handleDuplicationError(error);
    sendProductionError(error, res);
  }
};

const handleCastError = (error) => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicationError = (error) => {
  const value = error.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0];
  const message = `Duplicate Fields Value Entered: ${value}. Please Enter another value`;
  return new AppError(message, 400);
};

const handleValidationError = (error) => {
  const errors = Object.values(error.errors).map((er) => el.message);
  const message = `Invalid Input Data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendProductionError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.log(`ERROR: `, err);
    res
      .status(500)
      .json({ success: false, message: 'Something went very wrong!' });
  }
};

const sendDevelopmentError = (err, res) => {
  res.status(err.statusCode).json({
    name: err.name,
    status: err.status,
    stack: err.stack,
    error: err,
  });
};
