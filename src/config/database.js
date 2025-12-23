const mongoose = require("mongoose");

const connectDb = async () => {
  return mongoose.connect(
    "mongodb+srv://test:test@syncnotecluster.nriknl9.mongodb.net/Kanban"
  );
};

module.exports = { connectDb };
