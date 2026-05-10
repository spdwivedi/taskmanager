const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema(
  {
    action: { 
      type: String, 
      required: true 
    }, // e.g., 'Task Created', 'Status Updated', 'Remark Added'
    
    user: { 
      type: mongoose.Schema.ObjectId, 
      ref: 'User', 
      required: true, 
      index: true 
    }, // Action author
    
    project: { 
      type: mongoose.Schema.ObjectId, 
      ref: 'Project', 
      index: true 
    }, // Project timeline
    
    task: { 
      type: mongoose.Schema.ObjectId, 
      ref: 'Task', 
      index: true 
    }, // Task timeline
    
    details: { 
      type: String 
    }, // e.g., "changed status to Needs Review"
  },
  { timestamps: true } // Creates timeline sorting automatically
);

module.exports = mongoose.model('Activity', ActivitySchema);