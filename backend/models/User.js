const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Local authentication fields
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String
  },
  
  // Google OAuth fields
  googleId: {
    type: String,
    sparse: true
  },
  
  // Profile information
  username: {
    type: String,
    required: true,
    trim: true
  },
  displayName: {
    type: String,
    trim: true
  },
  avatar: {
    type: String
  },
  
  // User preferences and data
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  
  // Reading history and bookmarks
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book'
  }],
  
  bookmarks: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    page: Number,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  readingHistory: [{
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book'
    },
    lastPage: Number,
    lastRead: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
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
  
  // Last login
  lastLogin: {
    type: Date
  }
});

// Hash password before saving (Mongoose 9 async middleware — no next() callback)
userSchema.pre('save', async function() {
  this.updatedAt = Date.now();
  // Only hash if password field was explicitly changed AND not already a bcrypt hash
  if (this.isModified('password') && this.password && !this.password.startsWith('$2')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
});

// Static method to hash password
userSchema.statics.hashPassword = async function(password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    email: this.email,
    username: this.username,
    displayName: this.displayName,
    avatar: this.avatar,
    role: this.role,
    createdAt: this.createdAt
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
