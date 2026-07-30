
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = (businessType, hasPermission) => {
  const baseItems = [
    { path: '/company', label: 'Dashboard', icon: '🏠', resource: 'dashboard' },
    { path: '/company/users', label: 'Users', icon: '👥', resource: 'users' },
    { path: '/company/employees', label: 'Employees', icon: '👨‍💼', resource: 'employees' },
    { path: '/company/salaries', label: 'Salaries', icon: '💰', resource: 'salaries' },
  ];
  
  let businessItems = [];
  if (businessType === 'services') {
    businessItems = [{ path: '/services', label: 'Manage Services', icon: '💼', resource: 'services' }];
  } else if (businessType === 'products') {
    businessItems = [{ path: '/products', label: 'Manage Products', icon: '🛒', resource: 'products' }];
  } else if (businessType === 'projects') {
    businessItems = [{ path: '/projects', label: 'Manage Projects', icon: '📊', resource: 'projects' }];
  } else {
    businessItems = [{ path: '/allinone', label: 'All-in-One', icon: '🚀', resource: 'dashboard' }];
  }
  
  return [...baseItems, ...businessItems].filter(item => hasPermission(item.resource, 'read'));
};

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, hasPermission } = useAuth();
  
  const menuItems = getMenuItems(user?.company?.business_type, hasPermission);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const branchesRes = await api.get('/branches');
      const companyBranches = branchesRes.data.data.filter(b => b.company_id === user?.company_id);
      setBranches(companyBranches);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, company_id: user?.company_id };

      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, payload);
        toast.success('Branch updated successfully!');
      } else {
        await api.post('/branches', payload);
        toast.success('Branch created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this branch?')) {
      try {
        await api.delete(`/branches/${id}`);
        toast.success('Branch deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete branch');
      }
    }
  };

  const handleEdit = (branch) => {
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      phone: branch.phone,
      email: branch.email,
      address: branch.address,
      city: branch.city,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingBranch(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
    });
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Branch Management</h1>
        <p className="text-gray-600">Manage your company's branches</p>
      </div>

      {hasPermission('branches', 'create') && (
        <div className="mb-6">
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add New Branch
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">City</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {branches.map(branch => (
                  <tr key={branch.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{branch.name}</td>
                    <td className="px-6 py-4 text-gray-600">{branch.email}</td>
                    <td className="px-6 py-4 text-gray-600">{branch.phone}</td>
                    <td className="px-6 py-4 text-gray-600">{branch.city}</td>
                    <td className="px-6 py-4">
                      {hasPermission('branches', 'update') && (
                        <button onClick={() => handleEdit(branch)} className="text-blue-600 hover:text-blue-800 mr-3">
                          Edit
                        </button>
                      )}
                      {hasPermission('branches', 'delete') && (
                        <button onClick={() => handleDelete(branch.id)} className="text-red-600 hover:text-red-800">
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingBranch ? 'Edit Branch' : 'Create New Branch'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                  {editingBranch ? 'Update' : 'Create'}
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

export default BranchManagement;
