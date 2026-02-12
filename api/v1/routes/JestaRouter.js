const express = require('express');
const router = express.Router();

const {
    createJesta,
    getGivenJestas,
    getReceivedJestas,
    getAllJestas
} = require('../controller/JestaController');
router.get('/',getAllJestas );
router.post('/', createJesta);
router.get('/given/:uid', getGivenJestas);
router.get('/received/:uid', getReceivedJestas);

module.exports = router;
