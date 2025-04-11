// FILE: chat-app/backend/controllers/messages.js
const Message = require('../models/Message');

// @desc    Get all messages
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .sort({ createdAt: 1 })
      .populate('sender', 'username');

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
