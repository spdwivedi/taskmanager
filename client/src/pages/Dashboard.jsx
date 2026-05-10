import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { PlusCircle, FolderKanban, ArrowRight, X, BarChart2, Activity, CheckCircle, AlertCircle, Edit2, Trash2, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]); 
  const [activities, setActivities] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProject, setCurrentProject] = useState({ name: '', description: '' });

  const COLORS = { 'Pending': '#6b7280', 'In Progress': '#3b82f6', 'Needs Review': '#eab308', 'Completed': '#22c55e', 'Blocked': '#ef4444' };

  const fetchDashboardData = async () => {
    try {
      const [projRes, actRes] = await Promise.all([API.get('/projects'), API.get('/activities')]);
      const fetchedProjects = projRes.data.data;
      setProjects(fetchedProjects);
      setActivities(actRes.data.data.slice(0, 5));

      const taskPromises = fetchedProjects.map(p => API.get(`/tasks/project/${p._id}`));
      const taskResponses = await Promise.all(taskPromises);
      setTasks(taskResponses.flatMap(res => res.data.data));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  // ⚡ Handle Save (Create OR Edit)
  const handleSaveProject = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await API.put(`/projects/${currentProject._id}`, currentProject);
      } else {
        await API.post('/projects', currentProject);
      }
      setShowModal(false);
      setCurrentProject({ name: '', description: '' });
      setIsEditing(false);
      fetchDashboardData(); 
    } catch (error) { console.error(error); alert("Error saving project"); }
  };

  // ⚡ Handle Delete
  const handleDeleteProject = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"? This will delete all its tasks too.`)) {
      try {
        await API.delete(`/projects/${id}`);
        setProjects(projects.filter(p => p._id !== id)); 
      } catch (error) { alert("Error deleting project"); }
    }
  };

  const openEditModal = (project) => {
    setCurrentProject(project);
    setIsEditing(true);
    setShowModal(true);
  };

  // --- ANALYTICS CALCULATIONS ---
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const blockedTasks = tasks.filter(t => t.status === 'Blocked').length;
  
  // NEW: Calculate Overdue Tasks (Not completed + Due date is in the past)
  const overdueTasks = tasks.filter(t => {
    if (t.status === 'Completed') return false;
    return new Date(t.dueDate).getTime() < new Date().getTime();
  }).length;

  const completionRate = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;
  
  const chartData = Object.keys(COLORS).map(status => ({
    name: status, value: tasks.filter(t => t.status === status).length
  })).filter(d => d.value > 0);

  return (
    <div className="max-w-7xl w-full mx-auto pb-12">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics & Overview</h1>
          <p className="text-gray-400 mt-1">High-level insights across all your projects.</p>
        </div>
        {user?.role === 'Admin' && (
          <button onClick={() => { setCurrentProject({name: '', description: ''}); setIsEditing(false); setShowModal(true); }} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg shadow-blue-900/20 active:scale-95">
            <PlusCircle size={20} /><span>New Project</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
      ) : (
        <>
          {/* Top KPI Metric Cards (Now 5 Columns!) */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex items-center justify-between"><div><p className="text-gray-400 text-sm">Total Projects</p><p className="text-2xl font-bold text-white">{projects.length}</p></div><div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><FolderKanban size={24}/></div></div>
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex items-center justify-between"><div><p className="text-gray-400 text-sm">Total Tasks</p><p className="text-2xl font-bold text-white">{tasks.length}</p></div><div className="p-3 bg-purple-500/10 rounded-lg text-purple-500"><BarChart2 size={24}/></div></div>
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex items-center justify-between"><div><p className="text-gray-400 text-sm">Completion Rate</p><p className="text-2xl font-bold text-green-400">{completionRate}%</p></div><div className="p-3 bg-green-500/10 rounded-lg text-green-500"><CheckCircle size={24}/></div></div>
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex items-center justify-between"><div><p className="text-gray-400 text-sm">Active Issues</p><p className="text-2xl font-bold text-red-400">{blockedTasks}</p></div><div className="p-3 bg-red-500/10 rounded-lg text-red-500"><AlertCircle size={24}/></div></div>
            
            {/* NEW: Overdue Tasks Card */}
            <div className="bg-gray-900 border border-gray-800 p-5 rounded-xl flex items-center justify-between">
              <div><p className="text-gray-400 text-sm">Overdue Tasks</p><p className="text-2xl font-bold text-orange-400">{overdueTasks}</p></div>
              <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500"><Clock size={24}/></div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Global Task Distribution</h3>
              <div className="h-64 w-full">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart><Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} /><Legend verticalAlign="bottom" height={36}/></PieChart>
                  </ResponsiveContainer>
                ) : <div className="h-full flex items-center justify-center text-gray-500">No task data available.</div>}
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col">
              <div className="flex items-center gap-2 mb-4"><Activity size={20} className="text-blue-500" /><h3 className="text-lg font-bold text-white">Recent Activity</h3></div>
              <div className="flex-1 space-y-4">
                {activities.length === 0 ? <p className="text-gray-500 text-sm">No recent activity.</p> : activities.map((act) => (
                  <div key={act._id} className="border-l-2 border-blue-500 pl-3"><p className="text-xs text-gray-400">{new Date(act.createdAt).toLocaleTimeString()}</p><p className="text-sm"><span className="font-bold text-white">{act.user?.name}</span> {act.action.toLowerCase()}</p></div>
                ))}
              </div>
            </div>
          </div>

          {/* Projects Grid with Edit/Delete Controls */}
          <h2 className="text-2xl font-bold text-white mb-4">Your Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project._id} className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors group flex flex-col relative overflow-hidden">
                
                {/* Admin Hover Controls */}
                {user?.role === 'Admin' && (
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(project)} className="p-1.5 bg-gray-800 hover:bg-blue-600 text-gray-400 hover:text-white rounded transition"><Edit2 size={16} /></button>
                    <button onClick={() => handleDeleteProject(project._id, project.name)} className="p-1.5 bg-gray-800 hover:bg-red-600 text-gray-400 hover:text-white rounded transition"><Trash2 size={16} /></button>
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors pr-12">{project.name}</h3>
                </div>
                <p className="text-gray-400 text-sm mb-6 flex-1 line-clamp-3">{project.description}</p>
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <span className="text-xs text-gray-500">By: {project.createdBy?.name || 'Admin'}</span>
                  <button onClick={() => navigate(`/projects/${project._id}`)} className="flex items-center space-x-1 text-sm font-medium text-blue-500 hover:text-blue-400">
                    <span>Enter Board</span><ArrowRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Shared Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">{isEditing ? 'Edit Project' : 'Create New Project'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Project Name</label>
                <input type="text" required value={currentProject.name} onChange={(e) => setCurrentProject({...currentProject, name: e.target.value})} className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-2.5 px-4 focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea required rows="3" value={currentProject.description} onChange={(e) => setCurrentProject({...currentProject, description: e.target.value})} className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-2.5 px-4 focus:border-blue-500 resize-none"></textarea>
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2.5 rounded-lg transition-colors font-medium">Cancel</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg transition-colors font-medium shadow-lg">{isEditing ? 'Save Changes' : 'Create Project'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;