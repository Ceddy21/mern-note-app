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

const userRoutes = require('./routes/users');

app.use(helmet());

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: 'Too many requests. Please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many login attempts. Please try again later.',
});

const forgotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: 'Too many password reset requests. Please try again later.',
});
app.use('/api/auth/forgot-password', forgotLimiter);

app.use('/api/auth/login', authLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connection Successful'))
  .catch((err) => console.error('MongoDB Connection Failed:', err));

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.use('/api/users', userRoutes);