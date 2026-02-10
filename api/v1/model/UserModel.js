const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    firebaseUid: {
        type: String,
        required: true,
        unique: true
    },

    name: String,
    imageUrl: String,

    points: {
        type: Number,
        default: 500
    }

}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
