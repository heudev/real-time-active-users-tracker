const mongoose = require("mongoose");

const db = mongoose.connection;

db.once("open", () => {
    console.log("Connected to MongoDB");
});

const connectDB = async () => {
    mongoose.connect(`mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`);
};

module.exports = {
    connectDB,
};