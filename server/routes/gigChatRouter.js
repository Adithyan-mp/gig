const express = require('express');
const Message = require('../models/Message');

const router = express();

router.get('/messages/:conversationId', async (req, res) => {
    // console.log('req received')
    const { conversationId } = req.params;
  
    try {
        const messages = await Message.find({ conversationId }); // Removed .populate('senderId')

        const seekerMessages = messages.filter((mess) => mess.senderType === "seeker");
        const providerMessages = messages.filter((mess) => mess.senderType === "provider");

        res.status(200).json({
            seekerMessages,
            providerMessages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
