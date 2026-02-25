const AppError = require("../utils/AppError");


const handleCastErrorDB = (err) => {
  const msg = `Invalid ${err.path}: ${err.value}.`;
  //Converting to operational error
  return new AppError(msg, 400); // 400 Bad Request
};

const handleDuplicateFieldsDB = (err) => {
  //const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const value = err.keyValue ? JSON.stringify(err.keyValue) : 'Duplicate Value';
  const msg = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(msg, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((e) => e.message);
  const msg = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(msg, 400);
};

const handleJWTError = () =>
  new AppError('🚫🚫Invalid token, Plz login again! 🚫🚫', 401);

const handleTokenEpiredError = () =>
  new AppError('🚫🚫 Ur token has been expired, Plz login again! 🚫🚫', 401);

//ENV

const devErrors = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const prodErrors = (err, res) => {
  if (err.isOperational) {
    //1.trusted error: send message to client

    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //2. programming or other unknown error: don't leak error details
  } else {
    console.error('ERROR 💥', err); // for logging err to the server logfor dev to see
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

const globalErrorHandler = (err, req, res, next) => {
  if (res.headersSent) {
  return next(err);
}
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    return devErrors(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = err; // creating shallow copy of err object

    if (error.cause) error = err.cause;

    if (error.name === 'CastError') {
      error = handleCastErrorDB(error);
    }
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') {
      error = handleValidationErrorDB(error);
    }
    if (error.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }

    if (error.name === 'TokenExpiredError') {
      error = handleTokenEpiredError();
    }

    return prodErrors(error, res);
  }
};
module.exports = globalErrorHandler;
