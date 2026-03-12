const express = require('express');
const router = express.Router();
const { generateSummary, getRecommendations } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

router.post('/summary', generateSummary);
router.get('/recommendations', protect, getRecommendations);

module.exports = router;
