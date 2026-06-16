const express = require('express');
const router = express.Router();

const verifyToken = require('../../middleware/auth'); 

const {
    createUser,
    getGivenJestas,
    getReceivedJestas,
    getUserByUid,
    getAllJestas,
    addUserPoints,
    createJestaAndUpdatePoints,
    acceptJesta,
    deleteJesta,
    getSchedule,
    updateUser
} = require('../controller/JestaController');


// 🌐 PUBLIC ROUTE (NO TOKEN)
router.get('/all/:sort/:userLat/:userLng', getAllJestas);


// 🔐 PROTECTED ROUTES (TOKEN REQUIRED)

// jestas
router.post('/create', verifyToken, createJestaAndUpdatePoints);
router.get('/given/:uid', verifyToken, getGivenJestas);
router.get('/received/:uid', verifyToken, getReceivedJestas);
router.post("/accept/:uid", verifyToken, acceptJesta);
router.delete("/delete/:id", verifyToken, deleteJesta);
router.get("/schedule/:uid", verifyToken, getSchedule);

// user
router.post("/user/:uid/:points", verifyToken, addUserPoints);
router.post('/user', verifyToken, createUser);
router.get('/user/:uid', verifyToken, getUserByUid);
router.put("/user/update/:uid", verifyToken, updateUser);

module.exports = router;