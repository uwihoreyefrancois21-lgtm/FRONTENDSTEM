import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';

const ProtectedRoute = ({ children, requireAdmin = false, requireSubscription = false }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for admin role if required
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check for active subscription if required
  if (requireSubscription && !user?.subscription?.isActive) {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;

