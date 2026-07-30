
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import AIAssistant from './components/AIAssistant';
import ChangePasswordModal from './components/ChangePasswordModal';
import Placeholder from './components/Placeholder';
import ProtectedRoute from './components/ProtectedRoute';
import Reports from './components/Reports';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AllInOneDashboard from './pages/allinone/AllInOneDashboard';
import BusinessTypeSelection from './pages/BusinessTypeSelection';
import BranchManagement from './pages/company/BranchManagement';
import CompanyDashboard from './pages/company/CompanyDashboard';
import EmployeeManagement from './pages/company/EmployeeManagement';
import SalaryManagement from './pages/company/SalaryManagement';
import UserManagement from './pages/company/UserManagement';
import WorkerManagement from './pages/company/WorkerManagement';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Login from './pages/Login';
import ProductsDashboard from './pages/products/ProductsDashboard';
import ProductsManagement from './pages/products/ProductsManagement';
import SupplierCustomerManagement from './pages/products/SupplierCustomerManagement';
import ProjectDetails from './pages/projects/ProjectDetails';
import ProjectExpenses from './pages/projects/ProjectExpenses';
import ProjectManagement from './pages/projects/ProjectManagement';
import ProjectMaterials from './pages/projects/ProjectMaterials';
import ProjectsDashboard from './pages/projects/ProjectsDashboard';
import ProjectWorkers from './pages/projects/ProjectWorkers';
import TaskManagement from './pages/projects/TaskManagement';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ServiceRequests from './pages/services/ServiceRequests';
import ServicesDashboard from './pages/services/ServicesDashboard';
import ServicesManagement from './pages/services/ServicesManagement';
import Subscription from './pages/Subscription';
import ActivityLogManagement from './pages/superadmin/ActivityLogManagement';
import SuperAdminBranchManagement from './pages/superadmin/SuperAdminBranchManagement';
import SuperAdminCompanies from './pages/superadmin/SuperAdminCompanies';
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import SuperAdminPlans from './pages/superadmin/SuperAdminPlans';
import SuperAdminReports from './pages/superadmin/SuperAdminReports';
import SuperAdminUserManagement from './pages/superadmin/SuperAdminUserManagement';
import UserProfile from './pages/user/UserProfile';

