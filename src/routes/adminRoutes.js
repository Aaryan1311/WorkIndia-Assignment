const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middlewares/auth');

const router = express.Router();

router.post('/addTrain', auth.adminAuth, adminController.addTrain);
router.put('/updateSeats/:trainId', auth.adminAuth, adminController.updateSeats);
router.delete('/deleteTrain/:trainId', auth.adminAuth, adminController.deleteTrain);

module.exports = router;
