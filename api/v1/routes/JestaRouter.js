const express = require('express');
const router = express.Router();

const {
    createUser,
    createJesta,
    getGivenJestas,
    getReceivedJestas,
    getAllJestas
} = require('../controller/JestaController');
router.get('/',getAllJestas );
router.post('/', createJesta);
router.post('/', createUser);
router.get('/given/:uid', getGivenJestas);
router.get('/received/:uid', getReceivedJestas);
router.get('/:uid', getUserByUid);

module.exports = router;
