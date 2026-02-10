const express = require('express');
const router = express.Router();

const {
    createJesta,
    getGivenJestas,
    getReceivedJestas
} = require('../controller/JestaController');

router.post('/', createJesta);
router.get('/given/:uid', getGivenJestas);
router.get('/received/:uid', getReceivedJestas);

module.exports = router;
