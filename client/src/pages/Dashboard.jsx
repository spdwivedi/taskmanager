// client/src/pages/Dashboard.jsx
import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { LogOut, LayoutDashboard, PlusCircle, User as UserIcon, FolderKanban, ArrowRight, X } from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });

  // Fetch projects when the dashboard loads
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await API.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects(); // Refresh the grid to show the new project
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col relative">
      {/* Top Navigation Bar */}
      <nav className="bg-gray-900 border-b border-gray-800 p-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 text-xl font-bold text-white">
            <LayoutDashboard className="text-blue-500" />
            <span>TaskFlow Pro</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-full border border-gray-700">
              <UserIcon size={16} className="text-gray-400" />
              <span className="text-sm font-medium">{user?.name}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                user?.role === 'Admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
              }`}>
                {user?.role}
              </span>
            </div>
            
            <button 
              onClick={logout}
              className="flex items-center space-x-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Projects Overview</h1>
            <p className="text-gray-400 mt-1">Manage your team's tasks and progress.</p>
          </div>
          
          {/* SECURE UI: Only Admins see the Create button */}
          {user?.role === 'Admin' && (
            <button 
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95"
            >
              <PlusCircle size={20} />
              <span>New Project</span>
            </button>
          )}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 flex flex-col items-center justify-center text-center">
            <FolderKanban size={64} className="text-gray-700 mb-4" />
            <h3 className="text-2xl font-semibold text-white mb-2">No Projects Yet</h3>
            <p className="text-gray-400 max-w-md">
              {user?.role === 'Admin' 
                ? "You haven't created any projects. Click the 'New Project' button above to get started."
                : "Your admin hasn't assigned any projects yet. Check back later!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors group flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  <FolderKanban className="text-gray-600" size={24} />
                </div>
                <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">
                  {project.description}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <span className="text-xs text-gray-500">
                    By: {project.createdBy?.name || 'Admin'}
                  </span>
                  {/* We will build this Task route next! */}
                  <button 
                    onClick={() => navigate(`/projects/${project._id}`)}
                    className="flex items-center space-x-1 text-sm font-medium text-blue-500 hover:text-blue-400"
                  >
                    <span>View Tasks</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal (Admin Only) */}
      {showModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Project</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  value={newProject.name}
                  onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-2.5 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  placeholder="e.g., Q4 Marketing Campaign"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-2.5 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="What is this project about?"
                ></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg transition-colors font-medium shadow-lg shadow-blue-900/20"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;