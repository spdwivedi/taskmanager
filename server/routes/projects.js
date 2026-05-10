const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const Activity = require('../models/Activity'); // Import logger
const { protect, authorize } = require('../middleware/auth');

// Fetch projects
router.get('/', protect, async (req, res) => {
  try {
    const projects = await Project.find().populate('createdBy', 'name email');
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create project
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    req.body.createdBy = req.user.id;
    const project = await Project.create(req.body);

    // Log Activity
    await Activity.create({ action: 'Project Created', user: req.user.id, project: project._id, details: `Created ${project.name}` });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update project
router.put('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });

    // Log Activity
    await Activity.create({ action: 'Project Updated', user: req.user.id, project: project._id, details: `Updated ${project.name}` });

    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete project
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });

    await Project.deleteOne({ _id: req.params.id });
    await Task.deleteMany({ projectId: req.params.id });

    // Log Activity
    await Activity.create({ action: 'Project Deleted', user: req.user.id, details: `Deleted ${project.name}` });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;