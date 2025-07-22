const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: 'Username already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Find user
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Create token with expiration
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      userId: user._id,
      username: user.username
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (except the current user)
router.get('/users/:username', async (req, res) => {
  try {
    const users = await User.find({ username: { $ne: req.params.username } }).select('username profilePic status -_id');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update profile (picture and status)
router.put('/profile/:username', async (req, res) => {
  try {
    const { profilePic, status } = req.body;
    const user = await User.findOneAndUpdate(
      { username: req.params.username },
      { profilePic, status },
      { new: true }
    ).select('username profilePic status');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a contact
router.post('/add-contact/:username', async (req, res) => {
  try {
    const { contactUsername } = req.body;
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check if the contact exists
    const contact = await User.findOne({ username: contactUsername });
    if (!contact) return res.status(404).json({ message: 'Contact user does not exist' });

    if (!user.contacts.includes(contactUsername)) {
      user.contacts.push(contactUsername);
      await user.save();
    }
    res.json(user.contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get contacts for a user
router.get('/contacts/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Get full user info for each contact
    const contacts = await User.find({ username: { $in: user.contacts } }).select('username profilePic status -_id');
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;