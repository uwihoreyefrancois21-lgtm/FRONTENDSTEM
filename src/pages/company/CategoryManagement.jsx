
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

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, hasPermission } = useAuth();

  const menuItems = getMenuItems(hasPermission);
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/categories');
      const companyCategories = response.data.data.filter(c => Number(c.company_id) === Number(user?.company_id));
      setCategories(companyCategories);
    } catch (error) {
      toast.error('Failed to load categories');
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
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      };

      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, payload);
        toast.success('Category updated successfully!');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || '',
      parent_id: category.parent_id || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      parent_id: '',
    });
  };

  const getParentCategoryName = (parentId) => {
    if (!parentId) return '-';
    const parent = categories.find(c => c.id === parentId);
    return parent?.name || '-';
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Category Management</h1>
        <p className="text-gray-600">Manage your product and service categories</p>
      </div>

      {hasPermission('categories', 'create') && (
        <div className="mb-6">
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add New Category
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Parent Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map(category => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 text-gray-600">{getParentCategoryName(category.parent_id)}</td>
                    <td className="px-6 py-4">
                      {hasPermission('categories', 'update') && (
                        <button onClick={() => handleEdit(category)} className="text-blue-600 hover:text-blue-800 mr-3">
                          Edit
                        </button>
                      )}
                      {hasPermission('categories', 'delete') && (
                        <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-5xl mb-4">📂</div>
                      <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                      <p className="mb-6">Create your first category to get started</p>
                      {hasPermission('categories', 'create') && (
                        <button
                          onClick={() => { resetForm(); setIsModalOpen(true); }}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        >
                          Create Category
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
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category (optional)</label>
                <select
                  value={formData.parent_id}
                  onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">None (Top Level)</option>
                  {categories
                    .filter(c => !editingCategory || c.id !== editingCategory.id)
                    .map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
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
                  {editingCategory ? 'Update' : 'Create'}
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

export default CategoryManagement;
