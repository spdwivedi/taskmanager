const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const Activity = require('../models/Activity'); // Timeline model
const { protect, authorize } = require('../middleware/auth');

// Get tasks
router.get('/project/:projectId', protect, async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId })
      .populate('assignedTo', 'name email')
      .populate('remarks.addedBy', 'name'); // Fetch authors
    res.status(200).json({ success: true, count: tasks.length, data: tasks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create task
router.post('/', protect, authorize('Admin'), async (req, res) => {
  try {
    const { title, description, dueDate, projectId, assignedTo, tags } = req.body;
    const project = await Project.findById(projectId);
    
    if (!project) return res.status(404).json({ success: false, message: 'Not found' });

    const task = await Task.create({ title, description, dueDate, projectId, assignedTo, tags });

    // Log timeline
    await Activity.create({ action: 'Task Created', user: req.user.id, project: projectId, task: task._id, details: 'Assigned new task' });

    // Broadcast live
    req.io.emit('taskCreated', task);

    res.status(201).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Update status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: 'Not found' });
    if (req.user.role === 'Member' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    task.status = status;
    await task.save();

    // Log timeline
    await Activity.create({ action: 'Status Updated', user: req.user.id, project: task.projectId, task: task._id, details: `Moved to ${status}` });

    // Broadcast live
    req.io.emit('taskUpdated', task);

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// Add remark
router.post('/:id/remarks', protect, async (req, res) => {
  try {
    const { text, isIssue } = req.body;
    let task = await Task.findById(req.params.id);

    if (!task) return res.status(404).json({ success: false, message: 'Not found' });

    // Push remark
    task.remarks.push({ text, addedBy: req.user.id, isIssue });
    
    // Auto-status shift
    if (isIssue) task.status = 'Blocked';
    else if (req.user.role === 'Member' && task.status !== 'Completed') task.status = 'Needs Review';

    await task.save();

    // Log timeline
    await Activity.create({ action: 'Remark Added', user: req.user.id, project: task.projectId, task: task._id, details: isIssue ? 'Reported an issue' : 'Added an update' });

    // Broadcast live
    req.io.emit('taskUpdated', task);

    res.status(200).json({ success: true, data: task });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;