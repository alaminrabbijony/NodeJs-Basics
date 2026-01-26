/**
 * ============================
 * 1) CRASH FAST ON SYNC ERRORS
 * ============================
 */

//GLOBAL UNCAUGHT EXCEPTION ERROR HANDLER
process.on('uncaughtException', (err) => {
  //console.log(err.name, err.message);
  console.error('Uncaught Exception! 💥 Shutting down...💥💥💥', err);
  process.exit(1);
});

/**
 * ============================
 * 2) LOAD & VALIDATE ENV
 * ============================
 */
//env var 1st
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const REQUIRED_ENVS = ['DB', 'MONGODB_PASSWORD', 'PORT', 'NODE_ENV'];

REQUIRED_ENVS.forEach((ev) => {
  if (!process.env[ev])
    console.error(
      `💥💥💥\nERROR: Missing required environment variable ${ev}\n💥💥💥`
    );
  process.exit(1); // Exit if any required env var is missing
});

/**
 * ============================
 * 3) IMPORT CORE DEPENDENCIES
 * ============================
 */
const mongoose = require('mongoose');
const app = require('./app');

/**
 * ============================
 * 4) DATABASE CONNECTION
 * ============================
 */
const db = process.env.DB.replace('<PASSWORD>', process.env.MONGODB_PASSWORD);
// console.log(db);

const connectDB = async () => {
  await mongoose.connect(db);
  console.log('✅✅✅\n MONGODB connected! \n✅✅✅');
};

/**
 * ============================
 * 5) START SERVER (ONLY AFTER DB)
 * ============================
 */

let server;
const port = process.env.PORT || 3000;
const start = async () => {
  try {
    await connectDB();
    server = app.listen(port, () => {
      console.log(`🚀🚀🚀Listening from ${port}...`);
    });
  } catch (error) {
    console.error('💥💥💥\nlauching failed:', error);
    process.exit(1);
  }
};

start();

/**
 * ============================
 * 6) HANDLE ASYNC CRASHES
 * ============================
 */
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1); // exit code 1 means failure
      //exit code 0 means success
    });
  } else {
    process.exit(1);
  }
});

/**
 * ============================
 * 7) GRACEFUL SHUTDOWN (OPS)
 * ============================
 */

const shutdown = signal => {
    console.log(`☢☢☢ ${signal} received. Shutting down gracefully...`);
    if(Server) {
      server.close(() => {
        mongoose.connection.close(false , () => process.exit(0)); // success
      })
    }else{
      process.exit(0);
    }
}

process.on('SIGTERM', () => shutdown('SIGTERM')); // for heroku
process.on('SIGINT', () => shutdown('SIGINT')); // for local ctrl+c
