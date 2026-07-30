import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import DashboardLayout from './DashboardLayout';

const Reports = ({ menuItems, isAllInOne = false }) => {
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState('');
  const [filterType, setFilterType] = useState('none'); // none, dateRange, monthYear
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [fetchingReports, setFetchingReports] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedBusinessType, setSelectedBusinessType] = useState(''); // 'services', 'projects', 'products'
  const { user } = useAuth();

  useEffect(() => {
    fetchReports();
    fetchCompaniesAndBranches();
  }, []);

  const fetchCompaniesAndBranches = async () => {
    try {
      const [companiesRes, branchesRes] = await Promise.all([
        api.get('/companies'),
        api.get('/branches')
      ]);
      
      const companiesData = companiesRes.data.data || [];
      const branchesData = branchesRes.data.data || [];
      
      // Filter by user's company if not super admin
      if (!user?.is_super_admin) {
        const userCompanyId = Number(user?.company_id);
        const filteredCompanies = companiesData.filter(c => Number(c.id) === userCompanyId);
        const filteredBranches = branchesData.filter(b => Number(b.company_id) === userCompanyId);
        
        setCompanies(filteredCompanies);
        setBranches(filteredBranches);
        
        // Pre-select user's company and branch
        if (filteredCompanies.length > 0) {
          setSelectedCompany(String(filteredCompanies[0].id));
        }
      } else {
        setCompanies(companiesData);
        setBranches(branchesData);
      }
    } catch (error) {
      console.error('Error fetching companies/branches:', error);
    }
  };

  const fetchReports = async () => {
    setFetchingReports(true);
    try {
      console.log('Fetching reports from /api/v1/reports');
      const response = await api.get('/reports');
      console.log('Full API response:', response);
      console.log('API response data:', response.data);
      
      // Ensure we always get an array
      let reportsData = [];
      if (response.data && Array.isArray(response.data)) {
        reportsData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        reportsData = response.data.data;
      } else {
        console.warn('API response did not contain an array of reports:', response.data);
      }
      
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports. Error: ' + (error.response?.data?.message || error.message));
      // Fallback to default reports
      setReports([
        { id: 'products', title: 'Products List', icon: '🛍️', category: 'Products' },
        { id: 'sales', title: 'Sales Transactions', icon: '💰', category: 'Sales' },
        { id: 'purchases', title: 'Purchase Orders', icon: '📊', category: 'Purchases' },
        { id: 'projects', title: 'Projects List', icon: '🏗️', category: 'Projects' },
        { id: 'services', title: 'Services List', icon: '💼', category: 'Services' },
      ]);
    } finally {
      setFetchingReports(false);
    }
  };

  const generateReport = async () => {
    if (!selectedReport) {
      toast.error('Please select a report type');
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterType === 'dateRange') {
        if (!startDate || !endDate) {
          toast.error('Please select both start and end dates');
          setLoading(false);
          return;
        }
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      } else if (filterType === 'monthYear') {
        if (!month) {
          toast.error('Please select a month');
          setLoading(false);
          return;
        }
        params.append('month', month);
        params.append('year', year);
      }
      if (selectedCompany) {
        params.append('companyId', selectedCompany);
      }
      if (selectedBranch) {
        params.append('branchId', selectedBranch);
      }
      
      console.log('Generating report:', selectedReport, 'with params:', params.toString());
      const response = await api.get(`/reports/${selectedReport}/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${selectedReport}-report.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' },
  ];

  const years = [];
  for (let y = 2020; y <= new Date().getFullYear() + 1; y++) {
    years.push(y);
  }

  // Filter reports by business type (company's type or selected in all-in-one)
  const filteredReportsByBusiness = (Array.isArray(reports) ? reports : []).filter(report => {
    // Map report categories to business types
    const businessTypeToCategories = {
      services: ['Services', 'Sales', 'Customers', 'Suppliers', 'HR', 'Financial Statements'],
      projects: ['Projects', 'HR', 'Financial Statements'],
      products: ['Products', 'Sales', 'Purchases', 'Inventory', 'Customers', 'Suppliers', 'HR', 'Financial Statements'],
      allinone: ['Services', 'Sales', 'Products', 'Purchases', 'Inventory', 'Customers', 'Suppliers', 'Projects', 'HR', 'Financial Statements']
    };
    
    // Determine which business type to use for filtering
    let businessType;
    if (isAllInOne) {
      businessType = selectedBusinessType || 'allinone';
    } else {
      businessType = user?.company?.business_type || 'allinone';
      // Handle case where business_type is "all" (all-in-one)
      if (businessType === 'all') {
        businessType = 'allinone';
      }
    }
    
    const categories = businessTypeToCategories[businessType] || businessTypeToCategories.allinone;
    console.log('Reports filtering:', { 
      userCompanyBusinessType: user?.company?.business_type, 
      businessType, 
      categories, 
      reportCategory: report.category 
    });
    
    return categories.includes(report.category);
  });

  // Group reports by category with safety check
  const groupedReports = filteredReportsByBusiness.reduce((acc, report) => {
    const category = report.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(report);
    return acc;
  }, {});

  // Filter branches by selected company
  const filteredBranches = selectedCompany 
    ? branches.filter(b => Number(b.company_id) === Number(selectedCompany))
    : branches;

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-600">Generate and download reports with customizable filters</p>
        </div>

        {/* Filter Form */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Filter Options</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {isAllInOne && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Type</label>
                <select
                  value={selectedBusinessType}
                  onChange={(e) => {
                    setSelectedBusinessType(e.target.value);
                    setSelectedReport('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Business Types</option>
                  <option value="services">Services</option>
                  <option value="projects">Projects</option>
                  <option value="products">Products</option>
                </select>
              </div>
            )}
            {user?.is_super_admin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <select
                  value={selectedCompany}
                  onChange={(e) => {
                    setSelectedCompany(e.target.value);
                    setSelectedBranch('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select a company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">All Branches</option>
                {filteredBranches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
              <select
                value={selectedReport}
                onChange={(e) => setSelectedReport(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Select a report</option>
                {filteredReportsByBusiness.map((report) => (
                  <option key={report.id} value={report.id}>
                    {report.icon} {report.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter By</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="none">No Filter (All Data)</option>
                <option value="dateRange">Date Range</option>
                <option value="monthYear">Month & Year</option>
              </select>
            </div>

            {filterType === 'dateRange' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </>
            )}

            {filterType === 'monthYear' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">Select month</option>
                    {months.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Generating Report...' : 'Generate Report'}
            </button>
          </div>
        </div>

        {/* Available Reports Grid (Grouped by Category) */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Available Reports</h2>
          {fetchingReports ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-gray-600">Loading reports...</p>
            </div>
          ) : (
            Object.keys(groupedReports).map((category) => (
              <div key={category} className="mb-8">
                <h3 className="text-lg font-semibold text-blue-700 mb-3 border-b pb-2">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {groupedReports[category].map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReport(report.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedReport === report.id 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-3xl mb-2">{report.icon}</div>
                      <h4 className="font-semibold text-gray-800 text-sm">{report.title}</h4>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
