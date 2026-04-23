const express = require('express');
const Book = require('../models/Book');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   POST /api/uploads
// @desc    Upload a new book (User)
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { title, author, description, category, coverImage, fileUrl, pages, publishYear } = req.body;

    // Validate required fields
    if (!title || !author || !fileUrl) {
      return res.status(400).json({ message: 'Title, author, and file URL are required' });
    }

    const book = new Book({
      title,
      author,
      description: description || '',
      category: category || 'Other',
      coverImage: coverImage || '',
      fileUrl,
      pages: pages || 0,
      publishYear: publishYear || '',
      source: 'uploaded',
      uploadedBy: req.user.userId,
      uploadStatus: 'pending'
    });

    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book uploaded successfully. Pending admin approval.',
      book
    });
  } catch (error) {
    console.error('Error uploading book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/uploads/my-uploads
// @desc    Get user's uploaded books
// @access  Private
router.get('/my-uploads', auth, async (req, res) => {
  try {
    const books = await Book.find({ uploadedBy: req.user.userId })
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    console.error('Error fetching uploads:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/uploads/pending
// @desc    Get all pending uploads (Admin only)
// @access  Private/Admin
router.get('/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const books = await Book.find({ uploadStatus: 'pending' })
      .populate('uploadedBy', 'username email displayName')
      .sort({ createdAt: -1 });

    res.json(books);
  } catch (error) {
    console.error('Error fetching pending uploads:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/uploads/:id/approve
// @desc    Approve a pending upload (Admin only)
// @access  Private/Admin
router.put('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { uploadStatus: 'approved', isActive: true },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      success: true,
      message: 'Book approved successfully',
      book
    });
  } catch (error) {
    console.error('Error approving book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/uploads/:id/reject
// @desc    Reject a pending upload (Admin only)
// @access  Private/Admin
router.put('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { uploadStatus: 'rejected', isActive: false },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({
      success: true,
      message: 'Book rejected',
      book
    });
  } catch (error) {
    console.error('Error rejecting book:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
