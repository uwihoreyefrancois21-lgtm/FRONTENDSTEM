import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.data.user);
            setIsAuthenticated(true);
            localStorage.setItem('user', JSON.stringify(response.data.user));
          } else {
            clearAuthData();
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          clearAuthData();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return { success: response.success, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    clearAuthData();
  };

  const updatePassword = async (passwordData) => {
    try {
      const response = await authService.updatePassword(passwordData);
      if (response.success) {
        return { success: true, message: 'Password updated successfully' };
      }
      return { 
        success: false, 
        message: response.message || 'Failed to update password' 
      };
    } catch (error) {
      console.error('Update password error:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 
                'An error occurred while updating your password' 
      };
    }
  };

  return (
    <AuthContext.Provider 
      value={{
        user, 
        loading, 
        isAuthenticated,
        login,
        logout,
        register,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
