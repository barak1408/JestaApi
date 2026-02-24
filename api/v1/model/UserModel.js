// src/model/UserModel.js
const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  // optional, to match your Android Location class
  latitude: { type: Number, default: 0 },
  longitude: { type: Number, default: 0 }
}, { _id: false }); // no separate _id for subdocument

const UserSchema = new mongoose.Schema({
  // matches Android field name
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
    required: true
  },

  points: {
    type: Number,
    default: 500
  }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);