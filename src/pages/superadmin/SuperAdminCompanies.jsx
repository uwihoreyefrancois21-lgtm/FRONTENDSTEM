
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

const menuItems = [
  { path: '/superadmin', label: 'Dashboard', icon: '🏠' },
  { path: '/superadmin/companies', label: 'Companies', icon: '🏢' },
  { path: '/superadmin/plans', label: 'Plans', icon: '📋' },
  { path: '/superadmin/users', label: 'Users', icon: '👥' },
  { path: '/superadmin/branches', label: 'Branches', icon: '🏗️' },
  { path: '/superadmin/reports', label: 'Reports', icon: '📈' },
];

const SuperAdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [plans, setPlans] = useState([]);
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Pagination, search, filter
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
  const itemsPerPage = 2;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [companiesRes, plansRes, usersRes, branchesRes] = await Promise.all([
        api.get('/companies'),
        api.get('/subscription_plans'),
        api.get('/users'),
        api.get('/branches'),
      ]);
      setCompanies(companiesRes.data.data);
      setPlans(plansRes.data.data);
      setUsers(usersRes.data.data?.data || usersRes.data.data);
      setBranches(branchesRes.data.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getCompanyUsersCount = (companyId) => {
    return users.filter(u => u.company_id === companyId).length;
  };

  const getCompanyBranchesCount = (companyId) => {
    return branches.filter(b => b.company_id === companyId).length;
  };

  const getCompanyAdmins = (companyId) => {
    return users.filter(u => u.company_id === companyId);
  };

  // Filter and search companies
  const filteredCompanies = companies.filter(company => {
    const matchesSearch = 
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (company.email && company.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && company.subscription_active) || 
      (filterStatus === 'inactive' && !company.subscription_active);

    return matchesSearch && matchesFilter;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCompanies = filteredCompanies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  const handleActivateSubscription = async (e) => {
    e.preventDefault();
    try {
      await api.post('/subscriptions/admin-activate', {
        company_id: selectedCompany.id,
        plan_id: selectedPlanId,
      });
      toast.success('Subscription activated successfully');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to activate subscription');
    }
  };

  const handleDeactivateSubscription = async (companyId) => {
    if (window.confirm('Are you sure you want to deactivate this company\'s subscription?')) {
      try {
        await api.post('/subscriptions/admin-deactivate', {
          company_id: companyId,
        });
        toast.success('Subscription deactivated successfully');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to deactivate subscription');
      }
    }
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Company Management</h1>
        <p className="text-gray-600">Manage all companies and their subscriptions</p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">All Companies</option>
          <option value="active">Active Subscriptions</option>
          <option value="inactive">Inactive Subscriptions</option>
        </select>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 mb-6">
            {currentCompanies.map(company => (
              <div key={company.id} className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{company.name}</h3>
                    <p className="text-gray-600">{company.email}</p>
                    {company.phone && <p className="text-sm text-gray-500">Phone: {company.phone}</p>}
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    company.subscription_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {company.subscription_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-500">Users</p>
                    <p className="text-xl font-bold text-gray-800">{getCompanyUsersCount(company.id)}</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-500">Branches</p>
                    <p className="text-xl font-bold text-gray-800">{getCompanyBranchesCount(company.id)}</p>
                  </div>
                  <div className="border rounded-lg p-3">
                    <p className="text-sm text-gray-500">Admins</p>
                    <p className="text-sm text-gray-800">
                      {getCompanyAdmins(company.id).slice(0, 2).map(u => `${u.first_name} ${u.last_name}`).join(', ')}
                      {getCompanyAdmins(company.id).length > 2 && ` + ${getCompanyAdmins(company.id).length - 2} more`}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedCompany(company);
                      setSelectedPlanId(plans.length > 0 ? plans[0].id : '');
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Manage Subscription
                  </button>
                  {company.subscription_active && (
                    <button
                      onClick={() => handleDeactivateSubscription(company.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white' 
                      : 'border hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Subscription Modal */}
      {isModalOpen && selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Manage Subscription for {selectedCompany.name}
            </h2>
            <form onSubmit={handleActivateSubscription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Plan</label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select a plan</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - {plan.price} {plan.currency || 'RWF'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Activate Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </DashboardLayout>
  );
};

export default SuperAdminCompanies;
