import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SystemManagement = () => {
  const { user } = useAuth();
  const [selectedSystem, setSelectedSystem] = useState(null);

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Management</h1>
          <p className="text-gray-600 mt-2">Choose and manage the system you want to work with</p>
        </div>
        <Link 
          to="/dashboard" 
          className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* SPEMS Card */}
        <div 
          className={`bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 cursor-pointer ${
            selectedSystem === 'SPEMS' ? 'border-blue-500 ring-4 ring-blue-200' : 'border-blue-100'
          }`}
          onClick={() => setSelectedSystem('SPEMS')}
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">SPEMS</h3>
            <p className="text-gray-600 mb-4">Smart Project Earnings Management System</p>
          </div>
          <ul className="space-y-3 mb-6 text-left">
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Project Tracking & Management
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Task Management
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Financial Management
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Analytics & Reports
            </li>
          </ul>
          <Link
            to="/dashboard"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block text-center"
            onClick={(e) => e.stopPropagation()}
          >
            Manage SPEMS
          </Link>
        </div>

        {/* Export-Import & Finance Card */}
        <div 
          className={`bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 cursor-pointer ${
            selectedSystem === 'EIF' ? 'border-purple-500 ring-4 ring-purple-200' : 'border-purple-100'
          }`}
          onClick={() => setSelectedSystem('EIF')}
        >
          <div className="text-center mb-6">
            <div className="text-6xl mb-4">🚢</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Export-Import & Finance</h3>
            <p className="text-gray-600 mb-4">Complete Import/Export & Financial Management</p>
          </div>
          <ul className="space-y-3 mb-6 text-left">
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Import & Export Operations
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Product & Stock Management
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Partner Management (Suppliers/Customers)
            </li>
            <li className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Payment & Expense Tracking
            </li>
          </ul>
          <div className="flex gap-2">
            <Link
              to="/eif/dashboard"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block text-center"
              onClick={(e) => e.stopPropagation()}
            >
              EIF Dashboard
            </Link>
            <Link
              to="/eif/admin"
              className="flex-1 bg-purple-800 hover:bg-purple-900 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block text-center"
              onClick={(e) => e.stopPropagation()}
            >
              EIF Admin
            </Link>
          </div>
        </div>
      </div>

      {selectedSystem && (
        <div className="mt-8 max-w-5xl mx-auto">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <p className="text-blue-800">
              <strong>Selected System:</strong> {selectedSystem === 'SPEMS' ? 'Smart Project Earnings Management System' : 'Export-Import & Finance System'}
            </p>
            <p className="text-blue-700 text-sm mt-2">
              Click the button above to access the management dashboard for the selected system.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemManagement;

