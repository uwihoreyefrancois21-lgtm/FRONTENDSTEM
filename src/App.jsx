import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import EIFLayout from './components/EIFLayout';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Login from './pages/Login';
import Payments from './pages/Payments';
import ProfileSettings from './pages/ProfileSettings';
import ProjectDetail from './pages/ProjectDetail';
import Projects from './pages/Projects';
import Register from './pages/Register';
import Reports from './pages/Reports';
import ResetPassword from './pages/ResetPassword';
import Transactions from './pages/Transactions';
import UserManagement from './pages/UserManagement';

// Export-Import & Finance System pages
import AdminSystemSelection from './pages/AdminSystemSelection';
import EIFAdminDashboard from './pages/eif/EIFAdminDashboard';
import EIFDashboard from './pages/eif/EIFDashboard';
import EIFExpenses from './pages/eif/EIFExpenses';
import EIFForgotPassword from './pages/eif/EIFForgotPassword';
import EIFLogin from './pages/eif/EIFLogin';
import EIFOperations from './pages/eif/EIFOperations';
import EIFPartners from './pages/eif/EIFPartners';
import EIFPayments from './pages/eif/EIFPayments';
import EIFProducts from './pages/eif/EIFProducts';
import EIFProductLosses from './pages/eif/EIFProductLosses';
import EIFProfileSettings from './pages/eif/EIFProfileSettings';
import EIFRegister from './pages/eif/EIFRegister';
import EIFReports from './pages/eif/EIFReports';
import EIFStock from './pages/eif/EIFStock';
import SystemManagement from './pages/SystemManagement';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/projects"
              element={
                <ProtectedRoute>
                  <Projects />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/projects/:id"
              element={
                <ProtectedRoute>
                  <ProjectDetail />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Transactions />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <Reports />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/user-management"
              element={
                <ProtectedRoute requireAdmin>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/payments"
              element={
                <ProtectedRoute>
                  <Payments />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile-settings"
              element={
                <ProtectedRoute>
                  <ProfileSettings />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/admin-system-selection"
              element={
                <ProtectedRoute requireAdmin>
                  <AdminSystemSelection />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/system-management"
              element={
                <ProtectedRoute requireAdmin>
                  <SystemManagement />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/eif/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <EIFAdminDashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Export-Import & Finance System Routes */}
            <Route path="/eif/login" element={<EIFLogin />} />
            <Route path="/eif/register" element={<EIFRegister />} />
            <Route path="/eif/forgot-password" element={<EIFForgotPassword />} />
            
            <Route
              path="/eif/dashboard"
              element={
                <EIFLayout>
                  <EIFDashboard />
                </EIFLayout>
              }
            />
            
            <Route
              path="/eif/products"
              element={
                <EIFLayout>
                  <EIFProducts />
                </EIFLayout>
              }
            />
            
            <Route
              path="/eif/partners"
              element={
                <EIFLayout>
                  <EIFPartners />
                </EIFLayout>
              }
            />
            
            <Route
              path="/eif/operations"
              element={
                <EIFLayout>
                  <EIFOperations />
                </EIFLayout>
              }
            />
            
            <Route
              path="/eif/stock"
              element={
                <EIFLayout>
                  <EIFStock />
                </EIFLayout>
              }
            />
            
            <Route
              path="/eif/payments"
              element={
                <EIFLayout>
                  <EIFPayments />
                </EIFLayout>
              }
            />
            
            <Route
              path="/eif/expenses"
              element={
                <EIFLayout>
                  <EIFExpenses />
                </EIFLayout>
              }
            />
            
            <Route
              path="/eif/reports"
              element={
                <EIFLayout>
                  <EIFReports />
                </EIFLayout>
              }
            />
            
            <Route
              path="/eif/product-losses"
              element={
                <EIFLayout>
                  <EIFProductLosses />
                </EIFLayout>
              }
            />
            
            <Route
              path="/eif/profile-settings"
              element={
                <EIFLayout>
                  <EIFProfileSettings />
                </EIFLayout>
              }
            />
            
            {/* Redirect any unknown paths to home */}
            <Route 
              path="*" 
              element={<Navigate to="/" replace />} 
            />
          </Routes>
        </div>
        <ToastContainer 
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
