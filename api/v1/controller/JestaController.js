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
            console.log(err.message)
        }
    },

    // Create a new user
createUser: async (req, res) => {
    try {

        if (!req.body.UID) {
            return res.status(400).json({
                code: "UID_REQUIRED",
                message: "UID is required"
            });
        }

        if (!req.body.name) {
            return res.status(400).json({
                code: "USERNAME_REQUIRED",
                message: "Username is required"
            });
        }

        // 🔍 check if username already exists
        const existingUser = await User.findOne({ username: req.body.name });

        if (existingUser) {
            return res.status(409).json({
                code: "USERNAME_EXISTS",
                message: "Username already exists"
            });
        }

        // ✅ create user
        const user = await User.create(req.body);

        return res.status(201).json(user);

    } catch (err) {
        console.error("Error in createUser:", err);

        // 🔥 handle duplicate key (in case unique index is triggered)
        if (err.code === 11000) {
            return res.status(409).json({
                code: "USERNAME_EXISTS",
                message: "Username already exists"
            });
        }

        return res.status(500).json({
            code: "SERVER_ERROR",
            message: err.message
        });
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
        const jestaId = req.params.id;

        // Get Jesta first
        const dbJesta = await Jesta.findById(jestaId);
        if (!dbJesta) {
            return res.status(404).json({ message: "Jesta not found" });
        }

        if (dbJesta.status !== "requested") {
            return res.status(400).json({ message: "Only requested Jestes can be deleted" });
        }

        // Find receiver BEFORE deleting
        const receiver = await User.findOne({ uid: dbJesta.receiverUid });

        // Delete after we got data
        await Jesta.findByIdAndDelete(jestaId);

        // Update points
        if (receiver) {
            receiver.points = receiver.points + dbJesta.reward + dbJesta.cost;
            console.log("added points")
            await receiver.save();
        }
        else console.log("shit")

        return res.json({
            message: "Jesta deleted and reward given to receiver"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
},
// get schedule for a user
getSchedule: async (req, res) => {
    try {
        const { uid } = req.params;

        if (!uid) {
            return res.status(400).json({ error: "UID is required" });
        }

        const now = new Date();

        //  Expire any past accepted jestas
        await Jesta.updateMany(
            { 
                status: "accepted", 
                executionTime: { $lt: now } 
            },
            { $set: { status: "completed" } }
        );

        //  Find all future accepted jestas where user is giver or receiver
        const schedule = await Jesta.find({
            status: "accepted",
            $or: [
                { giverUid: uid },
                { receiverUid: uid }
            ],
            executionTime: { $gte: now } // ensure only future jestas
        }).sort({ executionTime: 1 }); // soonest first

        res.status(200).json(schedule);

    } catch (err) {
        console.error("getSchedule error:", err);
        res.status(500).json({ error: err.message });
    }
},
// updates user
updateUser: async (req, res) => {
    try {
        const uid = req.params.uid;
        const updatedUser = { ...req.body };

        // 🚫 prevent updating points
        delete updatedUser.points;

        // ❗ if username is being updated → check if it exists
        if (updatedUser.username) {
            const existingUser = await User.findOne({ username: updatedUser.name });

            if (existingUser && existingUser.UID !== uid) {
                return res.status(409).json({
                    code: "USERNAME_EXISTS",
                    message: "Username already exists"
                });
            }
        }

        const user = await User.findOneAndUpdate(
            { UID: uid },
            updatedUser,
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                code: "USER_NOT_FOUND",
                message: "User not found"
            });
        }

        return res.status(200).json(user);

    } catch (err) {
        console.error("Error in updateUser:", err);

        // 🔥 handle duplicate key (unique index)
        if (err.code === 11000) {
            return res.status(409).json({
                code: "USERNAME_EXISTS",
                message: "Username already exists"
            });
        }

        return res.status(500).json({
            code: "SERVER_ERROR",
            message: err.message
        });
    }
}
};
