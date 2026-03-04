import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import WhatsAppButton from './WhatsAppButton';

const EIFLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('system');
    navigate('/eif/login');
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
                <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold text-lg mr-3">
                  {(user?.owner_name || user?.company_name || 'U').charAt(0).toUpperCase()}
                </div>
                <span className="text-2xl">🚢</span>
                <h1 className="text-2xl font-bold text-purple-600 ml-2">EIF</h1>
                <span className="hidden sm:inline-block ml-3 text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full font-medium">
                  Export-Import & Finance
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4 lg:space-x-8">
                <Link
                  to="/eif/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                    isActive('/eif/dashboard') 
                      ? 'border-purple-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/eif/products"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                    isActive('/eif/products') 
                      ? 'border-purple-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Products
                </Link>
                <Link
                  to="/eif/partners"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                    isActive('/eif/partners') 
                      ? 'border-purple-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Partners
                </Link>
                <Link
                  to="/eif/operations"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                    isActive('/eif/operations') 
                      ? 'border-purple-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Operations
                </Link>
                <Link
                  to="/eif/stock"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                    isActive('/eif/stock') 
                      ? 'border-purple-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Stock
                </Link>
                <Link
                  to="/eif/payments"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                    isActive('/eif/payments') 
                      ? 'border-purple-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Payments
                </Link>
                <Link
                  to="/eif/expenses"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                    isActive('/eif/expenses') 
                      ? 'border-purple-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Expenses
                </Link>
                <Link
                  to="/eif/reports"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                    isActive('/eif/reports') 
                      ? 'border-purple-500 text-gray-900' 
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Reports
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
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
              <div className="flex flex-col space-y-2 pt-4 max-h-96 overflow-y-auto">
                <Link
                  to="/eif/dashboard"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/eif/dashboard') 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/eif/products"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/eif/products') 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Products
                </Link>
                <Link
                  to="/eif/partners"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/eif/partners') 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Partners
                </Link>
                <Link
                  to="/eif/operations"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/eif/operations') 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Operations
                </Link>
                <Link
                  to="/eif/stock"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/eif/stock') 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Stock
                </Link>
                <Link
                  to="/eif/payments"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/eif/payments') 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Payments
                </Link>
                <Link
                  to="/eif/expenses"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/eif/expenses') 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Expenses
                </Link>
                <Link
                  to="/eif/reports"
                  onClick={closeMobileMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive('/eif/reports') 
                      ? 'bg-purple-100 text-purple-900' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Reports
                </Link>
                <div className="border-t border-gray-200 pt-2">
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

export default EIFLayout;

