//env var 1st
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });
const mongoose = require('mongoose');

const fs = require('fs');
const Tour = require('../Models/TourModels');

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
const data = JSON.parse(
  fs.readFileSync(
    `${__dirname}/../starter/dev-data/data/tours-simple.json`,
    'utf-8'
  )
);

const importData = async () => {
  try {
    await Tour.create(data);
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

    const result = await Tour.deleteMany();
    console.log(`💥💥💥 \nDeleted ${result.deletedCount} documents \n 💥💥💥`);
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
