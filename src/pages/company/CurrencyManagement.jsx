
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

const CurrencyManagement = () => {
  const [currencies, setCurrencies] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, updateUser, companyCurrency, hasPermission } = useAuth();
  
  const menuItems = getMenuItems(user?.company?.business_type, hasPermission);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    symbol: '',
    is_default: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currenciesRes = await api.get('/currencies');
      setCurrencies(currenciesRes.data.data);
    } catch (error) {
      toast.error('Failed to load currencies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let currencyId;
      if (editingCurrency) {
        await api.put(`/currencies/${editingCurrency.id}`, formData);
        currencyId = editingCurrency.id;
        toast.success('Currency updated successfully!');
      } else {
        const response = await api.post('/currencies', formData);
        currencyId = response.data.data.id;
        toast.success('Currency created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
      
      if (formData.is_default && user) {
        const updatedCompany = { ...user.company, currency_id: currencyId };
        
        // Save to database
        await api.put(`/companies/${user.company.id}`, updatedCompany);
        
        const updatedUser = { ...user, company: updatedCompany };
        await updateUser(updatedUser);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this currency?')) {
      try {
        await api.delete(`/currencies/${id}`);
        toast.success('Currency deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete currency');
      }
    }
  };

  const handleSetDefault = async (currencyId) => {
    try {
      const updatedCompany = {
        ...user.company,
        currency_id: currencyId,
      };
      
      const payload = { ...updatedCompany };
      await api.put(`/companies/${user.company.id}`, payload);
      
      const updatedUser = { ...user, company: updatedCompany };
      updateUser(updatedUser);
      
      toast.success('Default currency set successfully!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to set default currency');
    }
  };

  const handleEdit = (currency) => {
    setEditingCurrency(currency);
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      is_default: currency.is_default,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingCurrency(null);
    setFormData({
      code: '',
      name: '',
      symbol: '',
      is_default: false,
    });
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Currency Management</h1>
        <p className="text-gray-600">Manage your company's currencies</p>
        {companyCurrency && (
          <p className="text-sm text-blue-600 mt-2">
            Default: {companyCurrency.symbol} {companyCurrency.code} - {companyCurrency.name}
          </p>
        )}
      </div>

      {hasPermission('currencies', 'create') && (
        <div className="mb-6">
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            + Add New Currency
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Symbol</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Default</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currencies.map(currency => (
                  <tr key={currency.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono">{currency.code}</td>
                    <td className="px-6 py-4">{currency.name}</td>
                    <td className="px-6 py-4 text-xl">{currency.symbol}</td>
                    <td className="px-6 py-4">
                      {user?.company?.currency_id === currency.id ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Default
                        </span>
                      ) : (
                        hasPermission('currencies', 'update') && (
                          <button 
                            onClick={() => handleSetDefault(currency.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Set as Default
                          </button>
                        )
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {hasPermission('currencies', 'update') && (
                        <button onClick={() => handleEdit(currency)} className="text-blue-600 hover:text-blue-800 mr-3">
                          Edit
                        </button>
                      )}
                      {hasPermission('currencies', 'delete') && (
                        <button onClick={() => handleDelete(currency.id)} className="text-red-600 hover:text-red-800">
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
              {editingCurrency ? 'Edit Currency' : 'Create New Currency'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency Code</label>
                <input
                  type="text"
                  required
                  placeholder="USD, EUR, RWF, etc."
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency Name</label>
                <input
                  type="text"
                  required
                  placeholder="US Dollar, Euro, Rwandan Franc, etc."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
                <input
                  type="text"
                  required
                  placeholder="$, €, Frw, etc."
                  value={formData.symbol}
                  onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={e => setFormData({ ...formData, is_default: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="is_default" className="text-sm font-medium text-gray-700">
                  Set as default currency for company
                </label>
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
                  {editingCurrency ? 'Update' : 'Create'}
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

export default CurrencyManagement;
