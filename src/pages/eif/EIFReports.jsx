import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { eifDownloadReport, eifGetCategories, eifGetProducts, eifGetReports } from '../../services/eifService';

const EIFReports = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reportType, setReportType] = useState('monthly');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [filters, setFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    start_date: '',
    end_date: '',
    product_id: '',
    category_id: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await eifGetProducts();
      if (res.success) setProducts(res.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await eifGetCategories();
      if (res.success) setCategories(res.data || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const generateReport = async () => {
    // Validate required fields
    if (reportType === 'monthly' && (!filters.month || !filters.year)) {
      toast.error('Please select both month and year for monthly report');
      return;
    }
    if (reportType === 'year' && !filters.year) {
      toast.error('Please select a year for yearly report');
      return;
    }
    if (reportType === 'range' && (!filters.start_date || !filters.end_date)) {
      toast.error('Please select both start and end dates for date range report');
      return;
    }

    setLoading(true);
    try {
      const params = {
        type: reportType,
        ...(reportType === 'monthly' && { month: filters.month, year: filters.year }),
        ...(reportType === 'year' && { year: filters.year }),
        ...(reportType === 'range' && { start_date: filters.start_date, end_date: filters.end_date }),
        ...(filters.product_id && { product_id: filters.product_id }),
        ...(filters.category_id && { category_id: filters.category_id })
      };

      const response = await eifGetReports(params);
      if (response.success) {
        setReportData(response.data);
        setCurrentPage(1); // Reset to first page when new report is generated
        toast.success('Report generated successfully');
      } else {
        toast.error(response.message || 'Failed to generate report');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate report';
      toast.error(errorMessage);
      console.error('Report generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const params = {
        type: reportType,
        ...(reportType === 'monthly' && { month: filters.month, year: filters.year }),
        ...(reportType === 'year' && { year: filters.year }),
        ...(reportType === 'range' && { start_date: filters.start_date, end_date: filters.end_date }),
        ...(filters.product_id && { product_id: filters.product_id }),
        ...(filters.category_id && { category_id: filters.category_id })
      };

      const blob = await eifDownloadReport(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Export-Import & Finance Report.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Report downloaded successfully');
    } catch (error) {
      toast.error('Failed to download report');
      console.error(error);
    }
  };


  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and download comprehensive reports</p>
        </div>
      </div>

      {/* Report Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Report Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="monthly">Monthly Report</option>
              <option value="year">Yearly Report</option>
              <option value="range">Date Range Report</option>
            </select>
          </div>

          {reportType === 'monthly' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters({ ...filters, month: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{new Date(2000, m - 1).toLocaleString('default', { month: 'long' })}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <input
                  type="number"
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  min="2020"
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </>
          )}

          {reportType === 'year' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <input
                type="number"
                value={filters.year}
                onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                min="2020"
                max={new Date().getFullYear() + 1}
              />
            </div>
          )}

          {reportType === 'range' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Product</label>
            <select
              value={filters.product_id}
              onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Products</option>
              {products.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} {product.category_name ? `(${product.category_name})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
            <select
              value={filters.category_id}
              onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-4 mt-6">
          <button
            onClick={generateReport}
            disabled={loading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
          {reportData && (
            <button
              onClick={handleDownload}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Owner Name</p>
                <p className="text-lg font-semibold text-gray-900">{reportData.account?.owner_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="text-lg font-semibold text-gray-900">{reportData.account?.company_name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-semibold text-gray-900">{reportData.account?.email || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Operations</p>
                <p className="text-2xl font-bold text-blue-600">{reportData.summary?.total_operations || 0}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Imports</p>
                <p className="text-2xl font-bold text-green-600">RWF{parseFloat(reportData.summary?.total_import_amount || 0).toFixed(2)}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Total Exports</p>
                <p className="text-2xl font-bold text-purple-600">RWF{parseFloat(reportData.summary?.total_export_amount || 0).toFixed(2)}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Net Profit</p>
                <p
                  className={`text-2xl font-bold ${
                    parseFloat(reportData.summary?.net_profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  RWF{parseFloat(reportData.summary?.net_profit || 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Operations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Operations</h2>
            {reportData.operations && reportData.operations.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(() => {
                        const totalPages = Math.ceil(reportData.operations.length / itemsPerPage);
                        const startIndex = (currentPage - 1) * itemsPerPage;
                        const endIndex = startIndex + itemsPerPage;
                        const currentOperations = reportData.operations.slice(startIndex, endIndex);
                        
                        return currentOperations.map(op => (
                          <tr key={op.id}>
                            <td className="px-6 py-4 text-sm text-gray-900">{op.reference || `#${op.id}`}</td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  op.type === 'IMPORT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {op.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{op.owner_name || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{op.partner_name || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm text-gray-900">{op.operation_date}</td>
                            <td className="px-6 py-4 text-sm font-medium">RWF{parseFloat(op.total_amount || 0).toFixed(2)}</td>
                            <td className="px-6 py-4 text-sm">
                              <span
                                className={`px-2 py-1 rounded text-xs ${
                                  op.status === 'COMPLETED'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                {op.status}
                              </span>
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination Controls */}
                {(() => {
                  const totalPages = Math.ceil((reportData.operations?.length || 0) / itemsPerPage);
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const endIndex = Math.min(startIndex + itemsPerPage, reportData.operations?.length || 0);
                  
                  if (totalPages <= 1) return null;
                  
                  return (
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="text-sm text-gray-700">
                        Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                        <span className="font-medium">{endIndex}</span> of{' '}
                        <span className="font-medium">{reportData.operations?.length || 0}</span> operations
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md RWF{
                                currentPage === page
                                  ? 'bg-purple-600 text-white'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              <p className="text-gray-500 text-center py-8">No operations found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EIFReports;

