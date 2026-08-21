const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// --- GET ALL NOTES --- //
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find().sort('-createdAt');
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
});

// --- GET SINGLE NOTE USING ID --- //
router.get('/:id', async (req, res) => {
    try{
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found'});
        }
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
});

// --- CREATE NEW NOTE --- //
router.post('/', async (req, res) => {
    try{
        const note = new Note(req.body);
        const savedNote = await note.save();
        res.status(201).json({ savedNote })
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const note = await Note.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        res.json(note);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// --- DELETE NOTE --- //
router.delete('/:id', async(req, res) => {
    try {
        const note = await Note.findByIdAndDelete(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found'});
        }
        res.json({ message: 'Note Deleted'});
    } catch (err) {
        res.status(500).json({ message: err.message});
    }
});

module.exports = router;