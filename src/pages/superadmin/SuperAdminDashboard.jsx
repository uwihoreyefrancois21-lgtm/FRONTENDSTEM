
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

const SuperAdminDashboard = () => {
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const [showAll, setShowAll] = useState(false);

  // Helper function to filter companies
  const getFilteredCompanies = () => {
    let filtered = (companies || []);
    
    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.name?.toLowerCase().includes(lowerSearch) ||
        c.email?.toLowerCase().includes(lowerSearch)
      );
    }
    
    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(c => c.subscription_active);
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(c => !c.subscription_active);
    }
    
    return filtered;
  };

  const menuItems = [
    { path: '/superadmin', label: 'Dashboard', icon: '🏠' },
    { path: '/superadmin/companies', label: 'Companies', icon: '🏢' },
    { path: '/superadmin/plans', label: 'Plans', icon: '📋' },
    { path: '/superadmin/users', label: 'Users', icon: '👥' },
    { path: '/superadmin/branches', label: 'Branches', icon: '🏗️' },
    { path: '/superadmin/activity-logs', label: 'Activity Logs', icon: '📜' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [companiesRes, plansRes, branchesRes, usersRes] = await Promise.all([
        api.get('/companies'),
        api.get('/subscription_plans'),
        api.get('/branches'),
        api.get('/users'),
      ]);
      setCompanies(companiesRes.data.data);
      setPlans(plansRes.data.data);
      setBranches(branchesRes.data.data);
      // Users API returns paginated response: { data: { data: [users], pagination: {} } }
      setUsers(usersRes.data.data.data || usersRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Super Admin Dashboard</h1>
        <p className="text-gray-600">Manage the entire NegTradeHub platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{(companies || []).length}</div>
          <div className="text-gray-600">Total Companies</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-green-600">{(companies || []).filter(c => c.subscription_active).length}</div>
          <div className="text-gray-600">Active Subscriptions</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">{(plans || []).length}</div>
          <div className="text-gray-600">Subscription Plans</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-orange-600">0</div>
          <div className="text-gray-600">Pending Payments</div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Company Statistics</h2>
        
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search companies by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowAll(false);
            }}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setShowAll(false);
            }}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {loading ? (
          <div className="animate-pulse">Loading...</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="pb-3 font-semibold">Company Name</th>
                    <th className="pb-3 font-semibold">Email</th>
                    <th className="pb-3 font-semibold">Branches</th>
                    <th className="pb-3 font-semibold">Users</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = getFilteredCompanies();
                    const displayed = showAll ? filtered : filtered.slice(0, 5);
                    
                    return displayed.map((company) => {
                      const companyBranches = (branches || []).filter(b => Number(b.company_id) === Number(company.id));
                      const companyUsers = (users || []).filter(u => Number(u.company_id) === Number(company.id));
                      return (
                        <tr key={company.id} className="border-b">
                          <td className="py-3 font-medium">{company.name}</td>
                          <td className="py-3 text-gray-600">{company.email}</td>
                          <td className="py-3">
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                              {companyBranches.length}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                              {companyUsers.length}
                            </span>
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-sm font-semibold ${
                              company.subscription_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {company.subscription_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

            {/* Show More Button */}
            {(() => {
              const filtered = getFilteredCompanies();
              if (filtered.length > 5) {
                return (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setShowAll(!showAll)}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      {showAll ? 'Show Less' : `Show More (${filtered.length - 5} more)`}
                    </button>
                  </div>
                );
              }
              return null;
            })()}
          </>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Subscription Plans</h2>
        {loading ? (
          <div className="animate-pulse">Loading...</div>
        ) : (
          <div className="space-y-4">
            {(plans || []).map((plan) => (
              <div key={plan.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{plan.name}</div>
                  <div className="text-lg font-bold text-blue-600">{plan.price} {plan.currency || 'RWF'}</div>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {plan.duration_days} days • {plan.max_users} users • {plan.max_branches} branches
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer />
    </DashboardLayout>
  );
};

export default SuperAdminDashboard;
