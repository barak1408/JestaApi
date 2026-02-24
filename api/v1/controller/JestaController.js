const Jesta = require('../model/JestaModel');
const User = require('../model/UserModel');

module.exports = {

        createUser: async (req, res) => {
        try {
            const { firebaseUid, name, imageUrl } = req.body;

            // check if user already exists
            const existingUser = await User.findOne({ firebaseUid });
            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            const user = await User.create({
                firebaseUid,
                name,
                imageUrl,
                points: 500 // default points
            });

            res.status(201).json(user);

        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    createJesta: async (req, res) => {
        try {

            const jesta = await Jesta.create(req.body);

            // עדכון נקודות
            await User.findOneAndUpdate(
                { firebaseUid: jesta.giverUid },
                { $inc: { points: jesta.reward } }
            );

            await User.findOneAndUpdate(
                { firebaseUid: jesta.receiverUid },
                { $inc: { points: -jesta.cost } }
            );

            res.json(jesta);

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