const AppContent = () => {
  const { mustChangePassword, handlePasswordChanged, getDashboardPath, user } = useAuth();

  // Get the correct menuItems based on user role
  const getMenuItems = () => {
    if (user?.is_super_admin) return menuItems.superadmin;
    if (user?.company?.business_type === 'services') return menuItems.services;
    if (user?.company?.business_type === 'projects') return menuItems.projects;
    if (user?.company?.business_type === 'products') return menuItems.products;
    return menuItems.allinone;
  };

  return (
    <>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/select-business-type" element={
          <ProtectedRoute>
            <BusinessTypeSelection />
          </ProtectedRoute>
        } />
        <Route path="/subscription" element={
          <ProtectedRoute>
            <Subscription />
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile menuItems={getMenuItems()} />
          </ProtectedRoute>
        } />
        
        {/* Super Admin Routes */}
        <Route path="/superadmin" element={
          <ProtectedRoute requireSuperAdmin>
            <SuperAdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/companies" element={
          <ProtectedRoute requireSuperAdmin>
            <SuperAdminCompanies />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/plans" element={
          <ProtectedRoute requireSuperAdmin>
            <SuperAdminPlans />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/users" element={
          <ProtectedRoute requireSuperAdmin>
            <SuperAdminUserManagement />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/branches" element={
          <ProtectedRoute requireSuperAdmin>
            <SuperAdminBranchManagement />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/activity-logs" element={
          <ProtectedRoute requireSuperAdmin>
            <ActivityLogManagement />
          </ProtectedRoute>
        } />
        <Route path="/superadmin/reports" element={
          <ProtectedRoute requireSuperAdmin>
            <SuperAdminReports />
          </ProtectedRoute>
        } />
        
        {/* Company Admin Routes */}
        <Route path="/company" element={
          <ProtectedRoute>
            <CompanyDashboard />
          </ProtectedRoute>
        } />
        <Route path="/company/users" element={
          <ProtectedRoute>
            <UserManagement />
          </ProtectedRoute>
        } />
        <Route path="/company/branches" element={
          <ProtectedRoute>
            <BranchManagement />
          </ProtectedRoute>
        } />
        <Route path="/company/products" element={
          <ProtectedRoute>
            <ProductsManagement />
          </ProtectedRoute>
        } />
        <Route path="/company/employees" element={
          <ProtectedRoute>
            <EmployeeManagement />
          </ProtectedRoute>
        } />
        <Route path="/company/workers" element={
          <ProtectedRoute>
            <WorkerManagement />
          </ProtectedRoute>
        } />
        <Route path="/company/salaries" element={
          <ProtectedRoute>
            <SalaryManagement />
          </ProtectedRoute>
        } />
        
        {/* Services Routes */}
        <Route path="/services" element={
          <ProtectedRoute>
            <ServicesDashboard />
          </ProtectedRoute>
        } />
        <Route path="/services/reports" element={
          <ProtectedRoute>
            <Reports menuItems={menuItems.services} />
          </ProtectedRoute>
        } />
        <Route path="/services/ai" element={
          <ProtectedRoute>
            <AIAssistant menuItems={menuItems.services} />
          </ProtectedRoute>
        } />
        
        {/* Projects Routes */}
        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectsDashboard />
          </ProtectedRoute>
        } />
        <Route path="/projects/projects" element={
          <ProtectedRoute>
            <ProjectManagement />
          </ProtectedRoute>
        } />
        <Route path="/projects/workers" element={
          <ProtectedRoute>
            <ProjectWorkers />
          </ProtectedRoute>
        } />
        <Route path="/projects/materials" element={
          <ProtectedRoute>
            <ProjectMaterials />
          </ProtectedRoute>
        } />
        <Route path="/projects/expenses" element={
          <ProtectedRoute>
            <ProjectExpenses />
          </ProtectedRoute>
        } />
        <Route path="/projects/tasks" element={
          <ProtectedRoute>
            <TaskManagement />
          </ProtectedRoute>
        } />
        <Route path="/projects/reports" element={
          <ProtectedRoute>
            <Reports menuItems={menuItems.projects} />
          </ProtectedRoute>
        } />
        <Route path="/projects/ai" element={
          <ProtectedRoute>
            <AIAssistant menuItems={menuItems.projects} />
          </ProtectedRoute>
        } />
        
        {/* Products Routes */}
        <Route path="/products" element={
          <ProtectedRoute>
            <ProductsDashboard />
          </ProtectedRoute>
        } />
        <Route path="/products/reports" element={
          <ProtectedRoute>
            <Reports menuItems={menuItems.products} />
          </ProtectedRoute>
        } />
        <Route path="/products/ai" element={
          <ProtectedRoute>
            <AIAssistant menuItems={menuItems.products} />
          </ProtectedRoute>
        } />
        
        {/* Additional Services Routes (duplicate removed) */}
        <Route path="/services/services" element={
          <ProtectedRoute>
            <ServicesManagement />
          </ProtectedRoute>
        } />
        <Route path="/services/requests" element={
          <ProtectedRoute>
            <ServiceRequests />
          </ProtectedRoute>
        } />
        <Route path="/services/sales" element={
          <ProtectedRoute>
            <ProductsManagement />
          </ProtectedRoute>
        } />
        <Route path="/services/employees" element={
          <ProtectedRoute>
            <EmployeeManagement />
          </ProtectedRoute>
        } />
        <Route path="/services/branches" element={
          <ProtectedRoute>
            <BranchManagement />
          </ProtectedRoute>
        } />
        <Route path="/services/salaries" element={
          <ProtectedRoute>
            <SalaryManagement />
          </ProtectedRoute>
        } />
        <Route path="/services/suppliers-customers" element={
          <ProtectedRoute>
            <SupplierCustomerManagement />
          </ProtectedRoute>
        } />

        {/* Additional Projects Routes */}
        <Route path="/projects/projects/:id" element={
          <ProtectedRoute>
            <ProjectDetails />
          </ProtectedRoute>
        } />
        <Route path="/projects/employees" element={
          <ProtectedRoute>
            <EmployeeManagement />
          </ProtectedRoute>
        } />

        {/* Additional Products Routes (duplicate removed) */}
        <Route path="/products/products" element={
          <ProtectedRoute>
            <ProductsManagement />
          </ProtectedRoute>
        } />
        <Route path="/products/inventory" element={
          <ProtectedRoute>
            <ProductsManagement />
          </ProtectedRoute>
        } />
        <Route path="/products/sales" element={
          <ProtectedRoute>
            <ProductsManagement />
          </ProtectedRoute>
        } />
        <Route path="/products/suppliers-customers" element={
          <ProtectedRoute>
            <SupplierCustomerManagement />
          </ProtectedRoute>
        } />
        <Route path="/products/employees" element={
          <ProtectedRoute>
            <EmployeeManagement />
          </ProtectedRoute>
        } />
        <Route path="/products/branches" element={
          <ProtectedRoute>
            <BranchManagement />
          </ProtectedRoute>
        } />
        <Route path="/products/salaries" element={
          <ProtectedRoute>
            <SalaryManagement />
          </ProtectedRoute>
        } />

        {/* All In One Routes */}
        <Route path="/allinone" element={
          <ProtectedRoute>
            <AllInOneDashboard />
          </ProtectedRoute>
        } />
        <Route path="/allinone/services" element={
          <ProtectedRoute>
            <ServicesManagement />
          </ProtectedRoute>
        } />
        <Route path="/allinone/projects" element={
          <ProtectedRoute>
            <ProjectManagement />
          </ProtectedRoute>
        } />
        <Route path="/allinone/products" element={
          <ProtectedRoute>
            <ProductsManagement />
          </ProtectedRoute>
        } />
        <Route path="/allinone/sales" element={
          <ProtectedRoute>
            <ProductsManagement />
          </ProtectedRoute>
        } />
        <Route path="/allinone/inventory" element={
          <ProtectedRoute>
            <ProductsManagement />
          </ProtectedRoute>
        } />
        <Route path="/allinone/employees" element={
          <ProtectedRoute>
            <EmployeeManagement />
          </ProtectedRoute>
        } />
        <Route path="/allinone/reports" element={
          <ProtectedRoute>
            <Reports menuItems={menuItems.allinone} isAllInOne={true} />
          </ProtectedRoute>
        } />
        <Route path="/allinone/ai" element={
          <ProtectedRoute>
            <AIAssistant menuItems={menuItems.allinone} />
          </ProtectedRoute>
        } />
        <Route path="/allinone/suppliers-customers" element={
          <ProtectedRoute>
            <SupplierCustomerManagement />
          </ProtectedRoute>
        } />
        <Route path="/allinone/branches" element={
          <ProtectedRoute>
            <BranchManagement />
          </ProtectedRoute>
        } />
        <Route path="/allinone/salaries" element={
          <ProtectedRoute>
            <SalaryManagement />
          </ProtectedRoute>
        } />
      </Routes>
      {mustChangePassword && (
        <ChangePasswordModal 
          onSuccess={() => handlePasswordChanged()}
          isForced={true}
        />
      )}
    </>
  );
};

