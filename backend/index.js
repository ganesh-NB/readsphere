require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors({
  origin: function (origin, callback) {
    // Allow no-origin requests (mobile, curl, Postman)
    if (!origin) return callback(null, true);

    const allowed = [
      /\.vercel\.app$/,        // all vercel preview URLs
      /^http:\/\/localhost:/   // all localhost ports
    ];

    const isAllowed = allowed.some(pattern => pattern.test(origin));

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

// Serve uploaded book files (PDFs)
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

// Session configuration (required for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/uploads', require('./routes/uploadRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Basic Route
app.get('/', (req, res) => {
  res.send('ReadSphere API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});