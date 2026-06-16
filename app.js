require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const admin = require("firebase-admin");

const uri = process.env.MONGO_STR

console.log("ADMIN CHECK:", admin);
console.log("HAS CREDENTIAL:", admin?.credential);

admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
  })
});

console.log("ADMIN CHECK:", admin);
console.log("HAS CREDENTIAL:", admin?.credential);

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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const JestaRouter = require('./api/v1/routes/JestaRouter');

app.use("/jesta", JestaRouter);

module.exports = app;