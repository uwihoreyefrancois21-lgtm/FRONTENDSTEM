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
    { path: '/projects/expenses', label: 'Project Expenses', icon: '💰' },
    { path: '/projects/tasks', label: 'Tasks', icon: '✅' },
    { path: '/projects/reports', label: 'Reports', icon: '📈' },
    { path: '/projects/ai', label: 'AI Assistant', icon: '🤖' },
  ];
  
  if (isCompanyAdmin) {
    baseItems.push({ path: '/company/users', label: 'Users', icon: '👥' });
  }
  
  return baseItems;
};

const ProjectWorkers = () => {
  const [workers, setWorkers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [companyWorkersList, setCompanyWorkersList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const { user, formatCurrency, hasPermission } = useAuth();
  
  const isCompanyAdmin = user?.role?.name === 'Company Admin' || user?.is_super_admin;
  const menuItems = getMenuItems(isCompanyAdmin);
  const [formData, setFormData] = useState({
    project_id: '',
    worker_id: '',
    role: '',
    payment_type: 'daily',
    rate: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [workersRes, projectsRes, workersListRes] = await Promise.all([
        api.get('/project-workers'),
        api.get('/projects'),
        api.get('/workers'),
      ]);

      const companyProjects = projectsRes.data.data.filter(p => Number(p.company_id) === Number(user?.company_id));
      const companyProjectIds = companyProjects.map(p => Number(p.id));
      const companyWorkers = workersRes.data.data.filter(w => companyProjectIds.includes(Number(w.project_id)));

      setWorkers(companyWorkers);
      setProjects(companyProjects);
      setCompanyWorkersList(workersListRes.data.data.filter(w => Number(w.company_id) === Number(user?.company_id)));
    } catch (error) {
      // Don't show toast for 403 (permission denied) errors
      if (error.response?.status !== 403) {
        toast.error('Failed to load data');
      }
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        project_id: Number(formData.project_id),
        worker_id: Number(formData.worker_id),
        rate: Number(formData.rate),
      };

      if (editingWorker) {
        await api.put(`/project-workers/${editingWorker.id}`, payload);
        toast.success('Worker updated successfully!');
      } else {
        await api.post('/project-workers', payload);
        toast.success('Worker assigned successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this worker from the project?')) {
      setDeleting(id);
      try {
        await api.delete(`/project-workers/${id}`);
        toast.success('Worker removed successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to remove worker');
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      project_id: worker.project_id || '',
      worker_id: worker.worker_id || '',
      role: worker.role || '',
      payment_type: worker.payment_type || 'daily',
      rate: worker.rate || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingWorker(null);
    setFormData({
      project_id: '',
      worker_id: '',
      role: '',
      payment_type: 'daily',
      rate: '',
    });
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => Number(p.id) === Number(projectId));
    return project?.name || 'N/A';
  };

  const getWorkerName = (workerId) => {
    const worker = companyWorkersList.find(w => Number(w.id) === Number(workerId));
    if (!worker) return 'N/A';
    if (worker.first_name || worker.last_name) {
      return `${worker.first_name || ''} ${worker.last_name || ''}`.trim();
    }
    return `Worker ${workerId}`;
  };

  const formatPaymentType = (type) => {
    const types = {
      hourly: 'Hourly',
      daily: 'Daily',
      weekly: 'Weekly',
      per_task: 'Per Task'
    };
    return types[type] || type;
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Project Workers</h1>
        <p className="text-gray-600">Assign workers to projects</p>
      </div>

      <div className="mb-6">
        {hasPermission('project_workers', 'create') && (
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Assign Worker
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Worker</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {workers.map(worker => (
                  <tr key={worker.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{getProjectName(worker.project_id)}</td>
                    <td className="px-6 py-4">{getWorkerName(worker.worker_id)}</td>
                    <td className="px-6 py-4">{worker.role || 'General Worker'}</td>
                    <td className="px-6 py-4">{formatPaymentType(worker.payment_type)}</td>
                    <td className="px-6 py-4">{formatCurrency(worker.rate)}</td>
                    <td className="px-6 py-4">
                      {hasPermission('project_workers', 'update') && (
                        <button 
                          onClick={() => handleEdit(worker)} 
                          className="text-blue-600 hover:text-blue-800 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={deleting === worker.id}
                        >
                          Edit
                        </button>
                      )}
                      {hasPermission('project_workers', 'delete') && (
                        <button 
                          onClick={() => handleDelete(worker.id)} 
                          className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={deleting === worker.id}
                        >
                          {deleting === worker.id ? 'Removing...' : 'Remove'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {workers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No workers assigned yet. Assign your first worker!
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
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingWorker ? 'Edit Worker Assignment' : 'Assign Worker to Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  value={formData.project_id}
                  onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Worker</label>
                <select
                  value={formData.worker_id}
                  onChange={e => setFormData({ ...formData, worker_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select Worker</option>
                  {companyWorkersList.map(w => (
                    <option key={w.id} value={w.id}>
                      {`${w.first_name || ''} ${w.last_name || ''}`.trim() || `Worker ${w.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Mason, Electrician, Carpenter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <select
                  value={formData.payment_type}
                  onChange={e => setFormData({ ...formData, payment_type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="per_task">Per Task</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate</label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={e => setFormData({ ...formData, rate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  required
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Processing...' : (editingWorker ? 'Update' : 'Assign')}
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

export default ProjectWorkers;
