const express = require('express');
const router = express.Router();

const {
    createUser,
    createJesta,
    getGivenJestas,
    getReceivedJestas,
    getUserByUid,
    getAllJestas
} = require('../controller/JestaController');

// jestas
router.get('/',getAllJestas );
router.post('/jesta', createJesta);
router.get('/given/:uid', getGivenJestas);
router.get('/received/:uid', getReceivedJestas);

// user
router.post('/user', createUser);
router.get('/:uid', getUserByUid);

module.exports = router;
