
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

const menuItems = [
  { path: '/superadmin', label: 'Dashboard', icon: '🏠' },
  { path: '/superadmin/companies', label: 'Companies', icon: '🏢' },
  { path: '/superadmin/plans', label: 'Plans', icon: '📋' },
  { path: '/superadmin/users', label: 'Users', icon: '👥' },
  { path: '/superadmin/branches', label: 'Branches', icon: '🏗️' },
  { path: '/superadmin/reports', label: 'Reports', icon: '📈' },
];
const SuperAdminBranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    company_id: '',
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
      const [branchesRes, companiesRes] = await Promise.all([
        api.get('/branches'),
        api.get('/companies'),
      ]);
      setBranches(branchesRes.data.data);
      setCompanies(companiesRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
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
      company_id: branch.company_id,
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
      company_id: '',
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
    });
  };

  const getCompanyName = (companyId) => {
    return companies.find(c => c.id === companyId)?.name || 'N/A';
  };

  // Group branches by company
  const groupedBranches = companies.reduce((acc, company) => {
    const companyBranches = branches.filter(b => b.company_id === company.id);
    if (companyBranches.length > 0) {
      acc[company.id] = {
        company,
        branches: companyBranches,
      };
    }
    return acc;
  }, {});

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Branch Management</h1>
        <p className="text-gray-600">Manage all branches across all companies</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + Add New Branch
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
      ) : (
        Object.values(groupedBranches).map(({ company, branches: companyBranches }) => (
          <div key={company.id} className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
              {company.name}
            </h2>
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
                    {companyBranches.map(branch => (
                      <tr key={branch.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{branch.name}</td>
                        <td className="px-6 py-4 text-gray-600">{branch.email}</td>
                        <td className="px-6 py-4 text-gray-600">{branch.phone}</td>
                        <td className="px-6 py-4 text-gray-600">{branch.city}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleEdit(branch)} className="text-blue-600 hover:text-blue-800 mr-3">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(branch.id)} className="text-red-600 hover:text-red-800">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <select
                  value={formData.company_id}
                  onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select a company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
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

export default SuperAdminBranchManagement;
