const express = require('express');
const User = require('../models/User');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('favorites')
      .populate('readingHistory.book')
      .populate('bookmarks.book');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { displayName, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { displayName, avatar, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/favorites/:bookId
// @desc    Add book to favorites
// @access  Private
router.post('/favorites/:bookId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const bookId = req.params.bookId;

    // Check if already in favorites
    if (user.favorites.includes(bookId)) {
      return res.status(400).json({ message: 'Book already in favorites' });
    }

    user.favorites.push(bookId);
    await user.save();

    // Increment book favorite count
    await Book.findByIdAndUpdate(bookId, { $inc: { favoriteCount: 1 } });

    res.json({ success: true, message: 'Added to favorites', favorites: user.favorites });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/favorites/:bookId
// @desc    Remove book from favorites
// @access  Private
router.delete('/favorites/:bookId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const bookId = req.params.bookId;

    user.favorites = user.favorites.filter(id => id.toString() !== bookId);
    await user.save();

    // Decrement book favorite count
    await Book.findByIdAndUpdate(bookId, { $inc: { favoriteCount: -1 } });

    res.json({ success: true, message: 'Removed from favorites', favorites: user.favorites });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/bookmarks
// @desc    Add or update bookmark
// @access  Private
router.post('/bookmarks', auth, async (req, res) => {
  try {
    const { bookId, page } = req.body;
    const user = await User.findById(req.user.userId);

    // Check if bookmark already exists for this book
    const existingBookmarkIndex = user.bookmarks.findIndex(
      b => b.book.toString() === bookId
    );

    if (existingBookmarkIndex >= 0) {
      // Update existing bookmark
      user.bookmarks[existingBookmarkIndex].page = page;
      user.bookmarks[existingBookmarkIndex].addedAt = Date.now();
    } else {
      // Add new bookmark
      user.bookmarks.push({
        book: bookId,
        page,
        addedAt: Date.now()
      });
    }

    await user.save();
    res.json({ success: true, message: 'Bookmark saved', bookmarks: user.bookmarks });
  } catch (error) {
    console.error('Error saving bookmark:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/bookmarks/:bookId
// @desc    Remove bookmark
// @access  Private
router.delete('/bookmarks/:bookId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    const bookId = req.params.bookId;

    user.bookmarks = user.bookmarks.filter(b => b.book.toString() !== bookId);
    await user.save();

    res.json({ success: true, message: 'Bookmark removed', bookmarks: user.bookmarks });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users/reading-history
// @desc    Update reading history
// @access  Private
router.post('/reading-history', auth, async (req, res) => {
  try {
    const { bookId, lastPage } = req.body;
    const user = await User.findById(req.user.userId);

    // Check if entry already exists
    const existingIndex = user.readingHistory.findIndex(
      h => h.book.toString() === bookId
    );

    if (existingIndex >= 0) {
      // Update existing entry
      user.readingHistory[existingIndex].lastPage = lastPage;
      user.readingHistory[existingIndex].lastRead = Date.now();
    } else {
      // Add new entry
      user.readingHistory.push({
        book: bookId,
        lastPage,
        lastRead: Date.now()
      });
    }

    await user.save();
    res.json({ success: true, readingHistory: user.readingHistory });
  } catch (error) {
    console.error('Error updating reading history:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
