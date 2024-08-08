const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

router.get('/chats', chatController.getChats);
router.post('/chats', chatController.addChat);

module.exports = router;