const express = require('express');
const router = express.Router();
const { AuthorController } = require('../controllers/authorController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication and author role
router.use(protect, authorize('author'));

router.get('/malls', AuthorController.getMalls);
router.post('/malls', AuthorController.createMall);
router.put('/malls/:mall_id/price', AuthorController.updateMallPrice);
router.get('/managers', AuthorController.getManagers);
router.get('/stats', AuthorController.getStats);
router.get('/revenue', AuthorController.getRevenue);
router.post('/approve-manager', AuthorController.approveManager);

module.exports = router;