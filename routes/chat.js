const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const authenticate = require('../middleware/auth');
const axios = require('axios');

// 🔄 POST: Send message and get AI response
router.post('/', authenticate, async (req, res) => {
  const { userId } = req.user;
  const { message } = req.body;

  if (!message) return res.status(400).json({ error: 'Message is required' });

  try {
    // 🔌 Call Python AI Server
    const aiRes = await axios.post('http://127.0.0.1:7860/api/predict', {
      data: [message]
    });

    const aiResponse = aiRes.data?.data?.[0] || 'No response received from AI.';

    const chat = new Chat({
      owner: userId,
      message,
      response: aiResponse
    });

    await chat.save();

    res.status(201).json(chat);
  } catch (err) {
    console.error('🧠 AI Chat Error:', err.message);
    res.status(500).json({ error: 'Failed to get AI response.' });
  }
});

// 📜 GET: Chat history for the current user
router.get('/my-chats', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({ owner: req.user.userId }).sort({ createdAt: -1 });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
