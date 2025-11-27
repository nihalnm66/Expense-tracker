const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      default: null // you can use this for expenses if you want
    }
  },
  {
    timestamps: true // adds createdAt, updatedAt
  }
);

module.exports = mongoose.model('Note', NoteSchema);
