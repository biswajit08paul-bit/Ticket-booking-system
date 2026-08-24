const express = require('express');
const router = express.Router();
const { SeatController } = require('../controllers/seatController');
const { protect } = require('../middleware/auth');

router.post('/hold', protect, SeatController.holdSeat);
router.post('/release', protect, SeatController.releaseSeat);
router.get('/event/:eventId', SeatController.getEventSeats);

module.exports = router;