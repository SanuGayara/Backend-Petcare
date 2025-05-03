
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'piyush';
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Pet = require('../models/Pet');

const router = express.Router();

const authenticate = require('../middleware/auth');

// GET /api/auth/profile
router.get('/me', authenticate, async (req, res) => {
  const user = await User.findById(req.user.userId);
  const pets = await Pet.find({ owner: req.user.userId });

  res.json({
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      type: user.type,
    },
    pets,
  });
});


// Get current user profile from token
router.get('/profile', authenticate, async (req, res) => {
  const { userId } = req.user;

  try {
    const user = await User.findById(userId).select('-password'); // exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (err) {
    console.error('❌ Error in profile route:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Register
router.post('/register', async (req, res) => {
  const { fullName, email, phone, password, type } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      type,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });

    // Create token
    const token = jwt.sign(
      { userId: user._id, type: user.type },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        type: user.type
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Search user by name or ID and return their pets
router.get('/search', async (req, res) => {
  const { id, name } = req.query;

  try {
    let user;

    if (id) {
      user = await User.findById(id);
    } else if (name) {
      user = await User.findOne({
        fullName: { $regex: name, $options: 'i' },
      });
    } else {
      return res.status(400).json({ message: 'Please provide user ID or name' });
    }

    if (!user) return res.status(404).json({ message: 'User not found' });

    const pets = await Pet.find({ owner: user._id });

    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        type: user.type,
      },
      pets,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


const mongoose = require('mongoose');

router.get('/search-dropdown', async (req, res) => {
  const { q } = req.query;

  if (!q || q.length < 3) {
    return res.status(400).json({ message: 'Minimum 3 characters required' });
  }

  try {
    const conditions = [];

    // Search by name using regex (case-insensitive)
    conditions.push({ fullName: { $regex: q, $options: 'i' } });

    // If q looks like an ObjectId, add that to search conditions
    if (mongoose.Types.ObjectId.isValid(q)) {
      conditions.push({ _id: q });
    }

    const users = await User.find({ $or: conditions }).limit(10);

    const results = await Promise.all(users.map(async user => {
      const pets = await Pet.find({ owner: user._id });
      return {
        user: {
          _id: user._id,
          fullName: user.fullName,
          email: user.email,
          phone: user.phone,
          type: user.type,
        },
        pets,
      };
    }));

    res.json(results);
  } catch (err) {
    console.error('Search dropdown error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/auth/update
router.put('/update', authenticate, async (req, res) => {
  const { userId } = req.user;
  const { fullName, email, phone } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, {
      fullName,
      email,
      phone
    }, { new: true });

    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Update failed', error: err.message });
  }
});

// GET /api/auth/user/:id
router.get('/user/:id', authenticate, async (req, res) => {
  const { id } = req.params;  // Get user ID from the URL parameter

  try {
    // Find the user by ID
    const user = await User.findById(id).select('-password'); // Exclude password for security
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch the user's pets (if any)
    const pets = await Pet.find({ owner: id });

    // Return the user details and associated pets
    res.json({
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        type: user.type,
        // Add any other fields you want to expose
      },
      pets
    });
  } catch (err) {
    console.error('Error fetching user by ID:', err.message);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


module.exports = router;
