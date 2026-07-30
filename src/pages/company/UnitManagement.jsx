
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = (hasPermission) => {
  const items = [
    { path: '/company', label: 'Dashboard', icon: '🏠', resource: 'dashboard' },
    { path: '/company/users', label: 'Users', icon: '👥', resource: 'users' },
    { path: '/company/employees', label: 'Employees', icon: '👨‍💼', resource: 'employees' },
    { path: '/company/salaries', label: 'Salaries', icon: '💰', resource: 'salaries' },
  ];
  return items.filter(item => hasPermission(item.resource, 'read'));
};

const UnitManagement = () => {
  const [units, setUnits] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, hasPermission } = useAuth();

  const menuItems = getMenuItems(hasPermission);
  const [formData, setFormData] = useState({
    name: '',
    short_name: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/units');
      const companyUnits = response.data.data.filter(u => Number(u.company_id) === Number(user?.company_id));
      setUnits(companyUnits);
    } catch (error) {
      toast.error('Failed to load units');
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
      };

      if (editingUnit) {
        await api.put(`/units/${editingUnit.id}`, payload);
        toast.success('Unit updated successfully!');
      } else {
        await api.post('/units', payload);
        toast.success('Unit created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await api.delete(`/units/${id}`);
        toast.success('Unit deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete unit');
      }
    }
  };

  const handleEdit = (unit) => {
    setEditingUnit(unit);
    setFormData({
      name: unit.name || '',
      short_name: unit.short_name || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingUnit(null);
    setFormData({
      name: '',
      short_name: '',
    });
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Unit Management</h1>
        <p className="text-gray-600">Manage product units of measurement</p>
      </div>

      {hasPermission('units', 'create') && (
        <div className="mb-6">
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add New Unit
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Short Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {units.map(unit => (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{unit.name}</td>
                    <td className="px-6 py-4 text-gray-600">{unit.short_name}</td>
                    <td className="px-6 py-4">
                      {hasPermission('units', 'update') && (
                        <button onClick={() => handleEdit(unit)} className="text-blue-600 hover:text-blue-800 mr-3">
                          Edit
                        </button>
                      )}
                      {hasPermission('units', 'delete') && (
                        <button onClick={() => handleDelete(unit.id)} className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {units.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-5xl mb-4">⚖️</div>
                      <h3 className="text-lg font-semibold mb-2">No units yet</h3>
                      <p className="mb-6">Create your first unit to get started</p>
                      {hasPermission('units', 'create') && (
                        <button
                          onClick={() => { resetForm(); setIsModalOpen(true); }}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Create Unit
                        </button>
                      )}
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
              {editingUnit ? 'Edit Unit' : 'Create New Unit'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Kilogram, Meter"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Short Name</label>
                <input
                  type="text"
                  value={formData.short_name}
                  onChange={e => setFormData({ ...formData, short_name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., kg, m"
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingUnit ? 'Update' : 'Create'}
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

export default UnitManagement;
