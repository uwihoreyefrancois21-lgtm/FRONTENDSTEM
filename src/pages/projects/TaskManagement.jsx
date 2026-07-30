
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = (isCompanyAdmin) => {
  const baseItems = [
    { path: '/projects', label: 'Dashboard', icon: '🏠' },
    { path: '/projects/projects', label: 'Projects', icon: '📊' },
    { path: '/projects/workers', label: 'Project Workers', icon: '👷' },
    { path: '/projects/materials', label: 'Project Materials', icon: '🛠️' },
    { path: '/projects/expenses', label: 'Project Expenses', icon: '💰' },
    { path: '/projects/tasks', label: 'Tasks', icon: '✅' },
    { path: '/projects/reports', label: 'Reports', icon: '📈' },
    { path: '/projects/ai', label: 'AI Assistant', icon: '🤖' },
  ];
  
  // Add admin-only menu items
  if (isCompanyAdmin) {
    baseItems.push({ path: '/company/users', label: 'Users', icon: '👥' });
  }
  
  return baseItems;
};

const TaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, hasPermission } = useAuth();
  
  const isCompanyAdmin = user?.role?.name === 'Company Admin' || user?.is_super_admin;
  const menuItems = getMenuItems(isCompanyAdmin);
  const [formData, setFormData] = useState({
    project_id: '',
    title: '',
    description: '',
    assignment_type: 'employee',
    assigned_to: '',
    start_date: '',
    end_date: '',
    status: 'Pending',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching data...');
      const [tasksRes, projectsRes, employeesRes, workersRes] = await Promise.all([
        api.get('/project-tasks'),
        api.get('/projects'),
        api.get('/employees'),
        api.get('/workers'),
      ]);

      console.log('✅ Tasks API Response:', tasksRes.data);
      console.log('✅ Projects API Response:', projectsRes.data);
      console.log('✅ Employees API Response:', employeesRes.data);
      console.log('✅ Workers API Response:', workersRes.data);
      console.log('Current user:', user);

      const companyProjects = projectsRes.data.data.filter(p => Number(p.company_id) === Number(user?.company_id));
      const companyProjectIds = companyProjects.map(p => Number(p.id));
      
      console.log('🏢 Company Project IDs:', companyProjectIds);
      console.log('All tasks:', tasksRes.data.data);
      
      const companyTasks = tasksRes.data.data.filter(t => {
        const taskProjectId = Number(t.project_id);
        console.log(`Checking task ${t.id} (project ${taskProjectId})...`, companyProjectIds.includes(taskProjectId));
        return companyProjectIds.includes(taskProjectId);
      });
      
      console.log('✅ Filtered Company Tasks:', companyTasks);

      setTasks(companyTasks);
      setProjects(companyProjects);
      setEmployees(employeesRes.data.data.filter(e => Number(e.company_id) === Number(user?.company_id)));
      setWorkers(workersRes.data.data.filter(w => Number(w.company_id) === Number(user?.company_id)));
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      // Don't show toast for 403 (permission denied) errors
      if (error.response?.status !== 403) {
        toast.error('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        project_id: formData.project_id ? Number(formData.project_id) : null,
        assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
      };

      console.log('Submitting task with payload:', payload);

      if (editingTask) {
        await api.put(`/project-tasks/${editingTask.id}`, payload);
        toast.success('Task updated successfully!');
      } else {
        await api.post('/project-tasks', payload);
        toast.success('Task created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error submitting task:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await api.delete(`/project-tasks/${id}`);
        toast.success('Task deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete task');
      }
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      project_id: task.project_id || '',
      title: task.title || '',
      description: task.description || '',
      assignment_type: task.assignment_type || 'employee',
      assigned_to: task.assigned_to || '',
      start_date: task.start_date || '',
      end_date: task.end_date || '',
      status: task.status || 'Pending',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormData({
      project_id: '',
      title: '',
      description: '',
      assignment_type: 'employee',
      assigned_to: '',
      start_date: '',
      end_date: '',
      status: 'Pending',
    });
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => Number(p.id) === Number(projectId));
    return project?.name || 'N/A';
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => Number(e.id) === Number(employeeId));
    if (!employee) return 'N/A';
    if (employee.first_name || employee.last_name) {
      return `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
    }
    return `Employee ${employeeId}`;
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => Number(w.id) === Number(workerId));
    if (!worker) return 'N/A';
    if (worker.first_name || worker.last_name) {
      return `${worker.first_name || ''} ${worker.last_name || ''}`.trim();
    }
    return `Worker ${workerId}`;
  };

  const getAssignedName = (task) => {
    if (task.assignment_type === 'worker') {
      return getWorkerName(task.assigned_to);
    }
    return getEmployeeName(task.assigned_to);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Task Management</h1>
        <p className="text-gray-600">Manage your project tasks</p>
      </div>

      <div className="mb-6">
        {hasPermission('project_tasks', 'create') && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add New Task
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Task Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Assigned To</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Start Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map(task => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{task.title}</td>
                    <td className="px-6 py-4">{getProjectName(task.project_id)}</td>
                    <td className="px-6 py-4">{getAssignedName(task)}</td>
                    <td className="px-6 py-4">{task.start_date || 'N/A'}</td>
                    <td className="px-6 py-4">{task.end_date || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasPermission('project_tasks', 'update') && (
                        <button onClick={() => handleEdit(task)} className="text-blue-600 hover:text-blue-800 mr-3">
                          Edit
                        </button>
                      )}
                      {hasPermission('project_tasks', 'delete') && (
                        <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {tasks.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No tasks found. Create your first task!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                  <select
                    value={formData.project_id}
                    onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  >
                    <option value="">Select Project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Assignment Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assign To</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, assignment_type: 'employee', assigned_to: '' })}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition font-medium ${
                          formData.assignment_type === 'employee'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-600'
                        }`}
                      >
                        👤 Employee
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, assignment_type: 'worker', assigned_to: '' })}
                        className={`flex-1 px-4 py-2 rounded-lg border-2 transition font-medium ${
                          formData.assignment_type === 'worker'
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 hover:border-gray-400 text-gray-600'
                        }`}
                      >
                        👷 Worker
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {formData.assignment_type === 'worker' ? 'Select Worker' : 'Select Employee'}
                    </label>
                    <select
                      value={formData.assigned_to}
                      onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                    >
                      <option value="">
                        {formData.assignment_type === 'worker' ? 'Choose a worker...' : 'Choose an employee...'}
                      </option>
                      {formData.assignment_type === 'worker' ? (
                        workers.map(worker => (
                          <option key={worker.id} value={worker.id}>
                            {`${worker.first_name || ''} ${worker.last_name || ''}`.trim() || `Worker #${worker.id}`}
                          </option>
                        ))
                      ) : (
                        employees.map(employee => (
                          <option key={employee.id} value={employee.id}>
                            {`${employee.first_name || ''} ${employee.last_name || ''}`.trim() || `Employee #${employee.id}`}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
                  rows={3}
                  placeholder="Add task details..."
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingTask ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </DashboardLayout>
  );
};

export default TaskManagement;

