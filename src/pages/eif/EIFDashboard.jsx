import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
    eifGetAccount,
    eifGetExpenses,
    eifGetOperations,
    eifGetPayments,
    eifGetStock
} from '../../services/eifService';

const EIFDashboard = () => {
  const [account, setAccount] = useState(null);
  const [stats, setStats] = useState({
    totalOperations: 0,
    totalStockItems: 0,
    totalPayments: 0,
    totalExpenses: 0,
    pendingOperations: 0,
    lowStockItems: 0
  });
  const [recentOperations, setRecentOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch account info
      const accountRes = await eifGetAccount();
      if (accountRes.success) {
        setAccount(accountRes.data);
      }

      // Fetch operations
      const operationsRes = await eifGetOperations();
      if (operationsRes.success) {
        const ops = operationsRes.data || [];
        setStats(prev => ({
          ...prev,
          totalOperations: ops.length,
          pendingOperations: ops.filter(o => o.status === 'PENDING').length
        }));
        setRecentOperations(ops.slice(0, 5));
      }

      // Fetch stock
      const stockRes = await eifGetStock();
      if (stockRes.success) {
        const stock = stockRes.data || [];
        setStats(prev => ({
          ...prev,
          totalStockItems: stock.length,
          lowStockItems: stock.filter(s => parseFloat(s.quantity) < 10).length
        }));
      }

      // Fetch payments
      const paymentsRes = await eifGetPayments();
      if (paymentsRes.success) {
        const payments = paymentsRes.data || [];
        setStats(prev => ({
          ...prev,
          totalPayments: payments.length
        }));
      }

      // Fetch expenses
      const expensesRes = await eifGetExpenses();
      if (expensesRes.success) {
        const expenses = expensesRes.data || [];
        setStats(prev => ({
          ...prev,
          totalExpenses: expenses.length
        }));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="w-full">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Welcome back, {account?.owner_name}! Overview of your Export-Import & Finance operations
          </p>
          {account && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {account.company_name} • Subscription: {account.subscription_status}
            </p>
          )}
        </div>
        <Link 
          to="/eif/profile-settings" 
          className="w-full sm:w-auto px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 text-center"
        >
          Profile Settings
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Total Operations</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.totalOperations}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.pendingOperations} pending</p>
            </div>
            <div className="bg-blue-100 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
              <span className="text-2xl sm:text-3xl">🚢</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Stock Items</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.totalStockItems}</p>
              {stats.lowStockItems > 0 && (
                <p className="text-xs text-red-500 mt-1">{stats.lowStockItems} low stock</p>
              )}
            </div>
            <div className="bg-green-100 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
              <span className="text-2xl sm:text-3xl">📦</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Payments</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.totalPayments}</p>
            </div>
            <div className="bg-purple-100 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
              <span className="text-2xl sm:text-3xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm text-gray-600">Expenses</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">{stats.totalExpenses}</p>
            </div>
            <div className="bg-red-100 p-2 sm:p-3 rounded-full flex-shrink-0 ml-2">
              <span className="text-2xl sm:text-3xl">💸</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-8">
        <Link
          to="/eif/products"
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-3xl sm:text-4xl mb-2">📦</div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Products</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Manage products</p>
        </Link>

        <Link
          to="/eif/partners"
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-3xl sm:text-4xl mb-2">🤝</div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Partners</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Suppliers & Customers</p>
        </Link>

        <Link
          to="/eif/operations"
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-3xl sm:text-4xl mb-2">🚢</div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Operations</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">Import & Export</p>
        </Link>

        <Link
          to="/eif/stock"
          className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow text-center"
        >
          <div className="text-3xl sm:text-4xl mb-2">📊</div>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">Stock</h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 hidden sm:block">View inventory</p>
        </Link>
      </div>

      {/* Recent Operations */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Operations</h2>
          <Link
            to="/eif/operations"
            className="text-purple-600 hover:text-purple-700 text-xs sm:text-sm font-medium"
          >
            View All →
          </Link>
        </div>
        {recentOperations.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No operations yet</p>
        ) : (
          <div className="overflow-x-auto -mx-4 sm:-mx-6 sm:mx-0">
            <table className="w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  <th className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="hidden md:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                  <th className="hidden lg:table-cell px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOperations.map((op) => (
                  <tr key={op.id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm text-gray-900 truncate">{op.reference || 'N/A'}</td>
                    <td className="hidden sm:table-cell px-4 py-3 text-xs sm:text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        op.type === 'IMPORT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {op.type}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-4 py-3 text-xs sm:text-sm text-gray-900">{op.partner_name || 'N/A'}</td>
                    <td className="hidden lg:table-cell px-4 py-3 text-xs sm:text-sm text-gray-900">{op.operation_date || 'N/A'}</td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-gray-900">
                      RWF{parseFloat(op.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="px-3 sm:px-4 py-3 text-xs sm:text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
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
        )}
      </div>

      {/* About Section */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">About Export-Import & Finance System</h2>
        <div className="prose max-w-none">
          <p className="text-xs sm:text-sm text-gray-600 mb-4">
            The Export-Import & Finance System is a comprehensive solution designed to help businesses manage their import and export operations, track inventory, handle payments, and monitor expenses efficiently.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Key Features</h3>
              <ul className="list-disc list-inside space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li>Import and Export Operations Management</li>
                <li>Product and Category Management</li>
                <li>Partner Management (Suppliers & Customers)</li>
                <li>Real-time Stock Inventory Tracking</li>
                <li>Payment and Expense Tracking</li>
                <li>Comprehensive Reporting System</li>
                <li>Monthly, Yearly, and Date Range Reports</li>
                <li>PDF Report Generation</li>
              </ul>
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">System Information</h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <p><strong>Subscription Plan:</strong> {account?.subscription_plan || 'PRO'}</p>
                <p><strong>Subscription Status:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded text-xs ${
                    account?.subscription_status === 'ACTIVE' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {account?.subscription_status || 'N/A'}
                  </span>
                </p>
                {account?.subscription_end && (
                  <p><strong>Subscription End:</strong> {new Date(account.subscription_end).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                )}
                <p><strong>Account Role:</strong> {account?.role || 'staff'}</p>
                {account?.company_name && (
                  <p><strong>Company:</strong> {account.company_name}</p>
                )}
                {account?.country && (
                  <p><strong>Country:</strong> {account.country}</p>
                )}
              </div>
            </div>
          </div>
          <div className="mt-6 p-3 sm:p-4 bg-purple-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-700">
              <strong>Need Help?</strong> Contact your system administrator for assistance with account management, subscription renewal, or any technical issues.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EIFDashboard;

