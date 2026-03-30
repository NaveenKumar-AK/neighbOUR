const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile (location, availability, skills)
router.patch('/profile', auth, async (req, res) => {
  try {
    const updates = req.body;
    // Don't allow password updates here securely
    if(updates.password) delete updates.password;

    const user = await User.findByIdAndUpdate(req.user, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Search Nearby Providers 
// Query parameters: lng, lat, maxDistance (in meters, e.g. 5000 for 5km)
router.get('/search-providers', auth, async (req, res) => {
  try {
    const { lng, lat, maxDistance } = req.query;
    
    if (!lng || !lat || !maxDistance) {
      return res.status(400).json({ error: 'Please provide lng, lat, and maxDistance query parameters.' });
    }

    const providers = await User.find({
      role: 'provider',
      isActive: true,
      availability: true, // optionally only return available ones
      location: {
        $near: {
          $geometry: {
             type: "Point" ,
             coordinates: [ parseFloat(lng) , parseFloat(lat) ]
          },
          $maxDistance: parseInt(maxDistance)
        }
      }
    }).select('-password');

    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users (For Admin)
router.get('/', auth, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user);
    if(requestingUser.role !== 'admin') return res.status(403).json({error: 'Access denied.'});

    const users = await User.find().select('-password');
    res.json(users);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Toggle User Active Status (Admin Only)
router.patch('/:id/toggle-status', auth, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.user);
    if(requestingUser.role !== 'admin') return res.status(403).json({error: 'Access denied.'});

    const targetUser = await User.findById(req.params.id);
    if(!targetUser) return res.status(404).json({error: 'User not found'});

    targetUser.isActive = !targetUser.isActive;
    await targetUser.save();
    
    res.json({ message: `User status changed to ${targetUser.isActive ? 'Active' : 'Disabled'}`, isActive: targetUser.isActive });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
