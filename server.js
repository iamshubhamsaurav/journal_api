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

//Security Modules
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xssClean = require('xss-clean');
const rateLimiter = require('express-rate-limit');
const hpp = require('hpp');
const cors = require('cors');

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

// ****** Security Middlewares ********
//Sanitize data
app.use(mongoSanitize());
//Set Security headers
app.use(helmet());
//Prevent XSS - Cross site scripting attack
app.use(xssClean());
// Limiting requests
app.use(
  rateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 100, //  Max 100 request in the set duration
  })
);
// Prevent Http params pollution
app.use(hpp());
// Enable Cross Site Resource Sharing
app.use(cors());

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
