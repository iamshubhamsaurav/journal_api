const colors = require('colors');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

const connectDB = require('./config/db');
const errorHandler = require('./utils/errorHandler');
const AppError = require('./utils/appError');

const journalRoute = require('./routes/journals');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/auth');

process.on('uncaughtException', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  //Exit the app forcefully because the process obj is in unclean state and the app needs to be restarts to fix it...
  process.exit(1);
});

dotenv.config({ path: './config/config.env' });

connectDB();

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/journals', journalRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/user', userRoute);

app.get('*', (req, res, next) => {
  return next(
    new AppError(`Resource: ${req.url} not found on the server.`, 404)
  );
});

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Listening to Server on PORT: ${PORT}`.green);
});

process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
