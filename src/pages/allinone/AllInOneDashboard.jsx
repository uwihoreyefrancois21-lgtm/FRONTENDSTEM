
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const treeMenuItems = [
  {
    id: 'main',
    label: 'Main Dashboard',
    icon: '🏠',
    path: '/allinone',
    children: []
  },
  {
    id: 'services',
    label: 'Services',
    icon: '💼',
    path: '/services',
    children: [
      { label: 'Services Dashboard', icon: '📊', path: '/services' },
      { label: 'Manage Services', icon: '⚙️', path: '/services/services' },
      { label: 'Service Requests', icon: '📝', path: '/services/requests' },
      { label: 'Sales', icon: '💰', path: '/services/sales' },
      { label: 'Reports', icon: '📈', path: '/services/reports' },
      { label: 'AI Assistant', icon: '🤖', path: '/services/ai' },
    ]
  },
  {
    id: 'projects',
    label: 'Projects',
    icon: '📊',
    path: '/projects',
    children: [
      { label: 'Projects Dashboard', icon: '📊', path: '/projects' },
      { label: 'Manage Projects', icon: '🏗️', path: '/projects/projects' },
      { label: 'Project Workers', icon: '👷', path: '/projects/workers' },
      { label: 'Project Expenses', icon: '💰', path: '/projects/expenses' },
      { label: 'Tasks', icon: '✅', path: '/projects/tasks' },
      { label: 'Reports', icon: '📈', path: '/projects/reports' },
      { label: 'AI Assistant', icon: '🤖', path: '/projects/ai' },
    ]
  },
  {
    id: 'company',
    label: 'Company',
    icon: '🏢',
    path: '/company',
    children: [
      { label: 'Company Dashboard', icon: '🏠', path: '/company' },
      { label: 'Users', icon: '👥', path: '/company/users' },
      { label: 'Employees', icon: '👨‍💼', path: '/company/employees' },
      { label: 'Workers', icon: '👷', path: '/company/workers' },
      { label: 'Branches', icon: '🏗️', path: '/company/branches' },
      { label: 'Salaries', icon: '💵', path: '/company/salaries' },
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: '📈',
    path: '/allinone/reports',
    children: [
      { label: 'All Reports', icon: '📊', path: '/allinone/reports' },
    ]
  },
  {
    id: 'ai',
    label: 'AI Assistant',
    icon: '🤖',
    path: '/allinone/ai',
    children: [
      { label: 'AI Assistant', icon: '🤖', path: '/allinone/ai' },
    ]
  },
  {
    id: 'profile',
    label: 'My Profile',
    icon: '👤',
    path: '/profile',
    children: []
  }
];

const AllInOneDashboard = () => {
  const [stats, setStats] = useState({
    services: [],
    products: [],
    projects: [],
  });
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState({});
  const { user, formatCurrency } = useAuth();
  const location = useLocation();

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [servicesRes, productsRes, projectsRes] = await Promise.all([       
        api.get('/services'),
        api.get('/products'),
        api.get('/projects'),
      ]);
      
      // Filter all data to only show this company's
      const companyServices = servicesRes.data.data.filter(s => Number(s.company_id) === Number(user?.company_id));
      const companyProducts = productsRes.data.data.filter(p => Number(p.company_id) === Number(user?.company_id));
      const companyProjects = projectsRes.data.data.filter(p => Number(p.company_id) === Number(user?.company_id));
      
      setStats({
        services: companyServices,
        products: companyProducts,
        projects: companyProjects,
      });
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const TreeSidebar = () => {
    return (
      <div className="w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 min-h-screen flex flex-col shadow-2xl overflow-y-auto">
        <div className="p-6 border-b border-slate-700/50 bg-slate-900/50 sticky top-0 z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
              📊
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              NegTradeHub
            </h1>
          </div>
          <p className="text-slate-400 text-sm">All-in-One Dashboard</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {treeMenuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.children.length > 0) {
                    toggleSection(item.id);
                  } else {
                    window.location.href = item.path;
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium flex-1 text-left">{item.label}</span>
                {item.children.length > 0 && (
                  <span className="text-xs transition-transform duration-200">
                    {expandedSections[item.id] ? '▼' : '▶'}
                  </span>
                )}
              </button>
              
              {expandedSections[item.id] && item.children.length > 0 && (
                <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700 pl-3">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                        location.pathname === child.path
                          ? 'bg-blue-600/30 text-blue-300 font-medium'
                          : 'text-slate-400 hover:bg-slate-700/30 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-base">{child.icon}</span>
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50 sticky bottom-0">
          <Link
            to="/profile"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-sm font-bold shadow-lg">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-100 truncate text-sm">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </Link>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100">
      <TreeSidebar />
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">All-in-One Dashboard</h1>
          <p className="text-gray-600">Manage all your business operations in one place</p>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{stats.services.length}</div>
          <div className="text-gray-600">Services</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-green-600">{stats.products.length}</div>
          <div className="text-gray-600">Products</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">{stats.projects.length}</div>
          <div className="text-gray-600">Projects</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-orange-600">0</div>
          <div className="text-gray-600">Total Sales</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">💼 Services</h2>
          {loading ? (
            <div className="animate-pulse">Loading...</div>
          ) : stats.services.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No services yet</div>
          ) : (
            <div className="space-y-3">
              {stats.services.slice(0, 3).map((service) => (
                <div key={service.id} className="p-3 border rounded-lg">      
                  <div className="font-semibold">{service.name}</div>
                  <div className="text-sm text-blue-600">{formatCurrency(service.price)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">🛒 Products</h2>
          {loading ? (
            <div className="animate-pulse">Loading...</div>
          ) : stats.products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No products yet</div>
          ) : (
            <div className="space-y-3">
              {stats.products.slice(0, 3).map((product) => (
                <div key={product.id} className="p-3 border rounded-lg">      
                  <div className="font-semibold">{product.name}</div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-600">{formatCurrency(product.selling_price)}</span>
                    <span className="text-green-600">Stock: {product.stock_quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Projects</h2>
          {loading ? (
            <div className="animate-pulse">Loading...</div>
          ) : stats.projects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No projects yet</div>
          ) : (
            <div className="space-y-3">
              {stats.projects.slice(0, 3).map((project) => (
                <div key={project.id} className="p-3 border rounded-lg">      
                  <div className="font-semibold">{project.name}</div>
                  <div className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 inline-block mt-1">
                    {project.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <h3 className="font-semibold mb-1">Financial Report</h3>
            <p className="text-sm text-gray-500">Balance sheet & P&L</p>
          </div>
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <h3 className="font-semibold mb-1">Inventory Report</h3>
            <p className="text-sm text-gray-500">Stock status</p>
          </div>
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <h3 className="font-semibold mb-1">Project Report</h3>
            <p className="text-sm text-gray-500">Progress & costs</p>
          </div>
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <h3 className="font-semibold mb-1">Attendance Report</h3>
            <p className="text-sm text-gray-500">Employee presence</p>
          </div>
        </div>
      </div>

      <ToastContainer />
      </main>
    </div>
  );
};

export default AllInOneDashboard;

