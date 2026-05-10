const express = require('express');
const Book    = require('../models/Book');
const auth    = require('../middleware/auth');
const router  = express.Router();

// ── IMPORTANT: named sub-routes MUST come before /:id ─────────────────────────

// @route   GET /api/books/stats/overview
// @desc    Book statistics (Admin only)
// @access  Private/Admin
router.get('/stats/overview', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied' });

    const totalBooks    = await Book.countDocuments();
    const activeBooks   = await Book.countDocuments({ isActive: true });
    const pendingUploads = await Book.countDocuments({ uploadStatus: 'pending' });
    const reads         = await Book.aggregate([
      { $group: { _id: null, total: { $sum: '$readCount' } } }
    ]);

    res.json({
      totalBooks,
      activeBooks,
      pendingUploads,
      totalReads: reads[0]?.total || 0,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/books/categories/list
// @desc    All unique categories
// @access  Public
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Book.distinct('category');
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/books
// @desc    All books with pagination, search, filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1, limit = 24, search = '',
      category = '', sortBy = 'popular', source = '',
    } = req.query;

    let query = { isActive: true };

    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: 'i' } },
        { author:      { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category && category !== 'All') query.category = category;
    if (source) query.source = source;

    const sort = {
      rating:  { rating: -1 },
      title:   { title: 1 },
      newest:  { createdAt: -1 },
    }[sortBy] || { readCount: -1, favoriteCount: -1 };

    const [books, count] = await Promise.all([
      Book.find(query)
        .sort(sort)
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .populate('uploadedBy', 'username displayName')
        .populate('addedBy',    'username displayName'),
      Book.countDocuments(query),
    ]);

    res.json({
      books,
      totalPages:  Math.ceil(count / limit),
      currentPage: page,
      total:       count,
    });
  } catch (err) {
    console.error('Fetch books error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/books/:id
// @desc    Single book by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate('uploadedBy', 'username displayName')
      .populate('addedBy',    'username displayName');

    if (!book) return res.status(404).json({ message: 'Book not found' });

    await Book.findByIdAndUpdate(req.params.id, { $inc: { readCount: 1 } });
    res.json(book);
  } catch (err) {
    console.error('Fetch book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/books
// @desc    Create book (Admin only)
// @access  Private/Admin
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied. Admin only.' });

    const book = new Book({ ...req.body, addedBy: req.user.userId, source: 'admin' });
    await book.save();
    res.status(201).json({ success: true, message: 'Book created successfully', book });
  } catch (err) {
    console.error('Create book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/books/:id
// @desc    Update book (Admin only)
// @access  Private/Admin
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied. Admin only.' });

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ success: true, message: 'Book updated successfully', book });
  } catch (err) {
    console.error('Update book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/books/:id
// @desc    Delete book (Admin only)
// @access  Private/Admin
router.delete('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin')
      return res.status(403).json({ message: 'Access denied. Admin only.' });

    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ success: true, message: 'Book deleted successfully' });
  } catch (err) {
    console.error('Delete book error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
