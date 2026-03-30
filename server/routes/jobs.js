const express = require('express');
const router = express.Router();
const JobRequest = require('../models/JobRequest');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Create a new job request (Customer only)
router.post('/', auth, async (req, res) => {
  try {
    const { category, description, budget } = req.body;
    
    // Check if user is customer
    const user = await User.findById(req.user);
    if(user.role !== 'customer') {
       return res.status(403).json({ error: 'Only customers can create requests.'});
    }

    const jobRequest = new JobRequest({
      customer: req.user,
      category,
      description,
      budget
    });

    await jobRequest.save();
    res.status(201).json(jobRequest);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all open jobs nearby (Provider) by finding open jobs 
router.get('/nearby', auth, async (req, res) => {
  try {
     const { lng, lat, maxDistance } = req.query;
     const provider = await User.findById(req.user);

     if(provider.role !== 'provider') {
        return res.status(403).json({ error: 'Only providers can view nearby requests.'});
     }

     if (!lng || !lat || !maxDistance) {
        return res.status(400).json({ error: 'Provide lng, lat, maxDistance' });
     }

     // First get all customers near this provider
     const nearbyCustomers = await User.find({
       role: 'customer',
       location: {
         $near: {
           $geometry: { type: "Point", coordinates: [ parseFloat(lng), parseFloat(lat) ] },
           $maxDistance: parseInt(maxDistance)
         }
       }
     });

     const customerIds = nearbyCustomers.map(c => c._id);
     
     // Find open jobs matching those customers
     const jobs = await JobRequest.find({
       status: 'open',
       customer: { $in: customerIds }
     }).populate('customer', 'name location');

     res.json(jobs);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Provider accepts a job
router.patch('/:id/accept', auth, async (req, res) => {
  try {
    const job = await JobRequest.findById(req.params.id);
    if(!job) return res.status(404).json({error: 'Job not found'});

    if(job.status !== 'open') return res.status(400).json({error: 'Job already accepted or completed'});

    job.provider = req.user;
    job.status = 'accepted';
    await job.save();

    res.json(job);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark job as completed and Rate Provider (Customer)
router.patch('/:id/complete', auth, async (req, res) => {
   try {
     const { rating } = req.body;
     const job = await JobRequest.findById(req.params.id);
     
     if(!job) return res.status(404).json({error: 'Job not found'});
     if(job.customer.toString() !== req.user) return res.status(403).json({error: 'Unauthorized'});
     if(job.status !== 'accepted') return res.status(400).json({error: 'Job is not accepted yet.'});

     job.status = 'completed';
     await job.save();

     // Update Provider rating
     if(rating && rating >= 1 && rating <= 5) {
        const provider = await User.findById(job.provider);
        const newTotalCompleted = provider.jobsCompleted + 1;
        
        // Rolling average rating calculation
        const newRating = ((provider.rating * provider.jobsCompleted) + rating) / newTotalCompleted;
        
        provider.jobsCompleted = newTotalCompleted;
        provider.rating = newRating;
        await provider.save();
     }

     res.json(job);
   } catch(err) {
     res.status(500).json({ error: err.message });
   }
});

// Get User's job history
router.get('/history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (user.role === 'customer') {
       const jobs = await JobRequest.find({ customer: req.user }).populate('provider', 'name rating');
       return res.json(jobs);
    } else if (user.role === 'provider') {
       const jobs = await JobRequest.find({ provider: req.user }).populate('customer', 'name');
       return res.json(jobs);
    } else {
       // admin can see all
       const jobs = await JobRequest.find().populate('customer provider', 'name');
       return res.json(jobs);
    }
  } catch(err) {
     res.status(500).json({ error: err.message });
  }
});

module.exports = router;
