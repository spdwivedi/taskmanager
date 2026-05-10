const mongoose = require('mongoose');

// Task remarks
const RemarkSchema = new mongoose.Schema({
  text: { type: String, required: true },
  addedBy: { type: mongoose.Schema.ObjectId, ref: 'User', required: true },
  isIssue: { type: Boolean, default: false },
}, { timestamps: true });

// Main schema
const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Needs Review', 'Completed', 'Blocked'],
      default: 'Pending',
    },
    dueDate: { type: Date, required: true },
    projectId: { type: mongoose.Schema.ObjectId, ref: 'Project', required: true, index: true },
    assignedTo: { type: mongoose.Schema.ObjectId, ref: 'User', required: true, index: true },
    tags: [{ type: String, trim: true }], // Filtering tags
    remarks: [RemarkSchema], // User/Admin updates
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', TaskSchema);