const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
  const conn = mongoose.connect(process.env.MONGO_URI, {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log(
    `Database Connected: ${(await conn).connection.host}`.cyan.underline.bold
  );
};

module.exports = connectDB;
