const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  address: { type: String, default: "" },
  city: { type: String, default: "" },
  country: { type: String, default: "" },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 }
}, { _id: false }); // keep it as subdocument

const JestaSchema = new mongoose.Schema({

    giverUid: {
        type: String,
        required: false,
        default: ""
    },

    receiverUid: {
        type: String,
        required: true
    },

    location: {
        type: LocationSchema,
        default: () => ({})
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

    executionTime: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        default: "requested"  // requested, accepted, cancelled, expired
    },

    imageUrl: String,

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
