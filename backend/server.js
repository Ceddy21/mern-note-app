// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── MongoDB Connection ──
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ── Test Route ──
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

// ── Start Server ──
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});