
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
  { path: '/superadmin/activity-logs', label: 'Activity Logs', icon: '📜' },
  { path: '/superadmin/reports', label: 'Reports', icon: '📈' },
];

const SuperAdminReports = () => {
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [loading, setLoading] = useState(true);
  const [subscriptionData, setSubscriptionData] = useState({
    totalRevenue: 0,
    activeSubscriptions: 0,
    newSubscriptions: 0,
    expiredSubscriptions: 0,
    revenueByPlan: [],
    subscriptionsByMonth: [],
    recentSubscriptions: []
  });
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    month: '',
    year: new Date().getFullYear().toString(),
    filterMode: 'month'
  });

  useEffect(() => {
    fetchSubscriptionData();
  }, [filters]);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const params = { ...filters };

      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) {
          delete params[key];
        }
      });

      const response = await api.get('/reports/subscriptions', { params });
      setSubscriptionData(response.data.data || {
        totalRevenue: 0,
        activeSubscriptions: 0,
        newSubscriptions: 0,
        expiredSubscriptions: 0,
        revenueByPlan: [],
        subscriptionsByMonth: [],
        recentSubscriptions: []
      });
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
      toast.error('Failed to load subscription reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      month: '',
      filterMode: 'range'
    }));
  };

  const handleMonthYearFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      start_date: '',
      end_date: '',
      filterMode: 'month'
    }));
  };

  const handleFilterModeChange = (mode) => {
    setFilters(prev => ({
      ...prev,
      filterMode: mode,
      month: mode === 'range' ? '' : prev.month,
      start_date: mode === 'month' ? '' : prev.start_date,
      end_date: mode === 'month' ? '' : prev.end_date
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  const handleDownloadPDF = async () => {
    try {
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (!params[key]) {
          delete params[key];
        }
      });

      const response = await api.get('/reports/subscriptions/pdf', {
        params,
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `subscription-report-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF report downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF report');
    }
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Subscription Reports</h1>
        <p className="text-gray-600">View subscription revenue and management analytics</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Date Filters</h3>
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF Report
          </button>
        </div>

        {/* Filter Type Tabs */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 pb-4">
          <button
            onClick={() => handleFilterModeChange('month')}
            className={`pb-2 px-4 border-b-2 font-medium text-sm transition-colors ${filters.filterMode === 'month'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Month/Year
          </button>
          <button
            onClick={() => handleFilterModeChange('range')}
            className={`pb-2 px-4 border-b-2 font-medium text-sm transition-colors ${filters.filterMode === 'range'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
          >
            Date Range
          </button>
        </div>

        {/* Filter Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {filters.filterMode === 'month' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => handleMonthYearFilterChange('month', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={filters.year}
                  onChange={(e) => handleMonthYearFilterChange('year', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => handleDateFilterChange('start_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => handleDateFilterChange('end_date', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setFilters({
                start_date: '',
                end_date: '',
                month: '',
                year: new Date().getFullYear().toString(),
                filterMode: 'month'
              });
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-green-600">{formatCurrency(subscriptionData.totalRevenue)}</div>
              <div className="text-gray-600">Total Revenue</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{subscriptionData.activeSubscriptions}</div>
              <div className="text-gray-600">Active Subscriptions</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">{subscriptionData.newSubscriptions}</div>
              <div className="text-gray-600">New Subscriptions</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="text-3xl font-bold text-red-600">{subscriptionData.expiredSubscriptions}</div>
              <div className="text-gray-600">Expired Subscriptions</div>
            </div>
          </div>

          {/* Revenue by Plan */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Revenue by Subscription Plan</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subscriptions</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">% of Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscriptionData.revenueByPlan.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-gray-500">No data available</td>
                    </tr>
                  ) : (
                    subscriptionData.revenueByPlan.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{item.plan_name}</td>
                        <td className="px-6 py-4 text-gray-600">{item.count}</td>
                        <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(item.revenue)}</td>
                        <td className="px-6 py-4 text-gray-600">
                          {subscriptionData.totalRevenue > 0
                            ? ((item.revenue / subscriptionData.totalRevenue) * 100).toFixed(1) + '%'
                            : '0%'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Subscriptions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Subscriptions</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscriptionData.recentSubscriptions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No recent subscriptions</td>
                    </tr>
                  ) : (
                    subscriptionData.recentSubscriptions.map((sub, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-800">{sub.company_name}</td>
                        <td className="px-6 py-4 text-gray-600">{sub.plan_name}</td>
                        <td className="px-6 py-4 text-green-600 font-medium">{formatCurrency(sub.amount)}</td>
                        <td className="px-6 py-4 text-gray-600">{formatDate(sub.start_date)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${sub.status === 'active' ? 'bg-green-100 text-green-800' :
                              sub.status === 'expired' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <ToastContainer />
    </DashboardLayout>
  );
};

export default SuperAdminReports;
