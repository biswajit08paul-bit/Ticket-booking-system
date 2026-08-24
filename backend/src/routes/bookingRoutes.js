const express = require('express');
const router = express.Router();
const { BookingController } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.get('/', protect, BookingController.getUserBookings);
router.get('/:id', protect, BookingController.getBooking);
router.post('/', protect, BookingController.createBooking);
router.delete('/:id', protect, BookingController.cancelBooking);

module.exports = router;