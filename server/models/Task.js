// server/models/Task.js
const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a task title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    dueDate: {
      type: Date,
      required: [true, 'Please add a due date'],
    },
    projectId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
      index: true, // Speeds up queries when loading a specific project's dashboard
    },
    assignedTo: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Task must be assigned to a user'],
      index: true, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);