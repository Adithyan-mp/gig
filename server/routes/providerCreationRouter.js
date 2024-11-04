const express = require('express');
const UserCollection = require('../models/providerCollectiondb'); // Ensure the path is correct
const bcrypt = require('bcrypt'); // For password hashing
const router = express.Router();

// Function to validate email format
const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

// Handle user creation
router.post('/providerCreation', async (req, res) => {
    const { name, email, userId, company, industry, location, address, phone, password } = req.body;

    // Validate input fields
    if (!name || !email || !userId || !company || !industry || !location || !address || !phone || !password) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check email format
    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    // Check password length
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    // Check user ID length
    if (userId.length < 5) {
        return res.status(400).json({ message: 'User ID must be at least 5 characters long.' });
    }

    try {
        // Check if user already exists
        const existingUser = await UserCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new UserCollection({
            name,
            email,
            userId,
            company,
            industry,
            location,
            address,
            phone,
            password: hashedPassword, // Save the hashed password
        });

        // Save user to the database
        await newUser.save();
        res.status(201).json({ message: 'User created successfully!' });

    } catch (error) {
        console.error('Error creating user:', error);

        // Handle specific error scenarios
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: 'Validation error: ' + error.message });
        }

        if (error.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: 'Duplicate field value: ' + JSON.stringify(error.keyValue) });
        }

        res.status(500).json({ message: 'Failed to create user due to server error.' });
    }
});

module.exports = router;
