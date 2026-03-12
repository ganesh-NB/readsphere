const express = require('express');
const router = express.Router();
const { getBooks, getBookById, createBook } = require('../controllers/bookController');
const { protect, admin } = require('../middleware/auth');

router.route('/').get(getBooks).post(protect, admin, createBook);
router.route('/:id').get(getBookById);

module.exports = router;
