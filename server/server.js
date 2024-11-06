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
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const path = require('path');
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
// Serve static files from the client/build directory
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});


app.use('/api', gigPoolRouter);
app.use('/api', seekerCreationRouter);
app.use('/api', providerCreationRouter);
app.use('/api', gigTrackerRouter);
app.use('/api', seekerLogin);
app.use('/api', providerLogin);
app.use('/api', gigProvider);
app.use('/api', chatRouter);

app.post("/send-registration-email", async (req, res) => {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).send({ success: false, message: "Email and role are required." });
    }
  
    try {
      // Generate a token with email and role
      const token = jwt.sign({ email, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
  
      // Create a registration link with the token as a query parameter
      const registrationLink = 
        role === "seeker" 
          ? `http://localhost:3000/seekerRegistration?token=${token}`
          : `http://localhost:3000/providerRegistration?token=${token}`;
  
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.USER,
          pass: process.env.PASSWORD,
        },
      });
  
      await transporter.sendMail({
        from: process.env.USER,
        to: email,
        subject: "Complete Your Registration",
        html: `
          <p>Hello,</p>
          <p>Thank you for signing up! Please complete your registration by clicking the link below:</p>
          <a href="${registrationLink}" style="display: inline-block; padding: 10px 20px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 3px;">
            Complete Registration
          </a>
          <p>If you did not request this email, you can safely ignore it.</p>
        `,
      });
  
      res.status(200).send({ success: true, message: "Email sent successfully." });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).send({ success: false, message: "Failed to send email." });
    }
  });
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

app.post("/verify-token", (req, res) => {
    const { token } = req.body;
  
    // Check if the token was provided in the request
    if (!token) {
      return res.status(400).send({ isValid: false, message: "No token provided." });
    }
  
    try {
      // Verify the token using the JWT_SECRET
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Send response if the token is valid
      res.status(200).send({ isValid: true, user: decoded });
    } catch (error) {
      // Send response if token verification fails (invalid or expired)
      res.status(400).send({ isValid: false, message: "Invalid or expired token." });
    }
  });

// Start server
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
