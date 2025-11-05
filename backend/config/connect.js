const mongoose = require("mongoose");
const connectDatabase = async () => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    console.log("Database connection established successfully");
  } catch (err) {
    console.log("Database connection failed");
  }
};
module.exports = connectDatabase;
