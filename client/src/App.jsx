// client/src/App.jsx
import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

// Import our pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectTasks from './pages/ProjectTasks'; // Import the new Tasks page

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  
  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500">Loading...</div>;
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        {/* Route for specific project tasks */}
        <Route 
          path="/projects/:projectId" 
          element={
            <ProtectedRoute>
              <ProjectTasks />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirect to dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;