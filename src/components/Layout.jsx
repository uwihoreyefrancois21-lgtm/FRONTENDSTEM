import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WhatsAppButton from './WhatsAppButton';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-primary-600">SPEMS</h1>
                <span className="ml-3 text-xs px-2 py-1 bg-primary-100 text-primary-800 rounded-full font-medium">
                  {user?.role === 'admin' ? 'Admin' : 'User'}
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/projects') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/transactions"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/transactions') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Transactions
                </Link>
                <Link
                  to="/reports"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/reports') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Reports
                </Link>
                {isAdmin && (
                  <Link
                    to="/user-management"
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      isActive('/user-management') 
                        ? 'border-primary-500 text-gray-900' 
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    Manage Users
                  </Link>
                )}
                <Link
                  to="/profile-settings"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/profile-settings') 
                      ? 'border-primary-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Profile Settings
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAdmin && (
                <Link
                  to="/system-management"
                  className={`hidden sm:inline-flex text-sm font-medium ${
                    isActive('/system-management') 
                      ? 'text-primary-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  System Management
                </Link>
              )}
              <span className="hidden sm:inline text-sm text-gray-700">{user?.username}</span>
              <button
                onClick={handleLogout}
                className="hidden sm:inline-block bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
              {/* Hamburger Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                <svg
                  className={`h-6 w-6 transform transition-transform ${mobileMenuOpen ? 'rotate-90' : ''}`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden pb-4 border-t border-gray-200">
              <div className="flex flex-col space-y-2 pt-4">
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/dashboard') 
                      ? 'bg-primary-100 text-primary-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/projects"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/projects') 
                      ? 'bg-primary-100 text-primary-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Projects
                </Link>
                <Link
                  to="/transactions"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/transactions') 
                      ? 'bg-primary-100 text-primary-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Transactions
                </Link>
                <Link
                  to="/reports"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/reports') 
                      ? 'bg-primary-100 text-primary-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Reports
                </Link>
                {isAdmin && (
                  <Link
                    to="/user-management"
                    onClick={closeMobileMenu}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/user-management') 
                        ? 'bg-primary-100 text-primary-900' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Manage Users
                  </Link>
                )}
                <Link
                  to="/profile-settings"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/profile-settings') 
                      ? 'bg-primary-100 text-primary-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Profile Settings
                </Link>
                {isAdmin && (
                  <Link
                    to="/system-management"
                    onClick={closeMobileMenu}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isActive('/system-management') 
                        ? 'bg-primary-100 text-primary-900' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    System Management
                  </Link>
                )}
                <div className="border-t border-gray-200 pt-2">
                  <p className="px-3 py-2 text-sm text-gray-700">User: {user?.username}</p>
                  <button
                    onClick={() => {
                      handleLogout();
                      closeMobileMenu();
                    }}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-500 hover:bg-red-600 text-white"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <WhatsAppButton />
    </div>
  );
};

export default Layout;

