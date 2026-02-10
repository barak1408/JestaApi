const Jesta = require('../model/JestaModel');
const User = require('../model/UserModel');

module.exports = {

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
    }
};
