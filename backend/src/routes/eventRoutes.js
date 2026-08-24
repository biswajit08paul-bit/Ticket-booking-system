const express = require('express');
const router = express.Router();
const { EventController } = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/auth');
const { validateRequest, eventValidation } = require('../middleware/validation');

router.get('/', EventController.getEvents);
router.get('/organizer', protect, authorize('manager'), EventController.getOrganizerEvents);
router.get('/:id', EventController.getEvent);
router.get('/:id/seats', EventController.getEventSeats);
router.post('/', protect, authorize('manager'), eventValidation, validateRequest, EventController.createEvent);
router.put('/:id', protect, authorize('manager'), EventController.updateEvent);
router.get('/:id/summary', protect, authorize('manager'), EventController.getEventSummary);

module.exports = router;