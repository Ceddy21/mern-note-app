const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    subject: {
        type: String,
        required: true,
        trim: true,
    },

    body: {
        type: String,
        default: '',
    },

    checklist: [{
        text: String,
        default: 'text',
    }],

    color: {
        type: String,
        default: '#ffffff'
    },

    font: {
        type: String,
        default: 'sans-serif',
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Note', noteSchema);
