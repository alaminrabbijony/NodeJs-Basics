
class AppError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor); //to exclude constructor call from stack trace
/*
        // OTHER CUSTOM PROPERTIES FOR POS
        this.code = this.code; // "INSUFFICIENT_STOCK", "INVALID_INPUT", etc
        this.category = this.category; // "Database", "Validation", etc
        this.meta = this.meta; // Additional info as an object like {productId: 123, quantity: 10}

*/
    }
}

module.exports = AppError;