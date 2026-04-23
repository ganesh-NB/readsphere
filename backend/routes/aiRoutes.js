const express = require('express');
const router = express.Router();
const { generateSummary, getRecommendations } = require('../controllers/aiController');
const auth = require('../middleware/auth');

router.post('/summary', generateSummary);
router.get('/recommendations', auth, getRecommendations);

module.exports = router;
