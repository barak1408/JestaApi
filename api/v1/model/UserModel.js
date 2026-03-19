// src/model/UserModel.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  country: { type: String, default: "" },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 }
}, { _id: false }); // keep it as subdocument

const UserSchema = new mongoose.Schema({
  UID: {
    type: String,
    required: true,
    unique: true
  },

  location: {
    type: LocationSchema,
    default: () => ({}) // default empty location
  },

  imageUrl: {
    type: String,
    default: ""
  },

  name: {
    type: String,
    required: true,
    unique: true
  },

  points: {
    type: Number,
    default: 500
  }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);