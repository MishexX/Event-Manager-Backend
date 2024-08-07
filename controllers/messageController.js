// controllers/messageController.js
exports.sendMessage = (req, res) => {
    const { sender, receiver, message } = req.body;

    if (!messages[receiver]) {
        messages[receiver] = [];
    }

    messages[receiver].push({ sender, message, timestamp: new Date().toISOString() });
    res.send({ status: 'Message delivered' });
};

exports.fetchMessages = (req, res) => {
    const { user } = req.query;

    res.send(messages[user] || []);
};
