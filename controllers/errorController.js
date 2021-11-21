const AppError = require('../utils/appError');
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 404);
};
const handleDuplicateFieldDB = (err) => {
  const message = `duplicate field value: ${err.keyValue.name}`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');

  return new AppError(`Invalid input data. ${errors}`, 400);
};
const handleJWTerror = (err) =>
  new AppError('Invalid token. please login first!', 401);
const handleTokenExpiredError = (err) =>
  new AppError('Token has already expired. please login again!', 401);

const sendErrorDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorProd = (res, err) => {
  //operational or trusted error: send messages back to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,

      message: err.message,
    });
  }
  //programming or unknown error: dont leak the error details to the client
  else {
    //1) log to the console
    console.error('Error🔥', err);

    //send generic message to the client
    res.status(500).json({
      status: 'fail',
      messge: 'something went very wrong!',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(res, err);
  }
  let error = { ...err };
  if (process.env.NODE_ENV === 'production') {
    if (err.name == 'CastError') error = handleCastErrorDB(err);
    if (err.code == 11000) error = handleDuplicateFieldDB(err);
    if (err.name == 'ValidationError') error = handleValidationErrorDB(err);
    if (err.name == 'JsonWebTokenError') error = handleJWTerror(err);
    if (err.name == 'TokenExpiredError') error = handleTokenExpiredError(err);
    sendErrorProd(res, error);
  }
  next();
};
