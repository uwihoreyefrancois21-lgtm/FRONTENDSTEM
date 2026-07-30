
import { createContext, useContext, useEffect, useState } from 'react';
import { getAllowedModulesForBusinessType } from '../config/businessModules';
import api from '../utils/api';
import { getErrorMessage } from '../utils/validation';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [companyCurrency, setCompanyCurrency] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      fetchCompanyCurrency(parsedUser);
    }
    setLoading(false);
  }, []);

  const fetchCompanyCurrency = async (userData) => {
    if (!userData?.company?.currency_id) {
      return;
    }
    try {
      const response = await api.get(`/currencies/${userData.company.currency_id}`);
      setCompanyCurrency(response.data.data);
    } catch (error) {
      console.error('Error fetching currency:', error);
    }
  };

  const login = async (email, password) => {
    try {
      console.log('Login attempt:', email);
      const response = await api.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      const { token, user: userData, must_change_password } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setMustChangePassword(must_change_password || false);
      
      // Fetch currency in background, don't block login
      fetchCompanyCurrency(userData).catch(error => {
        console.error('Non-critical error fetching currency:', error);
      });
      
      return { user: userData, mustChangePassword: must_change_password };
    } catch (err) {
      console.error('Login error in AuthContext:', err);
      if (!err.userMessage) {
        err.userMessage = getErrorMessage(err);
      }
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      console.error('Registration error:', err);
      if (!err.userMessage) {
        err.userMessage = getErrorMessage(err);
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCompanyCurrency(null);
  };

  const updateUser = async (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    await fetchCompanyCurrency(userData);
  };

  const refreshPermissions = async () => {
    try {
      // Get fresh user data from backend
      const response = await api.get('/users/me');
      const updatedUser = response.data.data;
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      console.error('Error refreshing permissions:', err);
    }
  };

  const handlePasswordChanged = () => {
    setMustChangePassword(false);
    const updatedUser = { ...user, must_change_password: false };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const getDashboardPath = (userData) => {
    if (!userData) return '/login';
    
    if (userData.is_super_admin) {
      return '/superadmin';
    }
    
    if (userData.role?.name === 'Company Admin') {
      return '/company';
    }
    
    const businessType = userData.company?.business_type;
    
    switch (businessType) {
      case 'services':
        return '/services';
      case 'projects':
        return '/projects';
      case 'products':
        return '/products';
      case 'all':
      default:
        return '/allinone';
    }
  };

  const formatCurrency = (amount) => {
    const symbol = companyCurrency?.symbol || '$';
    return `${symbol}${Number(amount || 0).toLocaleString()}`;
  };

  const hasModuleAccess = (module) => {
    if (!user) return false;
    if (user.is_super_admin || user.role?.name === 'Company Admin') return true;
    if (module === 'dashboard') return true;

    const allowedModules = (user.allowedModules && user.allowedModules.length > 0)
      ? user.allowedModules
      : getAllowedModulesForBusinessType(user.company?.business_type || 'all');

    return allowedModules.includes(module);
  };

  const hasPermission = (resource, action) => {
    if (!user) return false;
    if (user.is_super_admin) return true;
    if (user.role?.name === 'Company Admin') return true;
    // Always allow dashboard access
    if (resource === 'dashboard') return true;
    
    // First check if module is allowed
    if (!hasModuleAccess(resource)) {
      return false;
    }
    
    const permissions = user.permissions || user.role?.permissions || {};
    const resourcePerm = permissions[resource];
    
    if (!resourcePerm) return false;
    
    if (Array.isArray(resourcePerm)) {
      return resourcePerm.includes(action);
    }
    
    return resourcePerm[action] || false;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      mustChangePassword, 
      companyCurrency, 
      login, 
      register, 
      logout, 
      updateUser, 
      getDashboardPath, 
      handlePasswordChanged,
      formatCurrency,
      hasPermission,
      hasModuleAccess,
      refreshPermissions
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

