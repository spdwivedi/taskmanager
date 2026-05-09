// server/routes/tasks.js
const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/tasks/project/:projectId
// @desc    Get all tasks for a specific project
// @access  Private
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    // Populate the assigned user's details for the frontend UI
    const tasks = await Task.find({ projectId: req.params.projectId })
                            .populate('assignedTo', 'name email');
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/tasks
// @desc    Create a task and assign it
// @access  Private/Admin Only
// server/routes/tasks.js
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { title, description, dueDate, projectId, assignedTo } = req.body;

    // Validation: Check if project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    const task = await Task.create({
      title, 
      description, 
      dueDate, 
      projectId, 
      assignedTo // This must match the ID sent from frontend
    });

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/tasks/:id/status
// @desc    Update task status (Pending, In Progress, Completed)
// @access  Private
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Security Check: If user is a Member, they can only update THEIR assigned tasks
    if (req.user.role === 'Member' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Members can only update tasks assigned directly to them.' 
      });
    }

    task.status = status;
    await task.save();

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;