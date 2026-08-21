const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },

    subject: {
        type: String,
        trim: true,
    },

    body: {
        type: String,
        default: '',
    },

    type: {
        type: String,
        enum: ['text', 'checkbox'],
        default: 'text'
    },

    checklist: [{
        text: String,
        checked: Boolean,
    }],

    color: {
        type: String,
        default: '#ffffff'
    },

    font: {
        type: String,
        default: 'sans-serif',
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Note', noteSchema);