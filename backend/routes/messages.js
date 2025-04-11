// FILE: chat-app/backend/routes/messages.js
const express = require('express');
const { getMessages } = require('../controllers/messages');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getMessages);

module.exports = router;