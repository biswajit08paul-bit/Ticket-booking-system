const express = require('express');
const router = express.Router();
const { AdminController } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All routes require admin role
router.use(protect, authorize('admin'));

router.post('/venues', AdminController.createVenue);
router.get('/venues', AdminController.getVenues);
router.put('/venues/:id', AdminController.updateVenue);
router.delete('/venues/:id', AdminController.deleteVenue);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/toggle', AdminController.toggleUserStatus);
router.get('/stats', AdminController.getSystemStats);

module.exports = router;