const Jesta = require('../model/JestaModel');
const User = require('../model/UserModel');

module.exports = {
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

createJesta: async (req, res) => {
    try {

        if (!req.body.receiverUid) {
            return res.status(400).json({ error: "receiverUid is required" });
        }

        const jesta = await Jesta.create(req.body);

        res.status(201).json(jesta);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
},

    getGivenJestas: async (req, res) => {
        try {
            const { uid } = req.params;
            const jestas = await Jesta.find({ giverUid: uid });
            res.json(jestas);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getReceivedJestas: async (req, res) => {
        try {
            const { uid } = req.params;
            const jestas = await Jesta.find({ receiverUid: uid });
            res.json(jestas);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getAllJestas: async (req, res) => {
    try {
        const jestas = await Jesta.find(); // מחזיר הכל
        res.json(jestas);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
};
