
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = (isCompanyAdmin, hasPermission) => {
  const baseItems = [
    { path: '/projects', label: 'Dashboard', icon: '🏠', resource: 'dashboard' },
    { path: '/projects/projects', label: 'Projects', icon: '📊', resource: 'projects' },
    { path: '/projects/workers', label: 'Project Workers', icon: '👷', resource: 'project_workers' },
    { path: '/projects/expenses', label: 'Project Expenses', icon: '💰', resource: 'expenses' },
    { path: '/projects/tasks', label: 'Tasks', icon: '✅', resource: 'project_tasks' },
    { path: '/projects/reports', label: 'Reports', icon: '📈', resource: 'reports' },
    { path: '/projects/ai', label: 'AI Assistant', icon: '🤖', resource: 'dashboard' },
  ];
  
  // Add admin-only menu items
  if (isCompanyAdmin) {
    baseItems.push({ path: '/company/users', label: 'Users', icon: '👥', resource: 'users' });
  }
  
  return baseItems.filter(item => hasPermission(item.resource, 'read'));
};

const ProjectManagement = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, formatCurrency, hasPermission } = useAuth();
  
  const isCompanyAdmin = user?.role?.name === 'Company Admin' || user?.is_super_admin;
  const menuItems = getMenuItems(isCompanyAdmin, hasPermission);
  const [formData, setFormData] = useState({
    project_code: '',
    branch_id: '',
    customer_id: '',
    name: '',
    description: '',
    location: '',
    start_date: '',
    end_date: '',
    budget: '',
    status: 'Pending',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, customersRes, branchesRes, usersRes] = await Promise.all([
        api.get('/projects'),
        api.get('/customers'),
        api.get('/branches'),
        api.get('/users'),
      ]);
      
      const projectsData = projectsRes.data.data;
      const customersData = customersRes.data.data;
      const branchesData = branchesRes.data.data;
      const usersData = usersRes.data.data?.data || usersRes.data.data || [];
      
      console.log('Loaded users:', usersData);
      console.log('Loaded branches:', branchesData);
      
      setProjects(isCompanyAdmin ? projectsData.filter(p => Number(p.company_id) === Number(user?.company_id)) : projectsData);
      setCustomers(customersData.filter(c => Number(c.company_id) === Number(user?.company_id)));
      setBranches(branchesData.filter(b => Number(b.company_id) === Number(user?.company_id)));
      setUsers(usersData);
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
    try {
      const payload = { 
        ...formData, 
        company_id: user?.company_id,
        branch_id: formData.branch_id ? Number(formData.branch_id) : null,
        customer_id: formData.customer_id ? Number(formData.customer_id) : null,
        budget: formData.budget ? Number(formData.budget) : null,
      };

      if (editingProject) {
        await api.put(`/projects/${editingProject.id}`, payload);
        toast.success('Project updated successfully!');
      } else {
        await api.post('/projects', payload);
        toast.success('Project created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/projects/${id}`);
        toast.success('Project deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      project_code: project.project_code || '',
      branch_id: project.branch_id || '',
      customer_id: project.customer_id || '',
      name: project.name || '',
      description: project.description || '',
      location: project.location || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      budget: project.budget || '',
      status: project.status || 'Pending',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingProject(null);
    setFormData({
      project_code: '',
      branch_id: '',
      customer_id: '',
      name: '',
      description: '',
      location: '',
      start_date: '',
      end_date: '',
      budget: '',
      status: 'Pending',
    });
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => Number(c.id) === Number(customerId));
    return customer?.name || 'N/A';
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => Number(b.id) === Number(branchId));
    return branch?.name || 'N/A';
  };

  const getBranchManagerName = (branchId) => {
    console.log('Looking for manager for branch:', branchId);
    console.log('All users:', users);
    
    if (!branchId) return 'N/A';
    
    const branchManager = users.find(u => {
      const matchesBranch = Number(u.branch_id) === Number(branchId);
      const isBranchManager = u.role?.name === 'Branch Manager';
      console.log(`User ${u.id}: branch_id=${u.branch_id}, role=${u.role?.name}, matches=${matchesBranch && isBranchManager}`);
      return matchesBranch && isBranchManager;
    });
    
    if (branchManager) {
      const name = `${branchManager.first_name || ''} ${branchManager.last_name || ''}`.trim();
      const email = branchManager.email || '';
      return email ? `${name} (${email})` : name || 'N/A';
    }
    
    return 'N/A';
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Project Management</h1>
        <p className="text-gray-600">Manage your company projects</p>
      </div>

      {hasPermission('projects', 'create') && (
        <div className="mb-6">
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add New Project
          </button>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch Manager</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Start Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Budget</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {projects.map(project => (
                      <tr key={project.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{project.project_code}</td>
                        <td className="px-6 py-4">{project.name}</td>
                        <td className="px-6 py-4">{getBranchName(project.branch_id)}</td>
                        <td className="px-6 py-4">{getBranchManagerName(project.branch_id)}</td>
                        <td className="px-6 py-4">{getCustomerName(project.customer_id)}</td>
                        <td className="px-6 py-4">{project.start_date}</td>
                        <td className="px-6 py-4">{project.end_date}</td>
                        <td className="px-6 py-4">{formatCurrency(project.budget)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                            {project.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {hasPermission('projects', 'read') && (
                            <button onClick={() => navigate(`/projects/projects/${project.id}`)} className="text-green-600 hover:text-green-800 mr-2">
                              View
                            </button>
                          )}
                          {hasPermission('projects', 'update') && (
                            <button onClick={() => handleEdit(project)} className="text-blue-600 hover:text-blue-800 mr-2">
                              Edit
                            </button>
                          )}
                          {hasPermission('projects', 'delete') && (
                            <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-800">
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Code</label>
                  <input
                    type="text"
                    value={formData.project_code}
                    onChange={e => setFormData({ ...formData, project_code: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <select
                    value={formData.branch_id}
                    onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Branch</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name} - Manager: {getBranchManagerName(branch.id)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <select
                    value={formData.customer_id}
                    onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={e => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
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
                  {editingProject ? 'Update' : 'Create'}
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

export default ProjectManagement;

