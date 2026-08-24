const express = require('express');
const router = express.Router();
const { HallController } = require('../controllers/hallController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and manager role
router.use(protect, authorize('manager'));

router.get('/manager', HallController.getManagerHalls);
router.post('/book', HallController.bookHall);
router.put('/release/:hall_id', HallController.releaseHall);
router.get('/groups', HallController.getHallGroups);
router.get('/:hall_id', HallController.getHallDetails);

module.exports = router;