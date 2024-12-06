const express = require('express');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// Routes
router.post('/book', bookingController.bookSeat);
router.post('/confirm', bookingController.confirmBooking);

module.exports = router;
