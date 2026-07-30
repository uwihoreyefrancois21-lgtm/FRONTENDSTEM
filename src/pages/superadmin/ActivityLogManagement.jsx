
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

const ActivityLogManagement = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [filters, setFilters] = useState({
    start_date: '',
    end_date: '',
    month: '',
    year: new Date().getFullYear().toString(),
    filterMode: 'month' // 'month' or 'range'
  });

  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.limit, filters]);

  const fetchData = async () => {
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      };
      
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) {
          delete params[key];
        }
      });
      
      const logsRes = await api.get('/activity-logs', { params });
      console.log('API Response:', logsRes);
      console.log('logsRes.data:', logsRes?.data);
      const logsData = logsRes?.data?.data?.data || [];
      const paginationData = logsRes?.data?.data?.pagination || { page: 1, limit: 7, total: 0, totalPages: 1 };
      setLogs(logsData);
      setPagination(prev => ({ ...prev, ...paginationData }));
      setSelectedLogs([]);
    } catch (error) {
      toast.error('Failed to Load activity logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (key, value) => {
    // If setting start/end date, clear month and set mode to range
    setFilters(prev => ({
      ...prev,
      [key]: value,
      month: '',
      filterMode: 'range'
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleMonthYearFilterChange = (key, value) => {
    // If setting month/year, clear start/end date and set mode to month
    setFilters(prev => ({
      ...prev,
      [key]: value,
      start_date: '',
      end_date: '',
      filterMode: 'month'
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleFilterModeChange = (mode) => {
    setFilters(prev => ({
      ...prev,
      filterMode: mode,
      month: mode === 'range' ? '' : prev.month,
      start_date: mode === 'month' ? '' : prev.start_date,
      end_date: mode === 'month' ? '' : prev.end_date
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    // Add 2 hours to convert UTC to Rwanda time (UTC+2)
    const rwandaTime = new Date(date.getTime() + (2 * 3600000));

    return rwandaTime.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const toggleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedLogs(logs.map(log => log.id));
    } else {
      setSelectedLogs([]);
    }
  };

  const toggleSelectLog = (logId) => {
    if (selectedLogs.includes(logId)) {
      setSelectedLogs(selectedLogs.filter(id => id !== logId));
    } else {
      setSelectedLogs([...selectedLogs, logId]);
    }
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedLogs.length} selected log(s)?`)) {
      return;
    }

    try {
      await api.delete('/activity-logs', {
        data: { ids: selectedLogs }
      });
      toast.success(`${selectedLogs.length} log(s) deleted successfully!`);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete logs');
    }
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Activity Logs</h1>
        <p className="text-gray-600">View and manage all system activity logs</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          {/* Selected logs bar */}
          {selectedLogs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="text-blue-800 font-medium">
                {selectedLogs.length} log(s) selected
              </div>
              <button
                onClick={handleDeleteSelected}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
              >
                Delete Selected
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>
            
            {/* Filter Type Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-200 pb-4">
              <button
                onClick={() => handleFilterModeChange('month')}
                className={`pb-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  filters.filterMode === 'month'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Month/Year
              </button>
              <button
                onClick={() => handleFilterModeChange('range')}
                className={`pb-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  filters.filterMode === 'range'
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
                    year: new Date().getFullYear().toString()
                  });
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      <input
                        type="checkbox"
                        checked={logs.length > 0 && selectedLogs.length === logs.length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Table</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Record</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="px-6 py-8 text-center text-gray-500">
                        No activity logs found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    logs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedLogs.includes(log.id)}
                            onChange={() => toggleSelectLog(log.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">{log.id}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            log.action === 'create' ? 'bg-green-100 text-green-800' :
                            log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                            log.action === 'delete' ? 'bg-red-100 text-red-800' :
                            log.action === 'login' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {log.first_name && log.last_name ? (
                            <div>
                              <div className="font-medium text-gray-800">
                                {log.first_name} {log.last_name}
                              </div>
                              <div className="text-sm text-gray-500">{log.email}</div>
                            </div>
                          ) : (
                            <span className="text-gray-500">System</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {log.company_name ? (
                            <span className="font-medium">{log.company_name}</span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">{log.table_name}</td>
                        <td className="px-6 py-4">
                          {log.record_name ? (
                            <div>
                              <span className="font-medium">{log.record_name}</span>
                              <span className="text-gray-500 text-sm ml-2">(ID: {log.record_id})</span>
                            </div>
                          ) : (
                            log.record_id || '-'
                          )}
                        </td>
                        <td className="px-6 py-4">{log.description}</td>
                        <td className="px-6 py-4">{formatDate(log.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-8 flex-wrap gap-4">
            <div className="text-gray-600">
              Showing {Math.min((pagination.page - 1) * pagination.limit + 1, pagination?.total || 0)} - {Math.min(pagination.page * pagination.limit, pagination?.total || 0)} of {pagination?.total || 0} logs
            </div>
            <div className="flex gap-2 items-center">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, pagination?.totalPages || 1) }, (_, i) => {
                  // Show current page and surrounding pages
                  let pageNum;
                  const totalPages = pagination?.totalPages || 1;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = pagination.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        pagination.page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                disabled={pagination.page >= (pagination?.totalPages || 1)}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      <ToastContainer />
    </DashboardLayout>
  );
};

export default ActivityLogManagement;
