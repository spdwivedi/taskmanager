const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

// Global timeline
router.get('/', protect, async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate('user', 'name')
      .populate('project', 'name')
      .populate('task', 'title')
      .sort('-createdAt') // Newest first
      .limit(50); 
      
    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Task timeline
router.get('/task/:taskId', protect, async (req, res) => {
  try {
    const activities = await Activity.find({ task: req.params.taskId })
      .populate('user', 'name')
      .sort('-createdAt'); // Newest first
      
    res.status(200).json({ success: true, count: activities.length, data: activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;