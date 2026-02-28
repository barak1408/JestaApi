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
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { jesta, points } = req.body;

        // validation
        if (!jesta) throw new Error("Jesta is required");
        if (!jesta.receiverUid) throw new Error("receiverUid is required in Jesta");
        if (typeof points !== "number") throw new Error("points must be a number");

        const uid = jesta.receiverUid; // use receiverUid as the user to update

        // 1️⃣ Create the Jesta
        const newJesta = await Jesta.create([jesta], { session });

        // 2️⃣ Deduct points from the user
        const user = await User.findOneAndUpdate(
            { UID: uid },
            { $inc: { points: -points } },
            { new: true, session }
        );

        if (!user) throw new Error("User not found for the given receiverUid");

        // 3️⃣ Commit transaction
        await session.commitTransaction();
        session.endSession();

        // 4️⃣ Respond with the new Jesta and updated user
        res.status(201).json({ jesta: newJesta[0], user });

    } catch (err) {
        // rollback transaction
        await session.abortTransaction();
        session.endSession();

        console.error("Transaction failed:", err);
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
    // get all jestas
    getAllJestas: async (req, res) => {
    try {
        const jestas = await Jesta.find(); // מחזיר הכל
        res.json(jestas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
};
