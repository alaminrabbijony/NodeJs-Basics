//env var 1st
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
  console.log('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  process.exit(1);
});

const app = require('./app');

/**
 * 5.CONNECT DB
 */
const db = process.env.DB.replace('<PASSWORD>', process.env.MONGODB_PASSWORD);
// console.log(db);

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(db);
    console.log(`MONGODB CONNECTED: ${conn.connection.host}`);
  } catch (error) {
    console.log(`ERROR: ${error.message}`);
    process.exit();
  }
};
console.log(x);
connectDb();

// DEFINE MONGOOSE SCHEMA AND MODEL (TESTING PURPOSE)

/**

 

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour must have a name'],
    unique: true,
  },
  ratings: {
    type: Number,
    default: 4.5,
  },
  price: {
    type: Number,
    required: [true, 'A tour must have a price'],
  },
});

const Tour = mongoose.model('Tour', tourSchema);

/**
 * Testing the Tour model
const testTour = new Tour({
  name: 'The St. Martin',
  ratings: 4.7,
  price: 497,
});

testTour.save().then((doc) => {
  console.log(doc);
});
 */

const port = process.env.PORT || 3000;

console.log(process.env.NODE_ENV);
// 6) SERVER
const server = app.listen(port, () => {
  console.log(`Listening from ${port}...`);
});

// GLOBAL UNHANDLED REJECTION ERROR HANDLER
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
