// client/src/pages/ProjectTasks.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { ArrowLeft, Plus, Clock, CheckCircle2, Circle, ListTodo, X } from 'lucide-react';

const ProjectTasks = () => {
  const { projectId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    assignedTo: '' // We will need to fetch users to populate this
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projRes, taskRes] = await Promise.all([
          API.get('/projects'), // We'll find ours in the list
          API.get(`/tasks/project/${projectId}`)
        ]);
        
        const currentProj = projRes.data.data.find(p => p._id === projectId);
        setProject(currentProj);
        setTasks(taskRes.data.data);
        
        // If Admin, fetch users to assign tasks
        if (user?.role === 'Admin') {
          const { data } = await API.get('/auth/me'); // Just a placeholder, ideally you'd have a /users route
          // For now, let's just allow assigning to ourselves or others we know the ID of
          setUsers([user]); 
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [projectId, user]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      // Ensure assignedTo is passing a valid MongoDB ObjectId
      await API.post('/tasks', { 
        ...newTask, 
        projectId, 
        assignedTo: user.id || user._id // Check which one your context uses
      });
      
      setShowModal(false);
      setNewTask({ title: '', description: '', dueDate: '', assignedTo: '' });
      
      // Refresh task list
      const { data } = await API.get(`/tasks/project/${projectId}`);
      setTasks(data.data);
    } catch (err) {
      console.error("Task Creation Error:", err.response?.data);
      alert("Error: " + (err.response?.data?.message || "Failed to assign task"));
    }
  };

  const handleStatusUpdate = async (taskId, currentStatus) => {
    const statuses = ['Pending', 'In Progress', 'Completed'];
    const nextStatus = statuses[(statuses.indexOf(currentStatus) + 1) % statuses.length];
    
    try {
      await API.put(`/tasks/${taskId}/status`, { status: nextStatus });
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: nextStatus } : t));
    } catch (err) {
      alert(err.response?.data?.message || "Error updating status");
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500">Loading Tasks...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={20} className="mr-2" /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">{project?.name}</h1>
            <p className="text-gray-400 mt-2">{project?.description}</p>
          </div>
          {user?.role === 'Admin' && (
            <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/40">
              <Plus size={20} /> Add Task
            </button>
          )}
        </div>

        <div className="grid gap-4">
          {tasks.length === 0 ? (
            <div className="text-center py-20 bg-gray-900/50 border border-dashed border-gray-800 rounded-3xl">
              <ListTodo size={48} className="mx-auto text-gray-700 mb-4" />
              <p className="text-gray-500">No tasks found for this project.</p>
            </div>
          ) : (
            tasks.map(task => (
              <div key={task._id} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-gray-700 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`w-3 h-3 rounded-full ${
                      task.status === 'Completed' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                    <h3 className="text-xl font-bold">{task.title}</h3>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
                    <div className="flex items-center gap-1">
                      <Clock size={14} /> Due: {new Date(task.dueDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1 uppercase tracking-widest text-[10px] bg-gray-800 px-2 py-1 rounded">
                      {task.status}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleStatusUpdate(task._id, task.status)}
                  className={`px-4 py-2 rounded-lg border text-sm font-bold transition-all ${
                    task.status === 'Completed' 
                      ? 'border-green-500/50 text-green-500 bg-green-500/5' 
                      : 'border-blue-500/50 text-blue-500 hover:bg-blue-500/10'
                  }`}
                >
                  {task.status === 'Completed' ? 'Completed' : 'Update Status'}
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateTask} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Design API Schema"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description</label>
                <textarea
                  required
                  rows="3"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 resize-none"
                  placeholder="What needs to be done?"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Due Date</label>
                <input
                  type="date"
                  required
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500"
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40">
                Assign Task
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTasks;