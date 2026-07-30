
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
    businessItems = [
      { path: '/services', label: 'Manage Services', icon: '💼', resource: 'services' },
      { path: '/services/suppliers-customers', label: 'Suppliers & Customers', icon: '👥', resource: 'customers' }
    ];
  } else if (businessType === 'products') {
    businessItems = [
      { path: '/products', label: 'Manage Products', icon: '🛒', resource: 'products' },
      { path: '/products/suppliers-customers', label: 'Suppliers & Customers', icon: '👥', resource: 'suppliers' }
    ];
  } else if (businessType === 'projects') {
    businessItems = [
      { path: '/projects', label: 'Manage Projects', icon: '📊', resource: 'projects' }
    ];
  } else {
    businessItems = [
      { path: '/allinone', label: 'All-in-One', icon: '🚀', resource: 'dashboard' },
      { path: '/allinone/suppliers-customers', label: 'Suppliers & Customers', icon: '👥', resource: 'suppliers' }
    ];
  }
  
  return [...baseItems, ...businessItems].filter(item => hasPermission(item.resource, 'read'));
};

const SupplierCustomerManagement = () => {
  const [activeTab, setActiveTab] = useState('suppliers');
  const [suppliers, setSuppliers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, hasPermission } = useAuth();
  
  const menuItems = getMenuItems(user?.company?.business_type, hasPermission);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [suppliersRes, customersRes] = await Promise.all([
        api.get('/suppliers'),
        api.get('/customers'),
      ]);
      const companySuppliers = suppliersRes.data.data.filter(s => s.company_id === user?.company_id);
      const companyCustomers = customersRes.data.data.filter(c => c.company_id === user?.company_id);
      setSuppliers(companySuppliers);
      setCustomers(companyCustomers);
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
        company_id: user?.company_id,
      };

      const endpoint = activeTab === 'suppliers' ? '/suppliers' : '/customers';
      if (editingItem) {
        await api.put(`${endpoint}/${editingItem.id}`, payload);
        toast.success(`${activeTab.slice(0, -1)} updated successfully!`);
      } else {
        await api.post(endpoint, payload);
        toast.success(`${activeTab.slice(0, -1)} created successfully!`);
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        const endpoint = activeTab === 'suppliers' ? '/suppliers' : '/customers';
        await api.delete(`${endpoint}/${id}`);
        toast.success('Deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name || '',
      email: item.email || '',
      phone: item.phone || '',
      address: item.address || '',
      tax_id: item.tax_id || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      tax_id: '',
    });
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Suppliers & Customers</h1>
        <p className="text-gray-600">Manage your suppliers and customers</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'suppliers'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Suppliers
        </button>
        <button
          onClick={() => setActiveTab('customers')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'customers'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Customers
        </button>
      </div>

      {activeTab === 'suppliers' && (
        <>
          {hasPermission('suppliers', 'create') && (
            <div className="mb-6 text-right">
              <button
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                + Add New Supplier
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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tax ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {suppliers.map(supplier => (
                      <tr key={supplier.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{supplier.name}</td>
                        <td className="px-6 py-4">{supplier.email || '-'}</td>
                        <td className="px-6 py-4">{supplier.phone || '-'}</td>
                        <td className="px-6 py-4">{supplier.tax_id || '-'}</td>
                        <td className="px-6 py-4">
                          {hasPermission('suppliers', 'update') && (
                            <button onClick={() => handleEdit(supplier)} className="text-blue-600 hover:text-blue-800 mr-3">
                              Edit
                            </button>
                          )}
                          {hasPermission('suppliers', 'delete') && (
                            <button onClick={() => handleDelete(supplier.id)} className="text-red-600 hover:text-red-800">
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
        </>
      )}

      {activeTab === 'customers' && (
        <>
          {hasPermission('customers', 'create') && (
            <div className="mb-6 text-right">
              <button
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                + Add New Customer
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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tax ID</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {customers.map(customer => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{customer.name}</td>
                        <td className="px-6 py-4">{customer.email || '-'}</td>
                        <td className="px-6 py-4">{customer.phone || '-'}</td>
                        <td className="px-6 py-4">{customer.tax_id || '-'}</td>
                        <td className="px-6 py-4">
                          {hasPermission('customers', 'update') && (
                            <button onClick={() => handleEdit(customer)} className="text-blue-600 hover:text-blue-800 mr-3">
                              Edit
                            </button>
                          )}
                          {hasPermission('customers', 'delete') && (
                            <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-800">
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
        </>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Create New ${activeTab.slice(0, -1)}`}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax ID</label>
                  <input
                    type="text"
                    value={formData.tax_id}
                    onChange={e => setFormData({ ...formData, tax_id: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
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
                  {editingItem ? 'Update' : 'Create'}
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

export default SupplierCustomerManagement;
