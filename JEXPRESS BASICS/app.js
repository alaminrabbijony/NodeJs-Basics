const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./util/AppError');
const globalErrorHandler = require('./Middleware/globalErrorHandler');

const app = express();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//1) MIDDLWARES

// 1.1) middlewares from packages

app.use(express.json()); // middleware for parsing req body

app.use(express.static(`${__dirname}/starter/public`));

// 1.2) Custome middlewares
// app.use((req, res, next) => {
//   console.log('THIS IS A MIDDLEWARE. REQ MUST GO THROUGH ME');
//   next();
// });

app.use((req, res, next) => {
  req.reqTime = new Date().toISOString();
  next();
});

// 4.3) Mount router

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// 4.4) Handling Unhandled Routes
app.all('*', (req, res, next) => {
  /* 
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  })
*/
  // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  // err.statusCode = 404;
  // err.status = 'fail';
  //instead of creating error object manually, we can use AppError class
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)); 
});

//GLOBAL ERROR HANDLING MIDDLEWARE
app.use(globalErrorHandler);


module.exports = app;
