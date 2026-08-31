const mongoose = require("mongoose")

const locationRequestSchema = new mongoose.Schema(
    {
        requestId: {
            type: String,
            required: true,
            unique: true
        },

        phone: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["waiting", "location_received", "expired"],
            default: "waiting"
        },

        latitude: {
            type: Number,
            default: null
        },

        longitude: {
            type: Number,
            default: null
        },

        accuracy: {
            type: Number,
            default: null
        },

        locationUpdatedAt: {
            type: Date,
            default: null
        },

        expiresAt: {
            type: Date,
            required: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "LocationRequest",
    locationRequestSchema
);