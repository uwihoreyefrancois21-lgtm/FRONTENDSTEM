
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

const SuperAdminPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const businessTypes = [
    { id: 'services', name: 'Services' },
    { id: 'projects', name: 'Projects' },
    { id: 'products', name: 'Products' },
    { id: 'all', name: 'All-in-One' },
  ];
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    currency: 'RWF',
    duration_days: 30,
    max_users: 1,
    max_branches: 1,
    is_active: true,
    business_type: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const plansRes = await api.get('/subscription_plans');
      setPlans(plansRes.data.data);
    } catch (error) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      currency: 'RWF',
      duration_days: 30,
      max_users: 1,
      max_branches: 1,
      is_active: true,
      business_type: ''
    });
    setShowModal(true);
  };

  const handleEditPlan = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price ?? 0,
      currency: plan.currency || 'RWF',
      duration_days: plan.duration_days ?? 30,
      max_users: plan.max_users ?? 1,
      max_branches: plan.max_branches ?? 1,
      is_active: plan.is_active ?? true,
      business_type: plan.business_type || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await api.put(`/subscription_plans/${editingPlan.id}`, formData);
        toast.success('Plan updated successfully');
      } else {
        await api.post('/subscription_plans', formData);
        toast.success('Plan created successfully');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save plan');
    }
  };

  const handleDeletePlan = async (plan) => {
    if (!window.confirm(`Are you sure you want to delete "${plan.name}"?`)) {
      return;
    }
    try {
      await api.delete(`/subscription_plans/${plan.id}`);
      toast.success('Plan deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Subscription Plans</h1>
            <p className="text-gray-600">View and manage all subscription plans</p>
          </div>
          <button
            onClick={handleAddPlan}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add New Plan
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-xl shadow-sm p-6 border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                  <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                    {plan.business_type || 'N/A'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditPlan(plan)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeletePlan(plan)}
                    className="text-red-600 hover:text-red-800 text-sm font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-4">{plan.description || 'No description'}</p>
              <div className="mb-4">
                <p className="text-2xl font-bold text-blue-600">
                  {plan.price ?? 0} {plan.currency || 'RWF'}
                </p>
                <p className="text-sm text-gray-500">
                  Duration: {plan.duration_days ?? 30} days
                </p>
                <p className="text-sm text-gray-500">
                  Max users: {plan.max_users === -1 ? 'Unlimited' : plan.max_users ?? 1}
                </p>
                <p className="text-sm text-gray-500">
                  Max branches: {plan.max_branches === -1 ? 'Unlimited' : plan.max_branches ?? 1}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                plan.is_active 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {plan.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingPlan ? 'Edit Plan' : 'Add New Plan'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
                <select
                  required
                  value={formData.business_type}
                  onChange={(e) => setFormData({ ...formData, business_type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Business Type</option>
                  {businessTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                  <input
                    type="text"
                    required
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (days)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={formData.duration_days}
                    onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 30 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Users (-1 for unlimited)</label>
                  <input
                    type="number"
                    required
                    min={-1}
                    value={formData.max_users}
                    onChange={(e) => setFormData({ ...formData, max_users: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Branches (-1 for unlimited)</label>
                <input
                  type="number"
                  required
                  min={-1}
                  value={formData.max_branches}
                  onChange={(e) => setFormData({ ...formData, max_branches: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
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

export default SuperAdminPlans;

