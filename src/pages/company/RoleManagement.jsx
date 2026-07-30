
import { useEffect, useMemo, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import {
  AVAILABLE_ACTIONS,
  getPermissionCategoriesForBusinessType,
  getRolesForBusinessType,
  getVisibleResources,
  mergeRolePermissions,
} from '../../config/businessModules';

const getMenuItems = (businessType, hasPermission) => {
  const baseItems = [
    { path: '/company', label: 'Dashboard', icon: '🏠', resource: 'dashboard' },
    { path: '/company/users', label: 'Users', icon: '👥', resource: 'users' },
    { path: '/company/roles', label: 'Roles', icon: '🔐', resource: 'roles' },
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

  // Filter menu items by read permission
  return [...baseItems, ...businessItems].filter(item => hasPermission(item.resource, 'read'));
};

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, hasPermission, refreshPermissions } = useAuth();
  const businessType = user?.company?.business_type || 'all';
  const permissionCategories = useMemo(
    () => getPermissionCategoriesForBusinessType(businessType),
    [businessType]
  );
  const visibleResources = useMemo(
    () => getVisibleResources(permissionCategories),
    [permissionCategories]
  );
  const filteredRoles = useMemo(
    () => getRolesForBusinessType(roles, businessType),
    [roles, businessType]
  );

  const menuItems = getMenuItems(businessType, hasPermission);

  const [formData, setFormData] = useState({
    name: '',
    permissions: {},
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const rolesRes = await api.get('/roles');
      const companyRoles = (rolesRes.data.data || []).filter(r => Number(r.company_id) === Number(user?.company_id));
      setRoles(companyRoles);
    } catch (error) {
      toast.error(error.userMessage || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const permissionsPayload = {};
      visibleResources.forEach(resource => {
        permissionsPayload[resource] = formData.permissions[resource] || [];
      });

      const payload = {
        name: formData.name,
        company_id: Number(user?.company_id),
        permissions: editingRole
          ? mergeRolePermissions(editingRole.permissions, permissionsPayload)
          : permissionsPayload,
      };

      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, payload);
        toast.success('Role updated successfully!');
      } else {
        await api.post('/roles', payload);
        toast.success('Role created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
      refreshPermissions();
    } catch (error) {
      toast.error(error.userMessage || error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        await api.delete(`/roles/${id}`);
        toast.success('Role deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error(error.userMessage || 'Failed to delete role');
      }
    }
  };

  const handleEdit = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      permissions: role.permissions || {},
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      permissions: {},
    });
  };

  const togglePermission = (permission, action) => {
    setFormData(prev => {
      const currentPerm = prev.permissions[permission] || [];
      let newPerm;
      if (currentPerm.includes(action)) {
        newPerm = currentPerm.filter(a => a !== action);
      } else {
        newPerm = [...currentPerm, action];
      }
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: newPerm,
        },
      };
    });
  };

  const toggleAllActions = (permission, checked) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: [...AVAILABLE_ACTIONS],
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: [],
        },
      }));
    }
  };

  const isAllActionsChecked = (permission) => {
    const currentPerm = formData.permissions[permission] || [];
    return AVAILABLE_ACTIONS.every(action => currentPerm.includes(action));
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Role Management</h1>
        <p className="text-gray-600">Manage your company's roles and permissions</p>
      </div>

      {hasPermission('roles', 'create') && (
        <div className="mb-6">
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add New Role
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Permissions</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRoles.map(role => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{role.name}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">
                        {Object.keys(role.permissions || {}).length} modules
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {hasPermission('roles', 'update') && (
                        <button onClick={() => handleEdit(role)} className="text-blue-600 hover:text-blue-800 mr-3">
                          Edit
                        </button>
                      )}
                      {hasPermission('roles', 'delete') && role.name !== 'Company Admin' && (
                        <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-800">
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

      {/* Role Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Permissions</h3>
                <div className="space-y-6">
                  {permissionCategories.map(category => (
                    <div key={category.name} className="border rounded-lg p-4">
                      <h4 className="font-semibold text-gray-700 mb-3">{category.name}</h4>
                      <div className="space-y-4">
                        {category.permissions.map(permission => (
                          <div key={permission} className="border-b pb-3 last:border-b-0 last:pb-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium capitalize">{permission.replace(/_/g, ' ')}</span>
                              <label className="flex items-center text-sm text-gray-600">
                                <input
                                  type="checkbox"
                                  checked={isAllActionsChecked(permission)}
                                  onChange={(e) => toggleAllActions(permission, e.target.checked)}
                                  className="mr-2"
                                />
                                All
                              </label>
                            </div>
                            <div className="flex gap-4">
                              {AVAILABLE_ACTIONS.map(action => (
                                <label key={action} className="flex items-center text-sm text-gray-600">
                                  <input
                                    type="checkbox"
                                    checked={(formData.permissions[permission] || []).includes(action)}
                                    onChange={() => togglePermission(permission, action)}
                                    className="mr-2"
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
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingRole ? 'Update' : 'Create'}
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

export default RoleManagement;