// Menu item configurations
const menuItems = {
  services: [
    { path: '/services', label: 'Dashboard', icon: '🏠' },
    { path: '/services/services', label: 'Services', icon: '💼' },
    { path: '/services/suppliers-customers', label: 'Suppliers & Customers', icon: '👥' },
    { path: '/services/sales', label: 'Sales', icon: '💰' },
    { path: '/services/reports', label: 'Reports', icon: '📈' },
    { path: '/services/ai', label: 'AI Assistant', icon: '🤖' },
  ],
  projects: [
    { path: '/projects', label: 'Dashboard', icon: '🏠' },
    { path: '/projects/projects', label: 'Projects', icon: '📊' },
    { path: '/projects/workers', label: 'Project Workers', icon: '👷' },
    { path: '/projects/materials', label: 'Project Materials', icon: '🛠️' },
    { path: '/projects/expenses', label: 'Project Expenses', icon: '💰' },
    { path: '/projects/tasks', label: 'Tasks', icon: '✅' },
    { path: '/projects/reports', label: 'Reports', icon: '📈' },
    { path: '/projects/ai', label: 'AI Assistant', icon: '🤖' },
  ],
  products: [
    { path: '/products', label: 'Dashboard', icon: '🏠' },
    { path: '/products/products', label: 'Products', icon: '🛒' },
    { path: '/products/inventory', label: 'Inventory', icon: '📦' },
    { path: '/products/sales', label: 'Sales / POS', icon: '💰' },
    { path: '/products/suppliers-customers', label: 'Suppliers & Customers', icon: '👥' },
    { path: '/products/reports', label: 'Reports', icon: '📈' },
    { path: '/products/ai', label: 'AI Assistant', icon: '🤖' },
  ],
  allinone: [
    { path: '/allinone', label: 'Dashboard', icon: '🏠' },
    { path: '/allinone/services', label: 'Services', icon: '💼' },
    { path: '/allinone/projects', label: 'Projects', icon: '📊' },
    { path: '/allinone/products', label: 'Products', icon: '🛒' },
    { path: '/allinone/sales', label: 'Sales', icon: '💰' },
    { path: '/allinone/inventory', label: 'Inventory', icon: '📦' },
    { path: '/allinone/reports', label: 'Reports', icon: '📈' },
    { path: '/allinone/ai', label: 'AI Assistant', icon: '🤖' },
  ],
  superadmin: [
    { path: '/superadmin', label: 'Dashboard', icon: '🏠' },
    { path: '/superadmin/companies', label: 'Companies', icon: '🏢' },
    { path: '/superadmin/plans', label: 'Plans', icon: '📋' },
    { path: '/superadmin/users', label: 'Users', icon: '👥' },
    { path: '/superadmin/branches', label: 'Branches', icon: '🏗️' },
    { path: '/superadmin/activity-logs', label: 'Activity Logs', icon: '📜' },
    { path: '/superadmin/reports', label: 'Reports', icon: '📈' },
  ]
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
