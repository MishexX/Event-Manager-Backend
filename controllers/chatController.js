const Chat = require('../models/Chat');

exports.getChats = async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    const chats = await Chat.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chats' });
  }
};

exports.addChat = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    const chat = new Chat({ sender, receiver, message });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error adding chat' });
  }
};
