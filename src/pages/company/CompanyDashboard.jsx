
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = (businessType, hasPermission, hasModuleAccess) => {
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
    businessItems = [
      { path: '/projects', label: 'Manage Projects', icon: '📊', resource: 'projects' },
      { path: '/projects/tasks', label: 'Project Tasks', icon: '✅', resource: 'project_tasks' },
      { path: '/projects/workers', label: 'Project Workers', icon: '👷', resource: 'project_workers' },
      { path: '/projects/materials', label: 'Project Materials', icon: '🛠️', resource: 'project_materials' },
      { path: '/projects/expenses', label: 'Project Expenses', icon: '💰', resource: 'expenses' },
      { path: '/projects/reports', label: 'Reports', icon: '📈', resource: 'reports' },
      { path: '/projects/ai', label: 'AI Assistant', icon: '🤖', resource: 'ai_conversations' },
    ];
  } else {
    businessItems = [{ path: '/allinone', label: 'All-in-One', icon: '🚀', resource: 'dashboard' }];
  }
  
  // Filter menu items: first check module access, then permission
  const filteredItems = [...baseItems, ...businessItems].filter(item => 
    hasModuleAccess(item.resource) && hasPermission(item.resource, 'read')
  );
  // Add My Profile to the end (always accessible)
  return [...filteredItems, { path: '/profile', label: 'My Profile', icon: '👤' }];
};

