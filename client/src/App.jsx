import React, { useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { io } from 'socket.io-client';
import axios from './api/axios';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectTasks from './pages/ProjectTasks';

// Init Global Socket
const socketUrl = 'https://taskmanager-production-18e6.up.railway.app';
export const socket = io(socketUrl);

// Auth Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Main Layout Shell (Navbar, Sidebar, About Modal)
const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [activities, setActivities] = useState([]);

  // Fetch & listen to timeline
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const { data } = await axios.get('/activities');
        setActivities(data.data);
      } catch (err) { console.error(err); }
    };
    fetchActivities();

    // Live Socket Listeners
    socket.on('taskCreated', fetchActivities);
    socket.on('taskUpdated', fetchActivities);

return () => {
      socket.off('taskCreated', fetchActivities);
      socket.off('taskUpdated', fetchActivities);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans flex flex-col">
      {/* Top Navbar */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center sticky top-0 z-40">
        <Link to="/" className="text-xl font-bold text-blue-500 tracking-wide">TaskFlow Pro</Link>
        <div className="flex items-center gap-6">
          <button onClick={() => setIsAboutOpen(true)} className="text-sm text-gray-400 hover:text-white transition">About App</button>
          <button onClick={() => setIsPanelOpen(true)} className="relative text-gray-400 hover:text-white transition">
            Notifications
            {activities.length > 0 && <span className="absolute -top-1 -right-3 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span></span>}
          </button>
          <div className="flex items-center gap-4 border-l border-gray-700 pl-6">
            <span className="text-sm font-medium">{user?.name} <span className="text-xs text-blue-400 ml-1">({user?.role})</span></span>
            <button onClick={logout} className="text-sm text-red-400 hover:text-red-300">Logout</button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>

      {/* Right Slide-out Notification Panel */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="w-96 bg-gray-900 border-l border-gray-800 h-full shadow-2xl flex flex-col animate-slide-in">
            <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900 sticky top-0">
              <h2 className="text-lg font-bold">Live Global Timeline</h2>
              <button onClick={() => setIsPanelOpen(false)} className="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {activities.length === 0 ? <p className="text-gray-500 text-sm">No recent activity.</p> : activities.map((act) => (
                <div key={act._id} className="bg-gray-800 p-4 rounded-lg border border-gray-700/50 relative overflow-hidden group">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                  <p className="text-xs text-blue-400 mb-1 font-medium">{new Date(act.createdAt).toLocaleString()}</p>
                  <p className="text-sm"><span className="font-bold text-white">{act.user?.name}</span> {act.action.toLowerCase()}</p>
                  {act.details && <p className="text-sm text-gray-400 mt-1 mt-2 bg-gray-900/50 p-2 rounded">{act.details}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* About Developer Modal */}
      {isAboutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 p-8 rounded-xl shadow-2xl max-w-md w-full relative animate-fade-in">
            <button onClick={() => setIsAboutOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl">&times;</button>
            <h2 className="text-2xl font-bold text-blue-500 mb-2">TaskFlow Pro</h2>
            <p className="text-gray-400 text-sm mb-6">Enterprise-grade Task Management Platform.</p>
            <div className="space-y-4 text-sm text-gray-300">
              <p><strong className="text-white">Developer:</strong> Surya Prakash Dwivedi</p>
              <p><strong className="text-white">Tech Stack:</strong> MongoDB, Express, React, Node.js, Socket.io, Tailwind CSS, Vite.</p>
              <p><strong className="text-white">Features:</strong> Real-time WebSockets, Role-Based Access Control, Activity Logging, Kanban Routing.</p>
              <div className="pt-4 border-t border-gray-800 flex gap-4 mt-6">
                <a href="https://www.linkedin.com/in/spdwivedi2001/" target="_blank" className="text-blue-400 hover:text-blue-300">LinkedIn</a>
                <a href="https://github.com/spdwivedi/taskmanager" target="_blank" className="text-blue-400 hover:text-blue-300">GitHub</a>
                <a href="https://spdwivedi.me/" target="_blank" className="text-blue-400 hover:text-blue-300">Portfolio</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Router Setup
const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
    <Route path="/projects/:projectId" element={<ProtectedRoute><Layout><ProjectTasks /></Layout></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <Router>
      <AppRoutes />
    </Router>
  </AuthProvider>
);

export default App;