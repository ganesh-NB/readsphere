const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const multer   = require('multer');
const Book     = require('../models/Book');
const auth     = require('../middleware/auth');
const router   = express.Router();

// ── Ensure uploads directory exists ──────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'books');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// ── Multer storage — save PDFs to /uploads/books/ ────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (file.fieldname === 'bookFile' && file.mimetype === 'application/pdf') {
      cb(null, true);
    } else if (file.fieldname === 'coverImage' && file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type.'));
    }
  },
});

// ── Serve uploaded PDFs statically ───────────────────────────────────────────
// Mounted in index.js as: app.use('/uploads', express.static(...))

// ── POST /api/uploads ─────────────────────────────────────────────────────────
// @desc  Upload a new book with a real PDF file
// @access Private
router.post('/', auth, upload.fields([
  { name: 'bookFile',   maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
]), async (req, res) => {
  try {
    const { title, author, description, category, pages, publishYear } = req.body;

    if (!title || !author) {
      if (req.files?.bookFile)   fs.unlinkSync(req.files.bookFile[0].path);
      if (req.files?.coverImage) fs.unlinkSync(req.files.coverImage[0].path);
      return res.status(400).json({ message: 'Title and author are required.' });
    }

    if (!req.files?.bookFile?.[0]) {
      return res.status(400).json({ message: 'A PDF file is required.' });
    }

    const fileUrl    = `/uploads/books/${req.files.bookFile[0].filename}`;
    const coverImage = req.files?.coverImage?.[0]
      ? `/uploads/books/${req.files.coverImage[0].filename}`
      : '';

    const book = new Book({
      title,
      author,
      description:  description  || '',
      category:     category     || 'Other',
      coverImage,
      fileUrl,
      fileType:     'pdf',
      pages:        pages        || 0,
      publishYear:  publishYear  || '',
      source:       'uploaded',
      uploadedBy:   req.user.userId,
      uploadStatus: 'pending',
    });

    await book.save();

    res.status(201).json({
      success: true,
      message: 'Book uploaded successfully. Pending admin approval.',
      book,
    });
  } catch (error) {
    if (req.files?.bookFile)   { try { fs.unlinkSync(req.files.bookFile[0].path);   } catch (_) {} }
    if (req.files?.coverImage) { try { fs.unlinkSync(req.files.coverImage[0].path); } catch (_) {} }
    console.error('Error uploading book:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// ── GET /api/uploads/my-uploads ───────────────────────────────────────────────
router.get('/my-uploads', auth, async (req, res) => {
  try {
    const books = await Book.find({ uploadedBy: req.user.userId }).sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── GET /api/uploads/pending (Admin) ─────────────────────────────────────────
router.get('/pending', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const books = await Book.find({ uploadStatus: 'pending' })
      .populate('uploadedBy', 'username email displayName')
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT /api/uploads/:id/approve (Admin) ─────────────────────────────────────
router.put('/:id/approve', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { uploadStatus: 'approved', isActive: true },
      { new: true }
    );
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ success: true, message: 'Book approved successfully', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ── PUT /api/uploads/:id/reject (Admin) ──────────────────────────────────────
router.put('/:id/reject', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { uploadStatus: 'rejected', isActive: false },
      { new: true }
    );
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json({ success: true, message: 'Book rejected', book });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
