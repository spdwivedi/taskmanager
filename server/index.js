const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http'); // HTTP server
const { Server } = require('socket.io'); // WebSockets

const app = express();
const server = http.createServer(app); // Wrap Express

// Init Socket
const io = new Server(server, {
  cors: { origin: '*' }
});

// Pass Socket
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Connect DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/taskmanager');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1); 
  }
};
connectDB();

// Socket Listeners
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected'));
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/activities', require('./routes/activities'));

// Health check
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Team Task Manager API is running.' });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { // Use 'server'
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});