const businessTypes = [
  { id: 'services', name: 'Services', desc: 'Offer and manage services for your clients', icon: '💼' },
  { id: 'projects', name: 'Projects', desc: 'Manage projects, tasks, and project resources', icon: '📊' },
  { id: 'products', name: 'Products / POS', desc: 'Manage inventory, sales, and point of sale', icon: '🛒' },
  { id: 'all', name: 'All-in-One', desc: 'Access all features - services, projects, and products', icon: '🚀' },
];

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    users: 0,
    employees: 0,
    branches: 0,
    products: 0,
    revenue: 0,
    expenses: 0,
    profit: 0
  });
  const [branchStats, setBranchStats] = useState([]);
  const [showAllBranches, setShowAllBranches] = useState(false);
  const [services, setServices] = useState([]);
  const [serviceMaterials, setServiceMaterials] = useState([]);
  const [products, setProducts] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [selectedLogs, setSelectedLogs] = useState([]);
  const [activityFilters, setActivityFilters] = useState({
    start_date: '',
    end_date: '',
    month: '',
    year: new Date().getFullYear().toString(),
    filterMode: 'month' // 'month' or 'range'
  });
  const [activityPagination, setActivityPagination] = useState({ page: 1, limit: 6, total: 0, totalPages: 1 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState(null);
  const [formData, setFormData] = useState({});
  const { user, updateUser, formatCurrency, hasPermission, hasModuleAccess } = useAuth();
  
  const menuItems = getMenuItems(user?.company?.business_type, hasPermission, hasModuleAccess);
  
  const getBusinessTypeInfo = (type) => {
    return businessTypes.find(t => t.id === type) || businessTypes[3]; // default to All-in-One
  };
  
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchActivityLogs();
  }, [activityFilters, activityPagination.page, activityPagination.limit]);

  const fetchData = async () => {
    try {
      // Load essential data first for faster perceived loading
      const [usersRes, branchesRes, productsRes, currenciesRes] = await Promise.all([
        api.get('/users'),
        api.get('/branches'),
        api.get('/products'),
        api.get('/currencies')
      ]);
      
      // Users endpoint returns { data: { data: [...], pagination: ... } }
      const users = usersRes.data.data?.data || usersRes.data.data || [];
      const branches = branchesRes.data.data || [];
      const productsData = productsRes.data.data || [];
      const currenciesData = currenciesRes.data.data || [];
      
      // Filter by current company
      const companyId = Number(user?.company_id);
      const companyBranches = branches.filter(b => Number(b.company_id) === companyId);
      const companyProducts = productsData.filter(p => Number(p.company_id) === companyId);
      
      // Set initial stats immediately
      setStats({
        users: users.filter(u => Number(u.company_id) === companyId).length,
        employees: 0,
        branches: companyBranches.length,
        products: companyProducts.length,
        revenue: 0,
        expenses: 0,
        profit: 0
      });
      
      setCurrencies(currenciesData);
      
      // Load remaining data in parallel
      const [employeesRes, salesRes, expensesRes, servicesRes, materialsRes, projectsRes, projectWorkersRes, projectMaterialsRes] = await Promise.all([
        api.get('/employees'),
        api.get('/sales'),
        api.get('/expenses'),
        api.get('/services'),
        api.get('/service_materials'),
        api.get('/projects'),
        api.get('/project_workers'),
        api.get('/project_materials')
      ]);
      
      const employees = employeesRes.data.data || [];
      const sales = salesRes.data.data || [];
      const expenses = expensesRes.data.data || [];
      const servicesData = servicesRes.data.data || [];
      const materialsData = materialsRes.data.data || [];
      const projects = projectsRes.data.data || [];
      const projectWorkers = projectWorkersRes.data.data || [];
      const projectMaterials = projectMaterialsRes.data.data || [];
      
      // Filter remaining data and deduplicate sales
      const companySalesRaw = sales.filter(s => Number(s.company_id) === companyId);
      const seenSaleIds = new Set();
      const companySales = companySalesRaw.filter(sale => {
        if (seenSaleIds.has(Number(sale.id))) return false;
        seenSaleIds.add(Number(sale.id));
        return true;
      });
      const companyExpenses = expenses.filter(e => Number(e.company_id) === companyId);
      const companyServices = servicesData.filter(s => Number(s.company_id) === companyId);
      const companyMaterials = materialsData.filter(m => {
        const service = companyServices.find(s => s.id === m.service_id);
        return !!service;
      });
      const companyProjects = projects.filter(p => Number(p.company_id) === companyId);
      
      // Calculate total revenue and expenses
      const revenue = companySales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);
      const totalExpenses = companyExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
      const profit = revenue - totalExpenses;
      
      // Calculate per branch stats
      const branchStatsArray = companyBranches.map(branch => {
        const branchId = branch.id;
        const branchSales = companySales.filter(s => Number(s.branch_id) === branchId);
        const branchExpenses = companyExpenses.filter(e => Number(e.branch_id) === branchId);
        const branchProjects = companyProjects.filter(p => Number(p.branch_id) === branchId);
        
        // Calculate branch revenue and expenses
        const branchRevenue = branchSales.reduce((sum, sale) => sum + Number(sale.total_amount || 0), 0);
        const branchExpenseTotal = branchExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
        
        // Calculate total budget for branch projects
        const totalBudget = branchProjects.reduce((sum, proj) => sum + Number(proj.budget || 0), 0);
        
        // Calculate labor cost (project workers)
        const laborCost = branchProjects.reduce((sum, proj) => {
          const workers = projectWorkers.filter(w => Number(w.project_id) === proj.id);
          return sum + workers.reduce((s, w) => s + Number(w.daily_rate || 0), 0);
        }, 0);
        
        // Calculate material cost
        const materialCost = branchProjects.reduce((sum, proj) => {
          const mats = projectMaterials.filter(m => Number(m.project_id) === proj.id);
          return sum + mats.reduce((s, m) => s + (Number(m.quantity || 0) * Number(m.unit_cost || 0)), 0);
        }, 0);
        
        const totalCost = branchExpenseTotal + laborCost + materialCost;
        const grossProfit = branchRevenue - totalCost;
        const netProfit = grossProfit; // Can adjust for taxes etc later
        
        return {
          id: branchId,
          name: branch.name,
          revenue: branchRevenue,
          totalBudget,
          laborCost,
          materialCost,
          expenses: branchExpenseTotal,
          totalCost,
          grossProfit,
          netProfit
        };
      });
      
      // Add unassigned branch stats
      const unassignedProjects = companyProjects.filter(p => !p.branch_id);
      const unassignedBudget = unassignedProjects.reduce((sum, proj) => sum + Number(proj.budget || 0), 0);
      
      // Update stats with full data
      setStats({
        users: users.filter(u => Number(u.company_id) === companyId).length,
        employees: employees.filter(e => Number(e.company_id) === companyId).length,
        branches: companyBranches.length,
        products: companyProducts.length,
        revenue,
        expenses: totalExpenses,
        profit
      });
      
      setBranchStats(branchStatsArray);
      setServices(companyServices);
      setServiceMaterials(companyMaterials);
      setProducts(companyProducts);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error(error.userMessage || 'Failed to load dashboard');
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const params = { 
        page: activityPagination.page, 
        limit: activityPagination.limit, 
        ...activityFilters 
      };
      
      // Remove empty params
      Object.keys(params).forEach(key => {
        if (!params[key]) {
          delete params[key];
        }
      });
      
      const logsRes = await api.get('/activity-logs', { params });
      console.log('Company Dashboard API Response:', logsRes);
      const logsData = logsRes?.data?.data?.data || [];
      const paginationData = logsRes?.data?.data?.pagination || { page: 1, limit: 6, total: 0, totalPages: 1 };
      setActivityLogs(logsData);
      setActivityPagination(prev => ({ ...prev, ...paginationData }));
      setSelectedLogs([]);
    } catch (error) {
      toast.error('Failed to load activity logs');
      setActivityLogs([]);
    }
  };

  const handleActivityDateFilterChange = (key, value) => {
    // If setting start/end date, clear month and set mode to range
    setActivityFilters(prev => ({
      ...prev,
      [key]: value,
      month: '',
      filterMode: 'range'
    }));
    setActivityPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleActivityMonthYearFilterChange = (key, value) => {
    // If setting month/year, clear start/end date and set mode to month
    setActivityFilters(prev => ({
      ...prev,
      [key]: value,
      start_date: '',
      end_date: '',
      filterMode: 'month'
    }));
    setActivityPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleActivityFilterModeChange = (mode) => {
    setActivityFilters(prev => ({
      ...prev,
      filterMode: mode,
      month: mode === 'range' ? '' : prev.month,
      start_date: mode === 'month' ? '' : prev.start_date,
      end_date: mode === 'month' ? '' : prev.end_date
    }));
    setActivityPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatActivityDate = (dateString) => {
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

  const toggleSelectAllLogs = (e) => {
    if (e.target.checked) {
      setSelectedLogs(activityLogs.map(log => log.id));
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

  const handleDeleteSelectedLogs = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedLogs.length} selected log(s)?`)) {
      return;
    }

    try {
      await api.delete('/activity-logs', {
        data: { ids: selectedLogs }
      });
      toast.success(`${selectedLogs.length} log(s) deleted successfully!`);
      fetchActivityLogs();
    } catch (error) {
      toast.error('Failed to delete logs');
    }
  };
  
  const getMaterialsForService = (serviceId) => {
    return serviceMaterials.filter(m => Number(m.service_id) === Number(serviceId));
  };
  
  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'Unknown';
  };
  
  const getProductPrice = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.selling_price || 0;
  };
  
  const getTotalMaterialCostForService = (serviceId) => {
    const materials = getMaterialsForService(serviceId);
    return materials.reduce((total, m) => {
      const product = products.find(p => p.id === m.product_id);
      return total + (Number(product?.selling_price || 0) * Number(m.quantity));
    }, 0);
  };

  const handleSubmitCurrency = async (e) => {
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
      resetFormCurrency();
      fetchData();
      
      if (formData.is_default && user) {
        const updatedCompany = { ...user.company, currency_id: currencyId };
        await api.put(`/companies/${user.company.id}`, updatedCompany);
        const updatedUser = { ...user, company: updatedCompany };
        await updateUser(updatedUser);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteCurrency = async (id) => {
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

  const handleSetDefaultCurrency = async (currencyId) => {
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

  const handleEditCurrency = (currency) => {
    setActiveTab('currencies');
    setEditingCurrency(currency);
    setFormData({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      is_default: currency.is_default,
    });
    setIsModalOpen(true);
  };

  const resetFormCurrency = () => {
    setEditingCurrency(null);
    setFormData({});
  };

  const openCurrencyModal = () => {
    setActiveTab('currencies');
    resetFormCurrency();
    setFormData({ code: '', name: '', symbol: '', is_default: false });
    setIsModalOpen(true);
  };

  const currentBusinessType = getBusinessTypeInfo(user?.company?.business_type);

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Company Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your company management dashboard
          {user?.company?.business_type && (
            <span className="ml-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
              {currentBusinessType.name}
            </span>
          )}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dashboard'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('activity-logs')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'activity-logs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Activity Logs
          </button>
          <button
            onClick={() => setActiveTab('currencies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'currencies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Currencies
          </button>
        </nav>
      </div>

      {activeTab === 'dashboard' && (
        <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{stats.users}</div>
          <div className="text-gray-600">Total Users</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-orange-600">{stats.employees}</div>
          <div className="text-gray-600">Total Employees</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-green-600">{stats.branches}</div>
          <div className="text-gray-600">Total Branches</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">{stats.products}</div>
          <div className="text-gray-600">Products / Materials</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(stats.revenue)}
          </div>
          <div className="text-gray-600">Total Revenue</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-red-600">
            {formatCurrency(stats.expenses)}
          </div>
          <div className="text-gray-600">Total Expenses</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className={`text-3xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(stats.profit)}
          </div>
          <div className="text-gray-600">Net Profit/Loss</div>
        </div>
      </div>

      {/* Branch Performance Stats */}
      {branchStats.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Branch Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Branch</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Budget</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Labor Cost</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Material Cost</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Expenses</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Total Cost</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Gross Profit</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branchStats.slice(0, showAllBranches ? branchStats.length : 5).map((branch) => (
                  <tr key={branch.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{branch.name}</td>
                    <td className="px-4 py-3 text-gray-600">{formatCurrency(branch.totalBudget)}</td>
                    <td className="px-4 py-3 text-orange-600">{formatCurrency(branch.laborCost)}</td>
                    <td className="px-4 py-3 text-purple-600">{formatCurrency(branch.materialCost)}</td>
                    <td className="px-4 py-3 text-red-600">{formatCurrency(branch.expenses)}</td>
                    <td className="px-4 py-3 text-gray-800 font-medium">{formatCurrency(branch.totalCost)}</td>
                    <td className={`px-4 py-3 font-medium ${branch.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(branch.grossProfit)}
                    </td>
                    <td className={`px-4 py-3 font-medium ${branch.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(branch.netProfit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {branchStats.length > 5 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAllBranches(!showAllBranches)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {showAllBranches ? 'Show Less' : `Show ${Math.min(5, branchStats.length)} of ${branchStats.length}`} 
              </button>
            </div>
          )}
        </div>
      )}

      {/* Assigned Business Type Display */}
      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Assigned Business Type</h3>
        <div className="p-6 border-4 border-blue-600 bg-blue-50 rounded-xl">
          <div className="text-5xl mb-3">{currentBusinessType.icon}</div>
          <h4 className="text-2xl font-bold text-gray-800 mb-1">{currentBusinessType.name}</h4>
          <p className="text-gray-600">{currentBusinessType.desc}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">System Status</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Subscription Status</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">Active</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Users Limit</span>
              <span className="text-gray-600">{stats.users} / Unlimited</span>
            </div>
          </div>
        </div>
      </div>

      {user?.company?.business_type === 'services' && services.length > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Services</h3>
            <button 
              onClick={() => navigate('/services/services')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services.slice(0, 4).map((service) => {
              const materials = getMaterialsForService(service.id);
              const materialCost = getTotalMaterialCostForService(service.id);
              return (
                <div key={service.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-800">{service.name}</h4>
                    <div className="text-right">
                      <div className="font-bold text-blue-600">{formatCurrency(service.price)}</div>
                      {materialCost > 0 && (
                        <div className="text-xs text-gray-500">Materials: {formatCurrency(materialCost)}</div>
                      )}
                    </div>
                  </div>
                  {service.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                  )}
                  {materials.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <h5 className="text-xs font-semibold text-gray-500 mb-2">Materials Used</h5>
                      <div className="space-y-1">
                        {materials.map((material, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{getProductName(material.product_id)} × {material.quantity}</span>
                            <span className="text-gray-800">
                              {formatCurrency(Number(getProductPrice(material.product_id)) * Number(material.quantity))}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}

      {activeTab === 'activity-logs' && (
        <>
          {/* Selected logs bar */}
          {selectedLogs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="text-blue-800 font-medium">
                {selectedLogs.length} log(s) selected
              </div>
              <button
                onClick={handleDeleteSelectedLogs}
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
                onClick={() => handleActivityFilterModeChange('month')}
                className={`pb-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activityFilters.filterMode === 'month'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Month/Year
              </button>
              <button
                onClick={() => handleActivityFilterModeChange('range')}
                className={`pb-2 px-4 border-b-2 font-medium text-sm transition-colors ${
                  activityFilters.filterMode === 'range'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Date Range
              </button>
            </div>

            {/* Filter Fields */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {activityFilters.filterMode === 'month' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={activityFilters.month}
                      onChange={(e) => handleActivityMonthYearFilterChange('month', e.target.value)}
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
                      value={activityFilters.year}
                      onChange={(e) => handleActivityMonthYearFilterChange('year', e.target.value)}
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
                      value={activityFilters.start_date}
                      onChange={(e) => handleActivityDateFilterChange('start_date', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={activityFilters.end_date}
                      onChange={(e) => handleActivityDateFilterChange('end_date', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}
            </div>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  setActivityFilters({
                    start_date: '',
                    end_date: '',
                    month: '',
                    year: new Date().getFullYear().toString()
                  });
                  setActivityPagination(prev => ({ ...prev, page: 1 }));
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
                        checked={activityLogs.length > 0 && selectedLogs.length === activityLogs.length}
                        onChange={toggleSelectAllLogs}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Resource</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Record ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activityLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                        No activity logs found for the selected filters.
                      </td>
                    </tr>
                  ) : (
                    activityLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedLogs.includes(log.id)}
                            onChange={() => toggleSelectLog(log.id)}
                            className="w-4 h-4 text-blue-600 rounded"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-800">
                            {log.first_name} {log.last_name}
                          </div>
                          <div className="text-sm text-gray-500">{log.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            log.action === 'create' ? 'bg-green-100 text-green-800' :
                            log.action === 'update' ? 'bg-blue-100 text-blue-800' :
                            log.action === 'delete' ? 'bg-red-100 text-red-800' :
                            log.action === 'login' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-800">{log.table_name}</td>
                        <td className="px-6 py-4 text-gray-600">{log.record_id || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-700">{log.description}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {formatActivityDate(log.created_at)}
                        </td>
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
              Showing {Math.min((activityPagination.page - 1) * activityPagination.limit + 1, activityPagination?.total || 0)} - {Math.min(activityPagination.page * activityPagination.limit, activityPagination?.total || 0)} of {activityPagination?.total || 0} logs
            </div>
            <div className="flex gap-2 items-center">
              <button
                disabled={activityPagination.page <= 1}
                onClick={() => setActivityPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, activityPagination?.totalPages || 1) }, (_, i) => {
                  // Show current page and surrounding pages
                  let pageNum;
                  const totalPages = activityPagination?.totalPages || 1;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (activityPagination.page <= 3) {
                    pageNum = i + 1;
                  } else if (activityPagination.page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = activityPagination.page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setActivityPagination(prev => ({ ...prev, page: pageNum }))}
                      className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        activityPagination.page === pageNum
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
                disabled={activityPagination.page >= (activityPagination?.totalPages || 1)}
                onClick={() => setActivityPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === 'currencies' && (
        <>
          <div className="mb-6">
            <button
              onClick={openCurrencyModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Add New Currency
            </button>
          </div>

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
                  {currencies.map((currency) => (
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
                              onClick={() => handleSetDefaultCurrency(currency.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Set as Default
                            </button>
                          )
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {hasPermission('currencies', 'update') && (
                          <button onClick={() => handleEditCurrency(currency)} className="text-blue-600 hover:text-blue-800 mr-3">
                            Edit
                          </button>
                        )}
                        {hasPermission('currencies', 'delete') && (
                          <button onClick={() => handleDeleteCurrency(currency.id)} className="text-red-600 hover:text-red-800">
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
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingCurrency ? 'Edit Currency' : 'Create New Currency'}
            </h2>
            <form onSubmit={handleSubmitCurrency} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency Code</label>
                <input
                  type="text"
                  required
                  placeholder="USD, EUR, RWF, etc."
                  value={formData.code || ''}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Currency Name</label>
                <input
                  type="text"
                  required
                  placeholder="US Dollar, Euro, Rwandan Franc, etc."
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Symbol</label>
                <input
                  type="text"
                  required
                  placeholder="$, €, Frw, etc."
                  value={formData.symbol || ''}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default || false}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
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

export default CompanyDashboard;

