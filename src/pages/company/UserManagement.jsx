
import { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import {
    AVAILABLE_ACTIONS,
    getPermissionCategoriesForBusinessType,
    getRolesForBusinessType,
    getVisibleResources,
    initializePermissionsObject,
    mergeRolePermissions,
    permissionsObjectToArray,
    rolePermissionsToObject,
} from '../../config/businessModules';
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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingBranch, setEditingBranch] = useState(null);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [activeTab, setActiveTab] = useState('users');
  const { user, hasPermission } = useAuth();
  const businessType = user?.company?.business_type || 'all';
  const permissionCategories = useMemo(
    () => getPermissionCategoriesForBusinessType(businessType),
    [businessType]
  );
  const visibleResources = useMemo(
    () => getVisibleResources(permissionCategories),
    [permissionCategories]
  );
  const companyRoles = useMemo(
    () => getRolesForBusinessType(roles, businessType),
    [roles, businessType]
  );
  const assignableRoles = useMemo(() => {
    if (!selectedUserForRole?.role_id) {
      // Deduplicate by id
      const seenIds = new Set();
      return companyRoles.filter(role => {
        if (seenIds.has(Number(role.id))) return false;
        seenIds.add(Number(role.id));
        return true;
      });
    }
    const currentRole = roles.find(r => Number(r.id) === Number(selectedUserForRole.role_id));
    const allRoles = currentRole ? [...companyRoles, currentRole] : companyRoles;
    const seenIds = new Set();
    return allRoles.filter(role => {
      if (seenIds.has(Number(role.id))) return false;
      seenIds.add(Number(role.id));
      return true;
    });
  }, [roles, companyRoles, selectedUserForRole]);

  const menuItems = getMenuItems(businessType, hasPermission);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    role_id: '',
    branch_id: '',
    is_active: true,
  });
  
  // For user edit modal: include current user's role if not in companyRoles
  const userEditRoles = useMemo(() => {
    if (!editingUser?.role_id) {
      const seenIds = new Set();
      return companyRoles.filter(role => {
        if (seenIds.has(Number(role.id))) return false;
        seenIds.add(Number(role.id));
        return true;
      });
    }
    const currentRole = roles.find(r => Number(r.id) === Number(editingUser.role_id));
    const allRoles = currentRole ? [...companyRoles, currentRole] : companyRoles;
    const seenIds = new Set();
    return allRoles.filter(role => {
      if (seenIds.has(Number(role.id))) return false;
      seenIds.add(Number(role.id));
      return true;
    });
  }, [roles, companyRoles, editingUser]);
  const [roleFormData, setRoleFormData] = useState({
    role_id: '',
    permissions: initializePermissionsObject(permissionCategories),
  });
  const [branchFormData, setBranchFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newUserPassword, setNewUserPassword] = useState('');
  const [isUserFormSubmitting, setIsUserFormSubmitting] = useState(false);
  const [isRoleFormSubmitting, setIsRoleFormSubmitting] = useState(false);
  const [isBranchFormSubmitting, setIsBranchFormSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit]);

  const fetchData = async () => {
    try {
      const [usersRes, rolesRes, branchesRes] = await Promise.all([
        api.get('/users', { params: { page: pagination.page, limit: pagination.limit } }),
        api.get('/roles'),
        api.get('/branches'),
      ]);
      
      const allUsers = usersRes.data.data?.data || [];
      const companyUsers = allUsers.filter(u => Number(u.company_id) === Number(user?.company_id));
      setUsers(companyUsers);
      setPagination(prev => ({ ...prev, ...usersRes.data.data?.pagination || {} }));
      
      // Deduplicate roles by id
      const allRoles = rolesRes.data.data || [];
      const companyRolesRaw = allRoles.filter(r => Number(r.company_id) === Number(user?.company_id));
      const seenRoleIds = new Set();
      const uniqueCompanyRoles = companyRolesRaw.filter(role => {
        if (seenRoleIds.has(Number(role.id))) return false;
        seenRoleIds.add(Number(role.id));
        return true;
      });
      setRoles(uniqueCompanyRoles);
      
      setBranches((branchesRes.data.data || []).filter(b => Number(b.company_id) === Number(user?.company_id)));
    } catch (error) {
      toast.error(error.userMessage || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUserFormSubmitting(true);
    try {
      const payload = { 
        ...formData, 
        company_id: Number(user?.company_id),
        branch_id: formData.branch_id ? Number(formData.branch_id) : null,
        role_id: formData.role_id ? Number(formData.role_id) : null
      };
      
      const selectedRole = companyRoles.find(r => Number(r.id) === Number(payload.role_id));
      if (selectedRole?.name === 'Company Admin') {
        payload.branch_id = null;
      }

      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, payload);
        toast.success('User updated successfully!');
      } else {
        const response = await api.post('/users', payload);
        const defaultPassword = response.data.data.default_password;
        setNewUserPassword(defaultPassword);
        setShowPasswordModal(true);
        toast.success('User created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Operation failed');
    } finally {
      setIsUserFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/users/${id}`);
        toast.success('User deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error(error.userMessage || 'Failed to delete user');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone || '',
      role_id: user.role_id ? String(user.role_id) : '',
      branch_id: user.branch_id ? String(user.branch_id) : '',
      is_active: user.is_active,
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
      phone: '',
      password: '',
      role_id: '',
      branch_id: '',
      is_active: true,
    });
  };

  const resetBranchForm = () => {
    setEditingBranch(null);
    setBranchFormData({
      name: '',
      phone: '',
      email: '',
      address: '',
      city: '',
    });
  };

  const handleBranchSubmit = async (e) => {
    e.preventDefault();
    setIsBranchFormSubmitting(true);
    try {
      const payload = { ...branchFormData, company_id: user?.company_id };

      if (editingBranch) {
        await api.put(`/branches/${editingBranch.id}`, payload);
        toast.success('Branch updated successfully!');
      } else {
        await api.post('/branches', payload);
        toast.success('Branch created successfully!');
      }
      setIsBranchModalOpen(false);
      resetBranchForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsBranchFormSubmitting(false);
    }
  };

  const handleBranchEdit = (branch) => {
    setEditingBranch(branch);
    setBranchFormData({
      name: branch.name,
      phone: branch.phone,
      email: branch.email,
      address: branch.address,
      city: branch.city,
    });
    setIsBranchModalOpen(true);
  };

  const handleBranchDelete = async (id) => {
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

  const getBranchName = (branchId) => {
    return branches.find(b => Number(b.id) === Number(branchId))?.name || 'N/A';
  };

  const getRoleName = (roleId) => {
    return roles.find(r => Number(r.id) === Number(roleId))?.name || 'N/A';
  };

  const loadRolePermissions = (role) => rolePermissionsToObject(role?.permissions, permissionCategories);

  const isCompanyAdminRole = () => {
    const selectedRole = companyRoles.find(r => Number(r.id) === Number(formData.role_id));
    return selectedRole?.name === 'Company Admin';
  };

  const handleRoleClick = (targetUser) => {
    setSelectedUserForRole(targetUser);
    const userRole = roles.find(r => Number(r.id) === Number(targetUser.role_id));
    setRoleFormData({
      role_id: targetUser.role_id ? String(targetUser.role_id) : '',
      permissions: loadRolePermissions(userRole),
    });
    setIsRoleModalOpen(true);
  };

  const togglePermission = (permission, action) => {
    setRoleFormData(prev => {
      const currentPerm = prev.permissions[permission] || {};
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: {
            ...currentPerm,
            [action]: !currentPerm[action]
          },
        },
      };
    });
  };

  const toggleAllActions = (permission, checked) => {
    setRoleFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: {
          read: checked,
          create: checked,
          update: checked,
          delete: checked
        },
      },
    }));
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setIsRoleFormSubmitting(true);
    try {
      const roleToUpdate = roles.find(r => Number(r.id) === Number(roleFormData.role_id));
      if (!roleToUpdate || Number(roleToUpdate.company_id) !== Number(user?.company_id)) {
        toast.error('Invalid role selected');
        return;
      }

      const updatedPermissions = permissionsObjectToArray(roleFormData.permissions, visibleResources);
      const permissionsToSave = mergeRolePermissions(roleToUpdate.permissions, updatedPermissions);
      const permissionsChanged = JSON.stringify(roleToUpdate.permissions || {}) !== JSON.stringify(permissionsToSave);

      if (permissionsChanged) {
        const customRoleName = `${roleToUpdate.name} (${selectedUserForRole.first_name})`;
        const existingCustomRole = roles.find(
          r => r.name === customRoleName && Number(r.company_id) === Number(user?.company_id)
        );

        if (existingCustomRole) {
          await api.put(`/roles/${existingCustomRole.id}`, {
            name: existingCustomRole.name,
            permissions: permissionsToSave,
          });
          await api.put(`/users/${selectedUserForRole.id}`, { role_id: existingCustomRole.id });
        } else {
          const createRes = await api.post('/roles', {
            name: customRoleName,
            company_id: Number(user?.company_id),
            permissions: permissionsToSave,
          });
          await api.put(`/users/${selectedUserForRole.id}`, {
            role_id: createRes.data.data.id,
          });
        }
      } else {
        await api.put(`/users/${selectedUserForRole.id}`, {
          role_id: Number(roleFormData.role_id),
        });
      }

      toast.success('Role and permissions updated successfully! User must log in again to apply changes.');
      setIsRoleModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setIsRoleFormSubmitting(false);
    }
  };

  const noBranchUsers = users.filter(u => !u.branch_id);
  const branchGroups = branches.map(branch => ({
    branch,
    users: users.filter(u => Number(u.branch_id) === Number(branch.id)),
  })).filter(g => g.users.length > 0);

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">User & Branch Management</h1>
        <p className="text-gray-600">Manage your company's users and branches</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('branches')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'branches'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Branches
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          {activeTab === 'users' && (
            <>
              {hasPermission('users', 'create') && (
                <div className="mb-6">
                  <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    Add New User
                  </button>
                </div>
              )}

              {/* Company Administrators */}
              {noBranchUsers.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-600 rounded-full"></span>
                    Company Administrators
                  </h2>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {noBranchUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{u.first_name} {u.last_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                  {getRoleName(u.role_id)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {u.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                                {hasPermission('roles', 'update') && (
                                  <button 
                                    onClick={() => handleRoleClick(u)} 
                                    className="text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <span className="flex items-center gap-1">
                                      <span className="text-lg">🔐</span>
                                      Role
                                    </span>
                                  </button>
                                )}
                                {hasPermission('users', 'update') && (
                                  <button 
                                    onClick={() => handleEdit(u)} 
                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <span className="flex items-center gap-1">
                                      <span className="text-lg">✏️</span>
                                      Edit
                                    </span>
                                  </button>
                                )}
                                {hasPermission('users', 'delete') && (
                                  <button 
                                    onClick={() => handleDelete(u.id)} 
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <span className="flex items-center gap-1">
                                      <span className="text-lg">🗑️</span>
                                      Delete
                                    </span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Branches */}
              {branchGroups.map(({ branch, users: branchUsers }) => (
                <div key={branch.id} className="mb-8">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
                    {branch.name}
                  </h2>
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {branchUsers.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{u.first_name} {u.last_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-gray-600">{u.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                  {getRoleName(u.role_id)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {u.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-3">
                                {hasPermission('roles', 'update') && (
                                  <button 
                                    onClick={() => handleRoleClick(u)} 
                                    className="text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <span className="flex items-center gap-1">
                                      <span className="text-lg">🔐</span>
                                      Role
                                    </span>
                                  </button>
                                )}
                                {hasPermission('users', 'update') && (
                                  <button 
                                    onClick={() => handleEdit(u)} 
                                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <span className="flex items-center gap-1">
                                      <span className="text-lg">✏️</span>
                                      Edit
                                    </span>
                                  </button>
                                )}
                                {hasPermission('users', 'delete') && (
                                  <button 
                                    onClick={() => handleDelete(u.id)} 
                                    className="text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                  >
                                    <span className="flex items-center gap-1">
                                      <span className="text-lg">🗑️</span>
                                      Delete
                                    </span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              <div className="flex justify-between items-center mt-8 bg-white rounded-xl shadow-sm p-4">
                <div className="text-gray-600">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total users)
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={pagination.page <= 1}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'branches' && (
            <>
              {hasPermission('branches', 'create') && (
                <div className="mb-6">
                  <button
                    onClick={() => { resetBranchForm(); setIsBranchModalOpen(true); }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                  >
                    <span className="text-xl">+</span>
                    Add New Branch
                  </button>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Branch Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Phone</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">City</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
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
                              <button onClick={() => handleBranchEdit(branch)} className="text-blue-600 hover:text-blue-800 mr-3">
                                Edit
                              </button>
                            )}
                            {hasPermission('branches', 'delete') && (
                              <button onClick={() => handleBranchDelete(branch.id)} className="text-red-600 hover:text-red-800">
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
            </>
          )}
        </>
      )}

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Password (optional)</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Leave empty to auto-generate"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              )}
              {!isCompanyAdminRole() && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
                  <select
                    value={formData.branch_id}
                    onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Select a branch (optional)</option>
                    {branches.map(branch => (
                      <option key={branch.id} value={branch.id}>{branch.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  value={formData.role_id}
                  onChange={e => {
                    const newRoleId = e.target.value;
                    const selectedRole = userEditRoles.find(r => r.id === parseInt(newRoleId));
                    setFormData({
                      ...formData,
                      role_id: newRoleId,
                      branch_id: selectedRole?.name === 'Company Admin' ? '' : formData.branch_id,
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select a role</option>
                  {userEditRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 rounded"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700">Active</label>
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isUserFormSubmitting}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUserFormSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isUserFormSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Processing...
                    </>
                  ) : (
                    editingUser ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role & Permissions Modal */}
      {isRoleModalOpen && selectedUserForRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setIsRoleModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Assign Role & Permissions - {selectedUserForRole.first_name} {selectedUserForRole.last_name}
            </h2>
            <form onSubmit={handleRoleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Role</label>
                <select
                  value={roleFormData.role_id}
                  onChange={e => {
                    const newRoleId = e.target.value;
                    const selectedRole = assignableRoles.find(r => Number(r.id) === Number(newRoleId));
                    setRoleFormData({
                      role_id: newRoleId,
                      permissions: loadRolePermissions(selectedRole),
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <option value="">Select a role</option>
                  {assignableRoles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Permissions</h3>
                <div className="space-y-5">
                  {permissionCategories.map(category => (
                    <div key={category.name} className="border border-gray-200 rounded-2xl p-6">
                      <h4 className="font-bold text-gray-800 mb-4 text-lg">{category.name}</h4>
                      <div className="space-y-4">
                        {category.permissions.map(permission => (
                          <div key={permission} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold text-gray-700 capitalize">{permission}</span>
                              <label className="flex items-center gap-2 text-sm text-gray-600">
                                <input
                                  type="checkbox"
                                  checked={AVAILABLE_ACTIONS.every(action => (roleFormData.permissions[permission] || {})[action])}
                                  onChange={(e) => toggleAllActions(permission, e.target.checked)}
                                  className="w-4 h-4 rounded"
                                />
                                All
                              </label>
                            </div>
                            <div className="flex gap-6">
                              {AVAILABLE_ACTIONS.map(action => (
                                <label key={action} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={(roleFormData.permissions[permission] || {})[action]}
                                    onChange={() => togglePermission(permission, action)}
                                    className="w-4 h-4 rounded"
                                  />
                                  {action.charAt(0).toUpperCase() + action.slice(1)}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsRoleModalOpen(false)}
                  disabled={isRoleFormSubmitting}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRoleFormSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isRoleFormSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Processing...
                    </>
                  ) : (
                    'Save'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Modal */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setIsBranchModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingBranch ? 'Edit Branch' : 'Create New Branch'}
            </h2>
            <form onSubmit={handleBranchSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Branch Name</label>
                <input
                  type="text"
                  required
                  value={branchFormData.name}
                  onChange={e => setBranchFormData({ ...branchFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={branchFormData.email}
                  onChange={e => setBranchFormData({ ...branchFormData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="text"
                  value={branchFormData.phone}
                  onChange={e => setBranchFormData({ ...branchFormData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea
                  value={branchFormData.address}
                  onChange={e => setBranchFormData({ ...branchFormData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={branchFormData.city}
                  onChange={e => setBranchFormData({ ...branchFormData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  disabled={isBranchFormSubmitting}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-semibold text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isBranchFormSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isBranchFormSubmitting ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      Processing...
                    </>
                  ) : (
                    editingBranch ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />

      {/* Default Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">User Created Successfully!</h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-3 font-medium">Default Password:</p>
              <div className="bg-gray-100 p-5 rounded-xl font-mono text-xl text-center break-all text-gray-800 border border-gray-200">
                {newUserPassword}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                User will be required to change this password on first login.
              </p>
            </div>
            <button
              onClick={() => setShowPasswordModal(false)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default UserManagement;
