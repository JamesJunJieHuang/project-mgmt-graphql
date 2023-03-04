const mongoose = require('mongoose');

mongoose.set("strictQuery", false);

const connectDB = async () => {
  const conn = await mongoose.connect('mongodb+srv://test:123@cluster0.ghwymsm.mongodb.net/?retryWrites=true&w=majority');

  console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
};

module.exports = connectDB;
 