
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

const SuperAdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 3, total: 0, totalPages: 0 });

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    company_id: '',
    branch_id: '',
    role_id: '',
    is_active: true,
    is_super_admin: false,
  });

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit]);

  const fetchData = async () => {
    try {
      const [usersRes, companiesRes, rolesRes, branchesRes] = await Promise.all([
        api.get('/users', { params: { page: pagination.page, limit: pagination.limit } }),
        api.get('/companies'),
        api.get('/roles'),
        api.get('/branches'),
      ]);
      setUsers(usersRes.data.data.data);
      setPagination(prev => ({ ...prev, ...usersRes.data.data.pagination }));
      setCompanies(companiesRes.data.data);
      setRoles(rolesRes.data.data);
      setBranches(branchesRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        company_id: formData.company_id ? parseInt(formData.company_id) : null,
        branch_id: formData.branch_id ? parseInt(formData.branch_id) : null,
        role_id: formData.role_id ? parseInt(formData.role_id) : null
      };
      
      // If selected role is company admin, set branch_id to null
      const selectedRole = roles.find(r => r.id === parseInt(payload.role_id));
      if (selectedRole?.name === 'Company Admin') {
        payload.branch_id = null;
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success('User updated successfully!');
      } else {
        await api.post('/users', payload);
        toast.success('User created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('User deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      company_id: user.company_id ? String(user.company_id) : '',
      branch_id: user.branch_id ? String(user.branch_id) : '',
      role_id: user.role_id ? String(user.role_id) : '',
      is_active: user.is_active,
      is_super_admin: user.is_super_admin || false,
      password: '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      company_id: '',
      branch_id: '',
      role_id: '',
      is_active: true,
      is_super_admin: false,
    });
  };

  const getCompanyName = (companyId) => {
    return companies.find(c => c.id === companyId)?.name || 'N/A';
  };

  const getBranchName = (branchId) => {
    return branches.find(b => b.id === branchId)?.name || 'N/A';
  };

  const getRoleName = (roleId, user) => {
    if (user?.role?.name) {
      return user.role.name;
    }
    return roles.find(r => Number(r.id) === Number(roleId))?.name || 'N/A';
  };

  // Get all available roles for super admin
  const getAvailableRoles = () => {
    if (!formData.company_id) return roles;
    return roles.filter(r => r.company_id === parseInt(formData.company_id) || !r.company_id);
  };

  // Check if selected role is company admin
  const isCompanyAdminRole = () => {
    const selectedRole = roles.find(r => r.id === parseInt(formData.role_id));
    return selectedRole?.name === 'Company Admin';
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User Management</h1>
        <p className="text-gray-600">Manage all users across all companies</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + Add New User
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Super Admins Section */}
          {users.some(u => u.is_super_admin) && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-3 h-3 bg-purple-600 rounded-full mr-2"></span>
                Super Admins
              </h2>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.filter(u => u.is_super_admin).map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            {u.first_name} {u.last_name}
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                              Super Admin
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-600">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-800 mr-3">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800">
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
          )}

          {/* Companies Sections */}
          {companies.map(company => {
            const companyUsers = users.filter(u => u.company_id === company.id && !u.is_super_admin);
            if (companyUsers.length === 0) return null;

            const companyBranches = branches.filter(b => b.company_id === company.id);
            const noBranchUsers = companyUsers.filter(u => !u.branch_id);

            return (
              <div key={company.id} className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
                  {company.name}
                </h2>

                {/* No Branch Users */}
                {noBranchUsers.length > 0 && (
                  <div className="mb-4 bg-white rounded-xl shadow-sm overflow-hidden">
                    <h3 className="px-6 py-3 text-lg font-semibold text-gray-700 border-b">
                      Company Administrators
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {noBranchUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                {u.first_name} {u.last_name}
                              </td>
                              <td className="px-6 py-4 text-gray-600">{u.email}</td>
                              <td className="px-6 py-4">{getRoleName(u.role_id, u)}</td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {u.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-800 mr-3">
                                  Edit
                                </button>
                                <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800">
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Branches */}
                {companyBranches.map(branch => {
                  const branchUsers = companyUsers.filter(u => u.branch_id === branch.id);
                  if (branchUsers.length === 0) return null;
                  
                  return (
                    <div key={branch.id} className="mb-4 bg-white rounded-xl shadow-sm overflow-hidden">
                      <h3 className="px-6 py-3 text-lg font-semibold text-gray-700 border-b flex items-center">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                        {branch.name}
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {branchUsers.map(u => (
                              <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                  {u.first_name} {u.last_name}
                                </td>
                                <td className="px-6 py-4 text-gray-600">{u.email}</td>
                                <td className="px-6 py-4">{getRoleName(u.role_id, u)}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {u.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-800 mr-3">
                                    Edit
                                  </button>
                                  <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800">
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Users without company */}
          {users.some(u => !u.company_id && !u.is_super_admin) && (
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
                Users Without Company
              </h2>
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.filter(u => !u.company_id && !u.is_super_admin).map(u => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            {u.first_name} {u.last_name}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{u.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {u.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-800 mr-3">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800">
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
          )}

          {/* Pagination */}
          <div className="flex justify-between items-center mt-8">
            <div className="text-gray-600">
              Page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)
            </div>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <select
                  value={formData.company_id}
                  onChange={e => setFormData({ ...formData, company_id: e.target.value, branch_id: '', role_id: '' })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select a company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
              </div>
              {formData.company_id && !isCompanyAdminRole() && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                  <select
                    value={formData.branch_id}
                    onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select a branch (optional)</option>
                    {branches.filter(b => b.company_id === parseInt(formData.company_id)).map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.company_id && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    value={formData.role_id}
                    onChange={e => {
                      const newRoleId = e.target.value;
                      const selectedRole = roles.find(r => r.id === parseInt(newRoleId));
                      setFormData({
                        ...formData,
                        role_id: newRoleId,
                        branch_id: selectedRole?.name === 'Company Admin' ? '' : formData.branch_id,
                      });
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select a role</option>
                    {getAvailableRoles().map(role => (
                      <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_super_admin"
                  checked={formData.is_super_admin}
                  onChange={e => setFormData({ ...formData, is_super_admin: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_super_admin" className="text-sm font-medium text-gray-700">Super Admin</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Active</label>
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
                  {editingUser ? 'Update' : 'Create'}
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

export default SuperAdminUserManagement;

