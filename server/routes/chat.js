const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const JobRequest = require('../models/JobRequest');
const { auth } = require('../middleware/auth');

// Send Message
router.post('/', auth, async (req, res) => {
  try {
    const { receiver, jobRequest, content, isOffer } = req.body;
    
    // basic validation
    if (!receiver || !jobRequest || !content) {
      return res.status(400).json({ error: 'Please provide receiver, jobRequest ID, and content.' });
    }

    const newMessage = new Message({
      sender: req.user,
      receiver,
      jobRequest,
      content,
      isOffer: isOffer || false
    });

    await newMessage.save();
    
    // Return populated message
    const msg = await Message.findById(newMessage._id).populate('sender receiver', 'name');
    res.status(201).json(msg);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Messages for a specific Job Request
router.get('/:jobRequestId', auth, async (req, res) => {
  try {
    const messages = await Message.find({ jobRequest: req.params.jobRequestId })
      .populate('sender receiver', 'name')
      .sort({ createdAt: 1 }); // Oldest first
      
    // Check if user is participant 
    // In a real app, verify they are either the customer or assigned provider of the job
    const job = await JobRequest.findById(req.params.jobRequestId);
    if (!job) return res.status(404).json({error: 'Job not found'});

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
