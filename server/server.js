const express = require('express');
const cors = require('cors');
const gigPoolRouter = require('./routes/gigPoolRouter');
require('dotenv').config();
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

// Apply CORS middleware
app.use(cors({
    origin: process.env.ORIGIN || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json());

// Mount the router at /api
app.use('/api', gigPoolRouter);

// Connect to database
connectDB();

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
