const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, addBookmark } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.post('/favorites', protect, addFavorite);
router.delete('/favorites/:bookId', protect, removeFavorite);
router.post('/bookmarks', protect, addBookmark);

module.exports = router;
