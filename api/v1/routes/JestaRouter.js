const express = require('express');
const router = express.Router();

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

// jestas
router.post('/create', createJestaAndUpdatePoints);
router.get('/all/{sort}/:userLat/:userLng',getAllJestas );
router.get('/given/:uid', getGivenJestas);
router.get('/received/:uid', getReceivedJestas);
router.post("/accept/:uid", acceptJesta);
router.delete("/delete/:id", deleteJesta);
router.get("/schedule/:uid", getSchedule);

// user
router.post("/user/:uid/:points", addUserPoints);
router.post('/user', createUser);
router.get('/user/:uid', getUserByUid);
router.put("/user/update/:uid", updateUser);

module.exports = router;
