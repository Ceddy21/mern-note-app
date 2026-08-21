const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const noteRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ──
app.use(cors());
app.use(express.json());

// ── MongoDB Connection ──
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB Connection Successful'))
    .catch((err) => console.log('❌ MongoDB Connection Failed:', err));

// ── Routes ──
app.use('/api/notes', noteRoutes);

// ── Test Route ──
app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend is running!' });
});

// ── START THE SERVER ──
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});