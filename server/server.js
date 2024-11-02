const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const gigPoolRouter = require('./routes/gigPoolRouter');
const seekerCreationRouter = require('./routes/seekerCreationRouter');
const providerCreationRouter = require('./routes/providerCreationRouter');
const seekerLogin = require('./routes/seekerLogin');
const providerLogin = require('./routes/providerLogin');
const gigTrackerRouter = require('./routes/gigTrackerRouter');
const gigProvider = require('./routes/gigProvider');
const chatRouter = require('./routes/gigChatRouter');
const Message = require('./models/Message');

require('dotenv').config();
const connectDB = require("./config/db");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Frontend origin
        methods: ["GET", "POST"],
        credentials: true // Allow credentials if needed
    }
});

const PORT = process.env.PORT || 5001;

// Apply CORS middleware for REST API
app.use(cors({
    origin: 'http://localhost:3000', // Allow frontend origin
    credentials: true
}));

app.use(express.json());

// Connect to database
connectDB();

// Mount routers at /api
app.use('/api', gigPoolRouter);
app.use('/api', seekerCreationRouter);
app.use('/api', providerCreationRouter);
app.use('/api', gigTrackerRouter);
app.use('/api', seekerLogin);
app.use('/api', providerLogin);
app.use('/api', gigProvider);
app.use('/api', chatRouter);

// Socket.io setup for real-time chat
io.on('connection', (socket) => {
    console.log('New client connected for chat');

    socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`Client joined conversation: ${conversationId}`);
    });

    socket.on('sendMessage', async (data) => {
        const { conversationId,senderType, text } = data;

        try {
            const newMessage = new Message({
                conversationId,
                senderType,
                text,
                timestamp: new Date() // Add timestamp for message
            });

            await newMessage.save();
            io.to(conversationId).emit('messageReceived', newMessage);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    });

    socket.on('leaveConversation', (conversationId) => {
        socket.leave(conversationId);
        console.log(`Client left conversation: ${conversationId}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
