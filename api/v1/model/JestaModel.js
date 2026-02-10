const mongoose = require('mongoose');

const JestaSchema = new mongoose.Schema({

    giverUid: {
        type: String,
        required: true
    },

    receiverUid: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    description: String,

    executedAt: {
        type: Date,
        default: Date.now
    },

    imageUrl: String,

    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'easy'
    },

    reward: {
        type: Number,
        default: 10
    },

    cost: {
        type: Number,
        default: 30
    }

}, { timestamps: true });

module.exports = mongoose.model("Jesta", JestaSchema);
