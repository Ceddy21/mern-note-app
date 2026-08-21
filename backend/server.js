const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Security Headers ──
app.use(helmet());

// ── CORS ──
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// ── Increase general rate limit ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // changed from 100 to 500
  message: 'Too many requests. Please try again later.',
});

// ── Increase auth rate limit ──
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // changed from 5 to 50
  message: 'Too many login attempts. Please try again later.',
});

app.use('/api/auth/login', authLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Passport ──
app.use(passport.initialize());

// ── MongoDB Connection ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connection Successful'))
  .catch((err) => console.error('❌ MongoDB Connection Failed:', err));

// ── Routes ──
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// ── Test Route ──
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});