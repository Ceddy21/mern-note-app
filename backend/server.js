const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/test' , (req, res) => {
    res.json({ message: 'Backend is running'});
});

app.listen(PORT, () =>  {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
})

