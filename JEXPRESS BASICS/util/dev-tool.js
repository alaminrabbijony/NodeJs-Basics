//env var 1st
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });
const mongoose = require('mongoose');

const fs = require('fs');
const Tour = require('../Models/TourModels');
const User = require('../Models/UserModel');
const Review = require('../Models/ReviewModel');

const db = process.env.DB.replace('<PASSWORD>', process.env.MONGODB_PASSWORD);

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(db);
    console.log(`MONGODB CONNECTED: ${conn.connection.host}`);
  } catch (error) {
    console.log(`ERROR: ${error.message}`);
    process.exit();
  }
};

connectDb();
const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../starter/dev-data/data/tours.json`, 'utf-8')
);
const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../starter/dev-data/data/users.json`, 'utf-8')
);
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/../starter/dev-data/data/reviews.json`, 'utf-8')
);

const importData = async () => {
  try {
    await User.create(users, {validateBeforeSave: false});
    await Tour.create(tours, {validateBeforeSave: false});
    await Review.create(reviews, {validateBeforeSave: false});
    console.log('🤗🤗🤗 \n Data successfully loaded! \n🤗🤗🤗');
  } catch (error) {
    console.log(`🤮🤮🤮 \n${error} \n🤮🤮🤮`);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

const deleteData = async () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('😭😭😭 \n Cannot delete data in production\n 😭😭😭');
    }

    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log(`💥💥💥 \n documents deleted \n 💥💥💥`);
  } catch (error) {
    console.log(`🤮🤮🤮 \n${error} \n🤮🤮🤮`);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

const cmd = process.argv[2];

switch (cmd) {
  case 'import':
    importData();
    break;

  case 'delete':
    deleteData();
    break;

  default:
    console.log('❌❌❌\n Unknown command. Use: import | delete \n❌❌❌');
    process.exit();
}
//node dev-tool.js delete
