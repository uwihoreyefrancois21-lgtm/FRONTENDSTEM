import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import {
  eifAdminDeleteAccount,
  eifAdminGetAccount,
  eifAdminGetAccountOperations,
  eifAdminGetAccounts,
  eifAdminGetAccountStock,
  eifAdminGetDashboard,
  eifAdminUpdateAccount,
  eifDownloadReport
} from '../../services/eifService';

const EIFAdminDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [view, setView] = useState('dashboard'); // dashboard, accounts, account-detail
  const [filters, setFilters] = useState({
    status: '',
    search: '',
    page: 1
  });
  const [accountOperations, setAccountOperations] = useState([]);
  const [accountStock, setAccountStock] = useState([]);
  const [operationFilters, setOperationFilters] = useState({
    type: '',
    status: '',
    year: '',
    month: '',
    start_date: '',
    end_date: ''
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    if (user?.role !== 'admin') {
      toast.error('Admin access required');
      return;
    }
    if (view === 'dashboard') {
      fetchDashboard();
    } else if (view === 'accounts') {
      fetchAccounts();
    }
  }, [view, filters, user]);

  useEffect(() => {
    if (selectedAccount && view === 'account-detail') {
      fetchAccountDetails();
      fetchAccountOperations();
      fetchAccountStock();
    }
  }, [selectedAccount, view, operationFilters]);

  const fetchDashboard = async () => {
    try {
      const res = await eifAdminGetDashboard();
      if (res.success) {
        setDashboardStats(res.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await eifAdminGetAccounts(filters);
      if (res.success) {
        setAccounts(res.data.accounts || []);
      }
    } catch (error) {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountDetails = async () => {
    try {
      const res = await eifAdminGetAccount(selectedAccount);
      if (res.success) {
        setEditFormData(res.data);
      }
    } catch (error) {
      toast.error('Failed to load account details');
    }
  };

  const fetchAccountOperations = async () => {
    try {
      const params = { ...operationFilters };
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      const res = await eifAdminGetAccountOperations(selectedAccount, params);
      if (res.success) {
        setAccountOperations(res.data.operations || []);
      }
    } catch (error) {
      toast.error('Failed to load operations');
    }
  };

  const fetchAccountStock = async () => {
    try {
      const res = await eifAdminGetAccountStock(selectedAccount);
      if (res.success) {
        setAccountStock(res.data.stock || []);
      }
    } catch (error) {
      toast.error('Failed to load stock');
    }
  };



  const handleUpdateAccount = async () => {
    try {
      const res = await eifAdminUpdateAccount(selectedAccount, editFormData);
      if (res.success) {
        toast.success('Account updated successfully');
        setShowEditModal(false);
        fetchAccountDetails();
        fetchAccounts();
        setSelectedAccount(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update account');
    }
  };

  const handleDeleteAccount = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await eifAdminDeleteAccount(id);
      if (res.success) {
        toast.success('Account deleted successfully');
        fetchAccounts();
        if (selectedAccount === id) {
          setSelectedAccount(null);
          setView('accounts');
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleDownloadReport = async (reportType, year, month, startDate, endDate) => {
    try {
      const params = {
        type: reportType,
        account_id: selectedAccount
      };
      
      if (reportType === 'monthly' && year && month) {
        params.year = year;
        params.month = month;
      } else if (reportType === 'year' && year) {
        params.year = year;
      } else if (reportType === 'range' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }

      const blob = await eifDownloadReport(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eif-report-RWF{selectedAccount}-RWF{Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading && view === 'dashboard' && !dashboardStats) {
    return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">EIF Admin Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => { setView('dashboard'); setSelectedAccount(null); }}
            className={`px-4 py-2 rounded-lg RWF{view === 'dashboard' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setView('accounts'); setSelectedAccount(null); }}
            className={`px-4 py-2 rounded-lg RWF{view === 'accounts' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Manage Accounts
          </button>
        </div>
      </div>

      {view === 'dashboard' && dashboardStats && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Total Accounts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{dashboardStats.total_accounts}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Active Accounts</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{dashboardStats.active_accounts}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Expired Accounts</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{dashboardStats.expired_accounts}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm">Expiring Soon (7 days)</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{dashboardStats.expiring_soon}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Operations Statistics</h2>
            <p className="text-gray-600">Total Operations: <span className="font-bold">{dashboardStats.total_operations}</span></p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {dashboardStats.operations_by_type?.map(op => (
                <div key={op.type} className="p-4 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">{op.type}</p>
                  <p className="text-2xl font-bold">{op.count}</p>
                  <p className="text-sm text-gray-500">Total: RWF{parseFloat(op.total_amount || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === 'accounts' && (
        <div>
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Search accounts..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                className="px-3 py-2 border rounded-lg"
              />
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {accounts.map(account => (
                  <tr key={account.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">{account.owner_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{account.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{account.company_name}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2 py-1 rounded text-xs RWF{
                        account.subscription_status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {account.subscription_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {account.subscription_end 
                        ? new Date(account.subscription_end).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => { setSelectedAccount(account.id); setView('account-detail'); }}
                        className="text-purple-600 hover:text-purple-800 mr-2"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          eifAdminGetAccount(account.id).then(res => {
                            if (res.success) {
                              setEditFormData(res.data);
                              setSelectedAccount(account.id);
                              setShowEditModal(true);
                            }
                          });
                        }}
                        className="text-blue-600 hover:text-blue-800 mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteAccount(account.id)}
                        className="text-red-600 hover:text-red-800"
                      >
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

      {view === 'account-detail' && selectedAccount && (
        <div>
          <button
            onClick={() => { setView('accounts'); setSelectedAccount(null); }}
            className="mb-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            ← Back to Accounts
          </button>

          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Account Details</h2>
              <button
                onClick={() => setShowEditModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
              >
                Edit Account
              </button>
            </div>
            {editFormData && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Owner Name</p>
                    <p className="text-lg font-semibold text-gray-900">{editFormData.owner_name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{editFormData.email}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Company</p>
                    <p className="text-lg font-semibold text-gray-900">{editFormData.company_name}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold RWF{
                      editFormData.subscription_status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {editFormData.subscription_status}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Subscription End</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {editFormData.subscription_end 
                        ? new Date(editFormData.subscription_end).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Role</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold RWF{
                      editFormData.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {editFormData.role || 'staff'}
                    </span>
                  </div>
                  {editFormData.country && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Country</p>
                      <p className="text-lg font-semibold text-gray-900">{editFormData.country}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Operations Section */}
          <div className="bg-white rounded-lg shadow p-6 mb-4">
            <h3 className="text-xl font-bold mb-4">Operations</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <select
                value={operationFilters.type}
                onChange={(e) => setOperationFilters({ ...operationFilters, type: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="IMPORT">Import</option>
                <option value="EXPORT">Export</option>
              </select>
              <input
                type="number"
                placeholder="Year"
                value={operationFilters.year}
                onChange={(e) => setOperationFilters({ ...operationFilters, year: e.target.value })}
                className="px-3 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Month (1-12)"
                value={operationFilters.month}
                onChange={(e) => setOperationFilters({ ...operationFilters, month: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                min="1"
                max="12"
              />
              <button
                onClick={() => handleDownloadReport('monthly', operationFilters.year, operationFilters.month)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Download Monthly Report
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input
                type="date"
                value={operationFilters.start_date}
                onChange={(e) => setOperationFilters({ ...operationFilters, start_date: e.target.value })}
                className="px-3 py-2 border rounded-lg"
                placeholder="Start Date"
              />
              <div className="flex gap-2">
                <input
                  type="date"
                  value={operationFilters.end_date}
                  onChange={(e) => setOperationFilters({ ...operationFilters, end_date: e.target.value })}
                  className="px-3 py-2 border rounded-lg flex-1"
                  placeholder="End Date"
                />
                <button
                  onClick={() => handleDownloadReport('range', null, null, operationFilters.start_date, operationFilters.end_date)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Download Range Report
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accountOperations.map(op => (
                    <tr key={op.id}>
                      <td className="px-6 py-4 text-sm">{op.reference || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs RWF{
                          op.type === 'IMPORT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {op.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">{op.operation_date}</td>
                      <td className="px-6 py-4 text-sm">RWF{parseFloat(op.total_amount || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs RWF{
                          op.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {op.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stock Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-bold mb-4">Stock</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {accountStock.length > 0 ? (
                    accountStock.map(item => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 text-sm">{item.product_name}</td>
                        <td className="px-6 py-4 text-sm">{item.category_name || 'N/A'}</td>
                        <td className="px-6 py-4 text-sm">{parseFloat(item.quantity || 0).toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">{item.unit || 'N/A'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-sm text-center text-gray-500">No stock found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Edit Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Status</label>
                <select
                  value={editFormData.subscription_status || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, subscription_status: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="EXPIRED">EXPIRED</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription End Date</label>
                <input
                  type="date"
                  value={editFormData.subscription_end || ''}
                  onChange={(e) => setEditFormData({ ...editFormData, subscription_end: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editFormData.role || 'staff'}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateAccount}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EIFAdminDashboard;

