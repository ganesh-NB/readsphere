// server.js  — drop this in your backend root folder
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const authRoutes = require('./routes/auth');   // adjust path if needed

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — allow your Vite dev server ────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',   // Vite default
    'http://localhost:3000',   // CRA / other
    process.env.CLIENT_URL,    // production frontend URL from .env
  ].filter(Boolean),
  credentials: true,
}));

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// Health check — visit http://localhost:5000/health to confirm server is running
app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// ── MongoDB connection then start ─────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅  MongoDB connected');
    app.listen(PORT, () => console.log(`✅  Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('❌  MongoDB connection failed:', err.message);
    process.exit(1);
  });
