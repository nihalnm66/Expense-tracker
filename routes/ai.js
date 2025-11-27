const express = require('express');
const jwt = require('jsonwebtoken');
const Note = require('../models/Note');

const router = express.Router();

// auth middleware
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// LOCAL SUMMARY – NO API
router.post('/summarize', auth, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId });

    if (!notes.length) {
      return res.json({ summary: "No notes to summarize." });
    }

    let total = 0;
    let details = "";

    notes.forEach(note => {
      const amount = note.amount || 0;
      total += amount;

      if (amount > 0) {
        details += `You spent $${amount} on ${note.text}.\n`;
      }
    });

    let summary = `You spent $${total} in total.\n` + details;

    res.json({ summary });

  } catch (err) {
    res.status(500).json({ message: "Summary failed" });
  }
});

module.exports = router;
