const Jesta = require('../model/JestaModel');
const User = require('../model/UserModel');
const mongoose = require('mongoose');

module.exports = {
    
    // update user points
    addUserPoints: async (req, res) => {
    try {
        const { UID, points } = req.body;

        if (!UID) {
            return res.status(400).json({ error: "UID is required" });
        }

        if (typeof points !== "number") {
            return res.status(400).json({ error: "points must be a number" });
        }

        const user = await User.findOneAndUpdate(
            { UID },
            { $inc: { points: points } },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(user);

    } catch (err) {
        console.error("Error updating points:", err);
        res.status(500).json({ error: err.message });
    }
},

    // Get a user by UID
    getUserByUid: async (req, res) => {
        try {
            const { uid } = req.params;

            // Look up by UID (matches Android class)
            const user = await User.findOne({ UID: uid });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json(user);

        } catch (err) {
            console.error("Error in getUserByUid:", err);
            res.status(500).json({ error: err.message });
        }
    },

    // Create a new user
createUser: async (req, res) => {
    try {

        if (!req.body.UID) {
            return res.status(400).json({ error: "UID is required" });
        }

        const user = await User.create(req.body);

        res.status(201).json(user);

    } catch (err) {
        console.error("Error in createUser:", err);
        res.status(500).json({ error: err.message });
    }
},

    // create a jesta and subtract points from user
createJestaAndUpdatePoints: async (req, res) => {
    try {
        const jesta = req.body;           // Jesta object from body
        const points = parseInt(req.params.points); // points from URL

        if (!jesta) return res.status(400).json({ error: "Jesta is required" });
        if (!jesta.receiverUid) return res.status(400).json({ error: "receiverUid is required in Jesta" });
        if (isNaN(points)) return res.status(400).json({ error: "points must be a number" });

        const uid = jesta.receiverUid;

        // 1️⃣ create the Jesta
        const newJesta = await Jesta.create(jesta);

        // 2️⃣ deduct points from the user
        const user = await User.findOneAndUpdate(
            { UID: uid },
            { $inc: { points: -points } },
            { new: true }
        );

        if (!user) return res.status(404).json({ error: "User not found" });

        res.status(201).json({ jesta: newJesta, user });

    } catch (err) {
        console.error("Error in createJestaAndUpdatePoints:", err);
        res.status(500).json({ error: err.message });
    }
},


    // get jestas that user accepted
    getGivenJestas: async (req, res) => {
        try {
            const { uid } = req.params;
            const jestas = await Jesta.find({ giverUid: uid });
            res.json(jestas);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    // get jestas that user created
    getReceivedJestas: async (req, res) => {
        try {
            const { uid } = req.params;
            const jestas = await Jesta.find({ receiverUid: uid });
            res.json(jestas);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    // get all jestas that are requested
    getAllJestas: async (req, res) => {
        try {
            const now = new Date();

            // Find all Jestas
            let jestas = await Jesta.find();

            // Update expired ones and filter requested only
            const updatedJestas = await Promise.all(jestas.map(async (jesta) => {
                if (jesta.status === "requested" && jesta.executionTime < now) {
                    jesta.status = "expired";
                    await jesta.save();
                }
                return jesta;
            }));

            // Return only requested ones
            const requestedJestas = updatedJestas.filter(j => j.status === "requested");

            res.json(requestedJestas);
        } catch (err) {
            res.status(500).json({ error: err.message });
    }
}
};
