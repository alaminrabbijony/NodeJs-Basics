const express = require('express');
const morgan = require('morgan');
const rateLimiter = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
//const xssClean = require('xss-clean')
const hpp = require('hpp');

//ROUTER
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes')

//MIDDLEWARES
const AppError = require('./util/AppError');
const globalErrorHandler = require('./Middleware/globalErrorHandler');

const app = express();

/**
 * 1) GLOBAL MIDDLWARES
 */

//Set http security headers
// some opts needs to be change here for pos
app.use(helmet());

// Devlopment logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 1.1) middlewares from packages

//Rate limit middleware
const limiter = rateLimiter({
  max: 100,
  windowMs: 60 * 60 * 1000, //1hr,
  message: 'Too many req from this ip. Plz try again in 1hr 😭😭',
});
app.use('/api', limiter);

//Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' })); // middleware for parsing req body

/*DATA SANITIZE*/
// For noSql query injection
app.use(mongoSanitize());
// for cross section script attack
//app.use(xssClean()) //depriciated

//Parameter pollution
app.use(
  hpp({
    whitelist: ['ratingsAverage', 'duration', 'difficulty', 'rating', 'price'],
  })
);

//servic static files
app.use(express.static(`${__dirname}/starter/public`));

// 1.2) Custome middlewares

// Testing middleware
app.use((req, res, next) => {
  req.reqTime = new Date().toISOString();
  //console.log(req.headers); // => for testing the token send
  next();
});

// 4.3) Mount router

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter)

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
