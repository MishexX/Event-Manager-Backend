// routes/messageRoutes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.post('/send-message', messageController.sendMessage);
router.get('/fetch-messages', messageController.fetchMessages);

module.exports = router;
