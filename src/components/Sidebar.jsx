
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ChangePasswordModal from './ChangePasswordModal';

// Map menu paths to resource names for permission checking
const pathToResourceMap = {
  // Dashboard
  '/services': 'dashboard',
  '/projects': 'dashboard',
  '/products': 'dashboard',
  '/allinone': 'dashboard',
  '/company': 'dashboard',
  '/superadmin': 'dashboard',
  
  // Services
  '/services/services': 'services',
  
  // Products
  '/products/products': 'products',
  '/products/categories': 'categories',
  '/products/inventory': 'products',
  
  // Projects
  '/projects/projects': 'projects',
  '/projects/workers': 'project_workers',
  '/projects/expenses': 'expenses',
  '/projects/tasks': 'project_tasks',
  
  // Users & Roles
  '/company/users': 'users',
  '/company/branches': 'branches',
  '/company/categories': 'categories',
  '/company/units': 'units',
  '/company/currencies': 'currencies',
  '/company/employees': 'employees',
  '/company/attendance': 'attendance',
  '/company/salaries': 'salaries',
  
  // Sales
  '/services/sales': 'sales',
  '/products/sales': 'sales',
  '/allinone/sales': 'sales',
  
  // Customers & Suppliers
  '/services/customers': 'customers',
  '/products/customers': 'customers',
  '/projects/customers': 'customers',
  '/allinone/customers': 'customers',
  '/products/suppliers': 'suppliers',
  
  // Reports & AI
  '/services/reports': 'reports',
  '/projects/reports': 'reports',
  '/products/reports': 'reports',
  '/allinone/reports': 'reports',
  '/services/ai': 'ai_conversations',
  '/projects/ai': 'ai_conversations',
  '/products/ai': 'ai_conversations',
  '/allinone/ai': 'ai_conversations',
  
  // Branches
  '/services/branches': 'branches',
  '/products/branches': 'branches',
  '/allinone/branches': 'branches',
  
  // Superadmin
  '/superadmin/companies': 'companies',
  '/superadmin/plans': 'subscription_plans',
  '/superadmin/users': 'users',
  '/superadmin/branches': 'branches',
  '/superadmin/reports': 'reports',
};

const Sidebar = ({ menuItems }) => {
  const { user, logout, hasPermission, hasModuleAccess, handlePasswordChanged } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showChangePassword, setShowChangePassword] = useState(false);

  const shouldShowMenuItem = (item) => {
    // Superadmin sees everything
    if (user?.is_super_admin) return true;
    
    const resource = pathToResourceMap[item.path];
    if (!resource) return true; // If no mapping, show it (fallback)
    
    // Check module access first
    if (!hasModuleAccess(resource)) return false;
    
    // Check read permission
    return hasPermission(resource, 'read');
  };

  const filteredMenuItems = menuItems.filter(shouldShowMenuItem);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <div className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-slate-100 min-h-screen flex flex-col shadow-2xl">
        <div className="p-6 border-b border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-xl shadow-lg">
              📊
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              NegTradeHub
            </h1>
          </div>
          <p className="text-slate-400 text-sm">{user?.company?.name || 'Dashboard'}</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {filteredMenuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:translate-x-1'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-slate-800/50">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
              {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-slate-100 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              {user?.role?.name && (
                <p className="text-xs text-blue-400 mt-0.5 font-medium">{user.role.name}</p>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === '/profile'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:translate-x-1'
              }`}
            >
              <span className="text-xl">👤</span>
              <span className="font-medium">Profile</span>
            </Link>
            
            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:translate-x-1 font-medium"
            >
              <span className="text-xl">🔑</span>
              <span>Change Password</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-slate-300 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium"
            >
              <span>🚪</span>
              Logout
            </button>
          </div>
        </div>
      </div>
      
      {showChangePassword && (
        <ChangePasswordModal
          onSuccess={() => {
            handlePasswordChanged();
            setShowChangePassword(false);
          }}
          onClose={() => setShowChangePassword(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
