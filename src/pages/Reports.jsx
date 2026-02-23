import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { reportService } from '../services';

const Reports = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);
  const [filterType, setFilterType] = useState('month'); // 'month' or 'range'
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [downloadingProjectId, setDownloadingProjectId] = useState(null);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await reportService.getFinancialSummary();
      if (response.success) {
        setSummary(response.data.summary);
        const income = response.data.summary.reduce((sum, p) => sum + (p.total_income || 0), 0);
        const expense = response.data.summary.reduce((sum, p) => sum + (p.total_expense || 0), 0);
        setTotalIncome(income);
        setTotalExpense(expense);
        setTotalBalance(income - expense);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildPeriodParams = () => {
    const params = {};
    if (filterType === 'range') {
      if (startDate && startDate.trim()) {
        params.start_date = startDate.trim();
      }
      if (endDate && endDate.trim()) {
        params.end_date = endDate.trim();
      }
    } else if (filterType === 'month') {
      if (monthFilter && monthFilter.trim()) {
        params.month = parseInt(monthFilter.trim());
      }
      if (yearFilter && yearFilter.trim()) {
        params.year = parseInt(yearFilter.trim());
      }
    }
    // Remove empty values
    Object.keys(params).forEach(key => {
      if (params[key] === undefined || params[key] === null || params[key] === '') {
        delete params[key];
      }
    });
    return params;
  };

  const handleDownloadProjectReport = async (projectId) => {
    try {
      setDownloadingProjectId(projectId);
      const params = buildPeriodParams();
      
      // Show filter info
      const filterInfo = Object.keys(params).length > 0 
        ? ` with ${filterType === 'month' ? `Month: ${monthFilter || 'All'}, Year: ${yearFilter}` : `Date Range: ${startDate || 'Start'} to ${endDate || 'End'}`}`
        : ' (all time)';
      toast.info(`Downloading report${filterInfo}...`);
      
      const response = await reportService.downloadProjectReport(projectId, params);

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `project_${projectId}_financial_report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Failed to download report:', error);
      toast.error('Failed to download report');
    } finally {
      setDownloadingProjectId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-600 mt-2">
          Summary of all projects. Use the filters to generate and download detailed financial reports
          (tasks, transactions, income and expenses) for a specific period.
        </p>
      </div>

      {/* Summary Cards */}
    {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <p className="text-sm opacity-90">Total Income</p>
          <p className="text-3xl font-bold mt-2">
            $ {totalIncome.toLocaleString('en-US')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
          <p className="text-sm opacity-90">Total Expense</p>
          <p className="text-3xl font-bold mt-2">
            $ {totalExpense.toLocaleString('en-US')}
          </p>
        </div>

        <div className={`bg-gradient-to-br rounded-lg shadow-md p-6 text-white ${
          totalBalance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'
        }`}>
          <p className="text-sm opacity-90">Net Balance</p>
          <p className="text-3xl font-bold mt-2">
            $ {totalBalance.toLocaleString('en-US')}
          </p>
        </div>
      </div>
*/}
      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-600">
        <div className="px-6 py-4 border-b-2 border-yellow-400 bg-gradient-to-r from-blue-50 to-yellow-50">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Financial Summary by Project</h2>
              <p className="text-xs text-gray-600 mt-1">
                Select filters below to download reports for specific date ranges or months
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilterType(value);
                    if (value === 'month') {
                      setStartDate('');
                      setEndDate('');
                    } else {
                      setMonthFilter('');
                      setYearFilter(new Date().getFullYear().toString());
                    }
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="month">Month/Year</option>
                  <option value="range">Date Range</option>
                </select>
              </div>
              {filterType === 'month' ? (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Month:</label>
                    <select
                      value={monthFilter}
                      onChange={(e) => setMonthFilter(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    >
                      <option value="">All Months</option>
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
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Year:</label>
                    <input
                      type="number"
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      min="2000"
                      max="2100"
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm w-24"
                      placeholder="Year"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Start Date:</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">End Date:</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || undefined}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                </>
              )}
              <button
                onClick={() => {
                  setFilterType('month');
                  setMonthFilter('');
                  setYearFilter(new Date().getFullYear().toString());
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
        {/* Overall financial summary for all projects */}
        <div className="px-6 py-3 bg-blue-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <span className="text-gray-700">All Projects Summary:</span>
            <span className="text-green-600">
              Total Income: $ {totalIncome.toLocaleString('en-US')}
            </span>
            <span className="text-red-600">
              Total Expense: $ {totalExpense.toLocaleString('en-US')}
            </span>
            <span className={totalBalance >= 0 ? 'text-green-700' : 'text-red-700'}>
              Balance: $ {totalBalance.toLocaleString('en-US')}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned User</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Income</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Expense</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summary.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.project_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      <div className="font-medium">{project.username || 'N/A'}</div>
                      {project.email && (
                        <div className="text-xs text-gray-500">{project.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-semibold">
                    $ {project.total_income?.toLocaleString('en-US') || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 font-semibold">
                    $ {project.total_expense?.toLocaleString('en-US') || '0'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
                    (project.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    $ {project.balance?.toLocaleString('en-US') || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (project.balance || 0) >= 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(project.balance || 0) >= 0 ? 'Profit' : 'Loss'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                    <div className="flex items-center justify-center gap-3">
                      <Link
                        to={`/projects/${project.id}`}
                        className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        View Project
                      </Link>
                      <button
                        onClick={() => handleDownloadProjectReport(project.id)}
                        disabled={downloadingProjectId === project.id}
                        className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {downloadingProjectId === project.id ? 'Downloading...' : 'Download Report'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

