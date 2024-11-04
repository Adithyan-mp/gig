const express = require('express');
const UserCollection = require('../models/seekerCollectionsdb'); // Ensure this path is correct
const bcrypt = require('bcrypt'); // For password hashing
const router = express.Router();
const { body, validationResult } = require('express-validator'); // For input validation

// Handle user creation
router.post('/userCreation', [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Email is invalid.'),
    body('userId').notEmpty().withMessage('UserId is required.'),
    body('address').notEmpty().withMessage('Address is required.'),
    body('city').notEmpty().withMessage('City is required.'),
    body('phone').notEmpty().withMessage('Phone number is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: errors.array().map(error => error.msg) // Return only the error messages
        });
    }

    const { name, email, userId, address, city, phone, password } = req.body;

    try {
        // Check if email or userId already exists
        const existingUser = await UserCollection.findOne({ $or: [{ email }, { userId }] });
        if (existingUser) {
            const errorMessages = [];
            if (existingUser.email === email) {
                errorMessages.push('Email already exists.');
            }
            if (existingUser.userId === userId) {
                errorMessages.push('UserId already exists.');
            }
            return res.status(400).json({ message: 'User already exists.', errors: errorMessages });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new UserCollection({
            name,
            email,
            userId,
            address,
            city,
            phone,
            password: hashedPassword, // Save the hashed password
        });

        // Save user to the database
        await newUser.save();

        res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Failed to create user.' });
    }
});

module.exports = router;
