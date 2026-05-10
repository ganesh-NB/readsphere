const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  author: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Horror', 'History', 'Classic', 'Adventure', 'Poetry', 'Self-Help', 'Productivity', 'Thriller', 'Other']
  },
  coverImage: {
    type: String,
    default: ''
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'epub', 'txt'],
    default: 'pdf'
  },
  pages: {
    type: Number,
    default: 0
  },
  publishYear: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  aiSummary: {
    type: String,
    default: ''
  },
  // Source tracking
  source: {
    type: String,
    enum: ['gutenberg', 'uploaded', 'admin'],
    default: 'uploaded'
  },
  // For uploaded books
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  uploadStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  // Admin who added the book
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Stats
  readCount: {
    type: Number,
    default: 0
  },
  favoriteCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Update timestamp on save (Mongoose 9 — no next() in async middleware)
bookSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Index for search
bookSchema.index({ title: 'text', author: 'text', description: 'text' });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
