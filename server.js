const dotenv = require('dotenv');
const app = require('./app');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });
const port = process.env.PORT || 3000;

process.on('uncaughtException', (err) => {
  console.log(err, err.message);
  console.log('unhandled exception 🔥 shutting down ....');
  server.close(() => {
    process.exit(1);
  });
});

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

const server = app.listen(port, '127.0.0.1', () => {
  console.log('server is listening ');
});

process.on('unhandledRejection', (err) => {
  console.log(err, err.message);
  console.log('unhandled rejection 🔥 shutting down ....');
  server.close(() => {
    process.exit(1);
  });
});
