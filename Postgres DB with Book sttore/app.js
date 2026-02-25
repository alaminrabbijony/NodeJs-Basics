const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const app = express()
//const xssClean = require('xss-clean')
const hpp = require('hpp');


/*--------------------------------------- GLOBAL MIDDLEWARES --------------------------------- */

app.use(helmet())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use(express.json({limit: '10kb'}))
//servic static files
app.use(express.static(`${__dirname}/starter/public`));


/*--------------------------------------- ROUTERS ---------------------------------- */
const bookRouter = require('./routers/bookRoutes');
const authorRouter = require('./routers/authorRoutes');
const globalErrorHandler = require('./middlewares/globalErrorHandler');
const AppError = require('./utils/AppError');
app.use('/api/v1/books', bookRouter)
app.use('/api/v1/authors', authorRouter)

//UNHANDLED ROUTES
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!😭😭`, 404))
})

/*--------------------------------------- GLOBAL ERROR HANDLER --------------------------------- */

app.use(globalErrorHandler)

module.exports = app