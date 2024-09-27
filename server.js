const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/events')
const registrationRoutes = require('./routes/registrationRoutes');
const fileUpload = require('express-fileupload');
const path = require('path');
const messageRoutes = require('./routes/messageRoutes');

const http = require('http');
const socketIO = require('socket.io');
const chatRoutes = require('./routes/chatRoute');
const Chat = require('./models/Chat');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
// const io = socketIO(server);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:8080", 
    methods: ["GET", "POST"]
  }
});

connectDB();

app.use(express.json());


// app.use(cors()); 
app.use(cors({
  origin: '*', // Allow requests from any domain
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
}));

app.use(fileUpload());


app.use(express.static(path.join(__dirname, 'public')));

// Set up socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected'); // Log when a new client connects

  socket.on('sendMessage', async (data) => {
    console.log('Received message:', data); // Log the received data
    const { sender, receiver, message } = data;
    const chat = new Chat({ sender, receiver, message });
    await chat.save();
    console.log('Chat saved:', chat); // Log the saved chat
    io.emit('receiveMessage', chat);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected'); // Log when a client disconnects
  });
});

const messages = {};
app.locals.messages = messages;

app.use('/api/auth', authRoutes);
app.use('/api', eventRoutes);
app.use('/api', registrationRoutes);
app.use('/api/chats', chatRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/messages', messageRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
