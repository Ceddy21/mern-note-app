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

    type: {
        type: String,
        enim: ['text', 'checkbox'],
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

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Note', noteSchema);
