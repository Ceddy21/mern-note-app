const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const noteRoutes = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDb Connection Successful'))
    .catch((err) => console.log('MongoDB Connection Unsuccessful'));

app.use('/api/notes', noteRoutes);