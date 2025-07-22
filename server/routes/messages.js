const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// Get all messages between two users
router.get('/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 }
      ]
    }).sort({ timestamp: 1 }); // Sort by time
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a new message
router.post('/', async (req, res) => {
  try {
    const { from, to, content } = req.body;
    
    if (!from || !to || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newMessage = new Message({
      sender: from,
      receiver: to,
      content: content,
      timestamp: new Date()
    });

    const savedMessage = await newMessage.save();
    res.status(201).json(savedMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get recent chats for a user
router.get('/recent/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find the most recent message for each conversation
    const recentMessages = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: username }, { receiver: username }]
        }
      },
      {
        $sort: { timestamp: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', username] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' }
        }
      }
    ]);

    res.json(recentMessages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get unread message count per chat for a user
router.get('/unread/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const counts = await Message.aggregate([
      { $match: { receiver: username, isRead: false } },
      { $group: { _id: "$sender", count: { $sum: 1 } } }
    ]);
    res.json(counts); // [{ _id: senderUsername, count: N }, ...]
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;