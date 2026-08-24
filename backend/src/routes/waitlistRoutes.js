const express = require('express');
const router = express.Router();
const { WaitlistController } = require('../controllers/waitlistController');
const { protect } = require('../middleware/auth');

router.post('/join', protect, WaitlistController.joinWaitlist);
router.get('/event/:eventId', protect, WaitlistController.getWaitlistStatus);
router.get('/:eventId/position', protect, WaitlistController.getPosition);

module.exports = router;