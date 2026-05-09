// server/routes/projects.js
const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private (Admin & Member)
router.get('/', protect, async (req, res) => {
  try {
    // Both Admins and Members can view projects. 
    // We populate 'createdBy' to show the admin's name who made it.
    const projects = await Project.find().populate('createdBy', 'name email');
    res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private/Admin Only
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    // Add the user ID from the token to the project body
    req.body.createdBy = req.user.id;

    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project (and its tasks)
// @access  Private/Admin Only
router.delete('/:id', protect, authorize('Admin'), async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: `Project not found with id of ${req.params.id}` });
    }

    // Use deleteOne() instead of remove() for modern Mongoose
    await Project.deleteOne({ _id: req.params.id });
    
    // Cascade delete: Remove all tasks associated with this project
    await Task.deleteMany({ projectId: req.params.id });

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;