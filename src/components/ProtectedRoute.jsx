
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Map route paths to resources for permission checking
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

const ProtectedRoute = ({ children, requireSuperAdmin, permission }) => {
  const { user, loading, hasPermission, hasModuleAccess } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && !user.is_super_admin) {
    return <Navigate to="/login" replace />;
  }

  let resource, action;
  if (permission) {
    ({ resource, action } = typeof permission === 'string' ? { resource: permission, action: null } : permission);
  } else {
    // Try to get resource from path if no explicit permission given
    resource = pathToResourceMap[window.location.pathname];
    action = 'read';
  }

  if (resource) {
    // Check module access first
    if (!user.is_super_admin && !hasModuleAccess(resource)) {
      return <Navigate to="/login" replace />;
    }
    // Check permission
    if (!user.is_super_admin && !hasPermission(resource, action || 'read')) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

