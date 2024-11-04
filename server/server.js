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
        origin: 'http://localhost:3000',
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Connect to MongoDB
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

// Socket.IO setup
io.on('connection', (socket) => {
    console.log('New client connected for chat');

    // Join conversation room
    socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`Client joined conversation: ${conversationId}`);
    });

    // Listen for message sending event
    socket.on('sendMessage', async (data) => {
        const { conversationId, senderType, text } = data;

        try {
            const newMessage = new Message({
                conversationId,
                senderType,
                text,
                timestamp: new Date()
            });

            await newMessage.save();
            
            // Emit message to the room
            io.to(conversationId).emit('messageReceived', newMessage); // Notify all participants
        } catch (error) {
            console.error('Error saving message:', error);
            socket.emit('error', { message: 'Message could not be saved' });
        }
    });

    // Listen for message deletion event
    socket.on('deleteMessage', async (messageId, callback) => {
        try {
            const deletedMessage = await Message.findByIdAndDelete(messageId);
            if (deletedMessage) {
                io.emit('messageDeleted', messageId); // Notify clients about deletion
                console.log(`Message ${messageId} deleted`);
                callback(true); // Notify the client of success
            } else {
                callback(false); // Message not found
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            callback(false); // Indicate failure
        }
    });

    // Leave conversation room
    socket.on('leaveConversation', (conversationId) => {
        socket.leave(conversationId);
        console.log(`Client left conversation: ${conversationId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
