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
        let jestas = await Jesta.find().sort({ executedAt: -1 }); // sorted newest first

        const updatedJestas = await Promise.all(jestas.map(async (jesta) => {
            if (jesta.status === "requested" && jesta.executionTime < now) { // if jesta is expired
                // Refund the reward to the receiver
                const user = await User.findOne({ UID: jesta.receiverUid });
                if (user) {
                    user.points += jesta.reward; // give back reward
                    await user.save();
                }

                // Mark jesta as expired
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
},
// accept a jesta
acceptJesta: async (req, res) => {
    try {
        // Get UID from URL params
        const uid = req.params.uid;

        // Get Jesta object from body
        const jesta = req.body;

        // Find the Jesta in DB
        const dbJesta = await Jesta.findById(jesta._id);
        if (!dbJesta){ 
            console.log("Jesta not found")
            return res.status(404).json({ message: "Jesta not found" });
        }

        // Prevent double accepting
        if (dbJesta.status !== "requested") {
            console.log("Jesta already handled")
            return res.status(400).json({ message: "Jesta already handled" });
        }

        // Find the user
        const user = await User.findOne({ UID: uid });
        if (!user) {
            console.log("user not found")
            return res.status(404).json({ message: "User not found" });
        }

        // Add reward points
        user.points += dbJesta.reward;
        await user.save();

        // Update Jesta
        dbJesta.giverUid = uid;
        dbJesta.status = "accepted";
        await dbJesta.save();

        // Return updated Jesta
        res.json(dbJesta);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
},
// delete a jesta
deleteJesta: async (req, res) => {
    try {
        // Get Jesta ID from URL
        const jestaId = req.params.id;

        // Find the Jesta in DB
        const dbJesta = await Jesta.findById(jestaId);
        if (!dbJesta) return res.status(404).json({ message: "Jesta not found" });

        // Only delete if status is "requested"
        if (dbJesta.status !== "requested") {
            return res.status(400).json({ message: "Only requested Jestes can be deleted" });
        }

        // Delete the Jesta
        const deletedJesta = await Jesta.findByIdAndDelete(jestaId);

        // Give reward to receiver
        const receiver = await User.findOne({ uid: deletedJesta.receiverUid });
        if (receiver) {
            receiver.points += deletedJesta.reward;
            await receiver.save();
        }

        res.json({ message: "Jesta deleted and reward given to receiver", jesta: deletedJesta });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
}
};
