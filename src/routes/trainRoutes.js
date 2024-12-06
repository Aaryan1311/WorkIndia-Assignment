const express = require('express');
const trainController = require('../controllers/trainController');

const router = express.Router();


router.get('/availability', trainController.checkAvailability);

module.exports = router;
