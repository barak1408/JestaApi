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
    deleteJesta
} = require('../controller/JestaController');

// jestas
router.post('/create/:points', createJestaAndUpdatePoints);
router.get('/',getAllJestas );
router.get('/given/:uid', getGivenJestas);
router.get('/received/:uid', getReceivedJestas);
router.post("/accept/:uid", acceptJesta);
router.delete("/delete", deleteJesta);

// user
router.post("/user/:uid/:points", addUserPoints);
router.post('/user', createUser);
router.get('/user/:uid', getUserByUid);

module.exports = router;
