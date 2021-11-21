const mongoose = require('mongoose');
const tourModel = require('../../Model/tour');
const userModel = require('../../Model/user');
const reviewModel = require('../../Model/reviewModel');

const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const db = process.env.DATABASE.replace('<password>', process.env.DB_PASSWORD);

(async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });

    console.log('mongodb connected successfully');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
})();

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`), 'utf-8');
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`),
  'utf-8'
);
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`), 'utf-8');

const importData = async () => {
  try {
    await tourModel.create(tours);
    await userModel.create(users, { validateBeforeSave: false });
    await reviewModel.create(reviews, { validateBeforeSave: false });

    console.log('data loaded successfully');
  } catch (error) {
    console.error(error.message);
  }
  process.exit();
};
const deleteData = async () => {
  try {
    await tourModel.deleteMany();
    await userModel.deleteMany();
    await reviewModel.deleteMany();

    console.log('data deleted successfully');
  } catch (error) {
    console.error(error.message);
  }
  process.exit();
};
if (process.argv[2] === '--delete-data') {
  deleteData();
} else if (process.argv[2] == '--import-data') {
  importData();
}
