const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('../models/Note');

const router = express.Router();

// Middleware to verify token
function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

// POST /api/notes  (create note)
router.post('/', auth, async (req, res) => {
  try {
    const { text, amount } = req.body;

    const note = new Note({
      userId: req.userId,
      text,
      amount
    });

    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: 'Error creating note' });
  }
});

// GET /api/notes (get all notes for user)
router.get('/', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// DELETE /api/notes/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

module.exports = router;
