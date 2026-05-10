import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { socket } from '../App';
import { ArrowLeft, Plus, Clock, MessageSquare, AlertTriangle, X, Filter } from 'lucide-react';

const COLUMNS = ['Pending', 'In Progress', 'Needs Review', 'Blocked', 'Completed'];
const STATUS_COLORS = { 'Pending': 'bg-gray-500', 'In Progress': 'bg-blue-500', 'Needs Review': 'bg-yellow-500', 'Blocked': 'bg-red-500', 'Completed': 'bg-green-500' };

const ProjectTasks = () => {
  const { projectId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // State
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals & Filters
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null); // Opens Detail Modal
  const [filterTag, setFilterTag] = useState('');
  
  // Forms
  const [newTask, setNewTask] = useState({ title: '', description: '', dueDate: '', tags: '' });
  const [remarkText, setRemarkText] = useState('');
  const [isIssue, setIsIssue] = useState(false);

  // Fetch Data
  const fetchData = async () => {
    try {
      const [projRes, taskRes] = await Promise.all([API.get('/projects'), API.get(`/tasks/project/${projectId}`)]);
      setProject(projRes.data.data.find(p => p._id === projectId));
      setTasks(taskRes.data.data);
      if (selectedTask) setSelectedTask(taskRes.data.data.find(t => t._id === selectedTask._id)); // Refresh open modal
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
    socket.on('taskCreated', fetchData);
    socket.on('taskUpdated', fetchData);
    return () => { socket.off('taskCreated'); socket.off('taskUpdated'); };
  }, [projectId, selectedTask]);

  // Create Task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = newTask.tags.split(',').map(t => t.trim()).filter(t => t);
      await API.post('/tasks', { ...newTask, projectId, assignedTo: user.id || user._id, tags: tagsArray });
      setShowAddModal(false);
      setNewTask({ title: '', description: '', dueDate: '', tags: '' });
    } catch (err) { alert("Error: " + err.response?.data?.message); }
  };

  // Add Remark
  const handleAddRemark = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/tasks/${selectedTask._id}/remarks`, { text: remarkText, isIssue });
      setRemarkText('');
      setIsIssue(false);
    } catch (err) { alert("Error: " + err.response?.data?.message); }
  };

  // Update Status
  const handleStatusUpdate = async (status) => {
    try {
      await API.put(`/tasks/${selectedTask._id}/status`, { status });
    } catch (err) { alert("Error: " + err.response?.data?.message); }
  };

  // Filter Tasks
  const filteredTasks = tasks.filter(t => filterTag ? t.tags.includes(filterTag.trim()) || t.title.toLowerCase().includes(filterTag.toLowerCase()) : true);

  if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-blue-500">Loading Board...</div>;

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-800 bg-gray-900 shrink-0">
        <button onClick={() => navigate('/')} className="flex items-center text-gray-400 hover:text-white mb-4 transition"><ArrowLeft size={16} className="mr-2" /> Dashboard</button>
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">{project?.name}</h1>
            <p className="text-gray-400 mt-1">{project?.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-gray-800 px-3 py-2 rounded-lg border border-gray-700 focus-within:border-blue-500">
              <Filter size={16} className="text-gray-400 mr-2" />
              <input type="text" placeholder="Filter by tag or title..." value={filterTag} onChange={(e) => setFilterTag(e.target.value)} className="bg-transparent border-none focus:outline-none text-sm w-48 text-white" />
            </div>
            {user?.role === 'Admin' && (
              <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-900/40">
                <Plus size={18} /> New Task
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex gap-6 pb-12">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col);
          return (
            <div key={col} className="min-w-[320px] w-[320px] bg-gray-900/50 rounded-2xl flex flex-col max-h-full border border-gray-800">
              <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 rounded-t-2xl">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${STATUS_COLORS[col]}`} />
                  <h3 className="font-bold text-gray-200">{col}</h3>
                </div>
                <span className="bg-gray-800 text-gray-400 text-xs px-2 py-1 rounded-full font-bold">{colTasks.length}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {colTasks.map(task => (
                  <div key={task._id} onClick={() => setSelectedTask(task)} className="bg-gray-800 border border-gray-700 p-4 rounded-xl cursor-pointer hover:border-blue-500 transition-colors shadow-sm group">
                    <div className="flex gap-2 flex-wrap mb-2">
                      {task.tags.map(tag => <span key={tag} className="text-[10px] uppercase font-bold tracking-wider bg-gray-700 text-gray-300 px-2 py-0.5 rounded">{tag}</span>)}
                    </div>
                    <h4 className="font-bold text-white mb-2 group-hover:text-blue-400 transition">{task.title}</h4>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                      <div className="flex items-center gap-1"><Clock size={12} /> {new Date(task.dueDate).toLocaleDateString()}</div>
                      <div className="flex items-center gap-1"><MessageSquare size={12} /> {task.remarks?.length || 0}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Detail Modal (The Hub) */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-gray-900 border-l border-gray-700 h-full shadow-2xl flex flex-col animate-slide-in">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-start bg-gray-900">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[selectedTask.status]} bg-opacity-20 text-${STATUS_COLORS[selectedTask.status].replace('bg-', '')}`}>{selectedTask.status}</span>
                  {selectedTask.tags.map(tag => <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded">{tag}</span>)}
                </div>
                <h2 className="text-2xl font-bold text-white">{selectedTask.title}</h2>
              </div>
              <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Description</h3>
                <p className="text-gray-300 bg-gray-800/50 p-4 rounded-xl border border-gray-800">{selectedTask.description}</p>
              </div>

              {/* Status Controls */}
              {(user?.role === 'Admin' || user?.id === selectedTask.assignedTo?._id) && (
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">Update Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {COLUMNS.map(col => (
                      <button key={col} onClick={() => handleStatusUpdate(col)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${selectedTask.status === col ? `${STATUS_COLORS[col]} text-white` : 'bg-gray-900 text-gray-400 hover:bg-gray-700'}`}>
                        {col}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Remarks Timeline */}
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Task Timeline & Remarks</h3>
                <div className="space-y-4">
                  {selectedTask.remarks?.length === 0 ? <p className="text-gray-500 text-sm">No remarks yet.</p> : selectedTask.remarks.map((rmk, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${rmk.isIssue ? 'bg-red-500/10 border-red-500/30' : 'bg-gray-800 border-gray-700'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-sm text-white flex items-center gap-2">
                          {rmk.addedBy?.name || 'User'} 
                          {rmk.isIssue && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1"><AlertTriangle size={10}/> Issue</span>}
                        </span>
                        <span className="text-xs text-gray-500">{new Date(rmk.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{rmk.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Remark Input */}
            <div className="p-6 border-t border-gray-800 bg-gray-900">
              <form onSubmit={handleAddRemark} className="space-y-4">
                <textarea required rows="2" value={remarkText} onChange={(e) => setRemarkText(e.target.value)} placeholder="Add an update, remark, or report an issue..." className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 resize-none" />
                <div className="flex justify-between items-center">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-red-400 transition">
                    <input type="checkbox" checked={isIssue} onChange={(e) => setIsIssue(e.target.checked)} className="rounded border-gray-700 bg-gray-800 text-red-500 focus:ring-red-500" />
                    <AlertTriangle size={16} /> Flag as Issue (Blocks Task)
                  </label>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold transition shadow-lg">Post Update</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-gray-900 border border-gray-700 rounded-3xl w-full max-w-lg p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Create New Task</h2>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <input type="text" required value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl py-3 px-4 focus:border-blue-500" placeholder="Task Title" />
              <textarea required rows="3" value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl py-3 px-4 focus:border-blue-500 resize-none" placeholder="Description" />
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Due Date</label>
                  <input type="date" required value={newTask.dueDate} onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})} className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl py-3 px-4 focus:border-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-500 mb-1">Tags (Comma separated)</label>
                  <input type="text" value={newTask.tags} onChange={(e) => setNewTask({...newTask, tags: e.target.value})} className="w-full bg-gray-800 text-white border border-gray-700 rounded-xl py-3 px-4 focus:border-blue-500" placeholder="API, Design, Urgent" />
                </div>
              </div>
              <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-xl font-bold transition-all shadow-lg">Assign Task</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectTasks;