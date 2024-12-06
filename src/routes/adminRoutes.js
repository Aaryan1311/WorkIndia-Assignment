const express = require('express');
const adminController = require('../controllers/adminController');
const adminAuth = require('../middlewares/auth');

const router = express.Router();

router.post('/addTrain', adminAuth, adminController.addTrain);
router.put('/updateSeats/:trainId', adminAuth, adminController.updateSeats);
router.delete('/deleteTrain/:trainId', adminAuth, adminController.deleteTrain);

module.exports = router;
