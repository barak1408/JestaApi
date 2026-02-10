require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const uri = process.env.MONGO_STR;

async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}

connectDB();


// Enable CORS for all routes
app.use(cors());
app.use(express.json());


app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json()); // Parse request body JSON
app.use(bodyParser.urlencoded({ extended: true })); // Parse request body


const JestaRouter = require('./api/v1/routes/JestaRouter');
app.use("/jesta",JestaRouter);


module.exports = app;
