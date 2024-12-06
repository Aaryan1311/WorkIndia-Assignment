const express = require('express');
const bookingController = require('../controllers/bookingController');
const auth = require('../middlewares/auth')

const router = express.Router();

// Routes
router.post('/book',  auth.userAuth, bookingController.bookSeat);
router.post('/confirm', auth.userAuth, bookingController.confirmBooking);

module.exports = router;
