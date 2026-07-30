
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = (businessType, hasPermission) => {
  const baseItems = [
    { path: '/company', label: 'Dashboard', icon: '🏠', resource: 'dashboard' },
    { path: '/company/users', label: 'Users', icon: '👥', resource: 'users' },
    { path: '/company/employees', label: 'Employees', icon: '👨‍💼', resource: 'employees' },
    { path: '/company/salaries', label: 'Salaries', icon: '💰', resource: 'salaries' },
  ];

  let businessItems = [];
  if (businessType === 'services') {
    businessItems = [{ path: '/services', label: 'Manage Services', icon: '💼', resource: 'services' }];
  } else if (businessType === 'products') {
    businessItems = [{ path: '/products', label: 'Manage Products', icon: '🛒', resource: 'products' }];
  } else if (businessType === 'projects') {
    businessItems = [{ path: '/projects', label: 'Manage Projects', icon: '📊', resource: 'projects' }];
  } else {
    businessItems = [{ path: '/allinone', label: 'All-in-One', icon: '🚀', resource: 'dashboard' }];
  }
  
  return [...baseItems, ...businessItems].filter(item => hasPermission(item.resource, 'read'));
};

const SalaryManagement = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().split('T')[0].slice(0, 7));
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [currentSalary, setCurrentSalary] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [transactionId, setTransactionId] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const { user, hasPermission } = useAuth();
  const menuItems = getMenuItems(user?.company?.business_type, hasPermission);

  // Check if current date is near end of month (last 3 days)
  const isMonthEnd = () => {
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return lastDay - now.getDate() <= 3;
  };

  const fetchData = async () => {
    try {
      const [employeesRes, branchesRes] = await Promise.all([
        api.get('/employees'),
        api.get('/branches'),
      ]);
      
      const companyEmployees = employeesRes.data.data
        .filter(e => e.company_id === user?.company_id)
        .map(e => ({
          ...e,
          id: Number(e.id),
          branch_id: Number(e.branch_id)
        }));
        
      const companyBranches = branchesRes.data.data
        .filter(b => b.company_id === user?.company_id)
        .map(b => ({
          ...b,
          id: Number(b.id)
        }));
        
      setEmployees(companyEmployees);
      setBranches(companyBranches);
      
      const salariesRes = await api.get('/salaries');
      const companySalaries = salariesRes.data.data
        .filter(s => s.company_id === user?.company_id)
        .map(s => ({
          ...s,
          id: Number(s.id),
          employee_id: Number(s.employee_id)
        }));
        
      setSalaries(companySalaries);
    } catch (error) {
      console.error('=== Error loading salary data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getEmployeeName = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return 'N/A';
    return `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'N/A';
  };

  const getEmployeeCode = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    return emp?.employee_code || 'N/A';
  };

  const formatRateType = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return 'N/A';
    const type = emp.salary_type || 'monthly';
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const generateSalary = async (employeeId) => {
    try {
      await api.post('/salaries/generate', {
        companyId: user?.company_id,
        employeeId: employeeId,
        salaryMonth: selectedMonth + '-01',
      });
      toast.success('Salary generated successfully');
      fetchData();
    } catch (error) {
      console.error('Error generating salary:', error.response?.data || error.message);
      toast.error('Failed to generate salary');
    }
  };

  const openPaymentModal = (salary) => {
    setCurrentSalary(salary);
    setPaymentMethod('cash');
    setTransactionId('');
    setPaymentNotes('');
    setIsPaymentModalOpen(true);
  };

  const markAsPaid = async () => {
    try {
      await api.put(`/salaries/${currentSalary.id}/mark-paid`, {
        payment_method: paymentMethod,
        transaction_id: transactionId || null,
        notes: paymentNotes || null,
      });
      toast.success('Salary marked as paid');
      setIsPaymentModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error marking as paid:', error.response?.data || error.message);
      toast.error('Failed to mark as paid');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    // Filter by branch
    const empBranchId = Number(emp.branch_id);
    const selectedBranchId = Number(selectedBranch);
    const matchesBranch = selectedBranch ? empBranchId === selectedBranchId : true;
    
    // Filter by search query
    const matchesSearch = searchQuery 
      ? getEmployeeName(emp.id).toLowerCase().includes(searchQuery.toLowerCase()) || 
        (emp.employee_code || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    
    // Filter by status
    const empSalary = salaries.find(s => s.employee_id === emp.id && s.salary_month?.startsWith(selectedMonth));
    let matchesStatus = true;
    if (selectedStatus) {
      if (selectedStatus === 'paid') {
        matchesStatus = empSalary?.is_paid;
      } else if (selectedStatus === 'unpaid') {
        matchesStatus = !empSalary?.is_paid && !!empSalary;
      } else if (selectedStatus === 'not_generated') {
        matchesStatus = !empSalary;
      }
    }
    
    return matchesBranch && matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Salary Management</h1>
            <p className="text-gray-600">Manage employee salaries</p>
          </div>
          {isMonthEnd() && (
            <div className="flex items-center gap-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg">
              <span className="text-xl">⚠️</span>
              <span className="font-medium">Month End - Process Salaries!</span>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Branches</option>
              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">All Status</option>
              <option value="not_generated">Not Generated</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or code..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading salary data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Emp. Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Branch</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rate Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Basic Salary</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Deduction</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total Salary</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Method</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredEmployees.map(employee => {
                  const empSalary = salaries.find(s => s.employee_id === employee.id && s.salary_month?.startsWith(selectedMonth));
                  const branchName = branches.find(b => b.id === employee.branch_id)?.name || 'No Branch';
                  return (
                    <tr key={employee.id} className={`hover:bg-gray-50 transition-colors duration-150 ${isMonthEnd() && !empSalary?.is_paid ? 'bg-red-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                            {(employee.first_name?.charAt(0) || 'E').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{getEmployeeName(employee.id)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm text-gray-600">
                          {getEmployeeCode(employee.id)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        {branchName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {formatRateType(employee.id)}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-700">
                        {empSalary?.basic_salary || employee.base_salary || '-'}
                      </td>
                      <td className="px-6 py-4 font-medium text-red-600">
                        {empSalary?.deduction || '-'}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-700">
                        {empSalary?.total_salary || '-'}
                      </td>
                      <td className="px-6 py-4">
                        {empSalary?.payment_method ? (
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-xs capitalize">
                            {empSalary.payment_method}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {empSalary?.is_paid ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <span className="w-2 h-2 mr-2 rounded-full bg-green-500"></span>
                            Paid
                          </span>
                        ) : empSalary ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <span className="w-2 h-2 mr-2 rounded-full bg-yellow-500"></span>
                            Unpaid
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            <span className="w-2 h-2 mr-2 rounded-full bg-gray-400"></span>
                            Not Generated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {hasPermission('salaries', 'create') && !empSalary && (
                            <button
                              onClick={() => generateSalary(employee.id)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-150 shadow-sm"
                            >
                              Generate Salary
                            </button>
                          )}
                          {hasPermission('salaries', 'update') && empSalary && !empSalary?.is_paid && (
                            <button
                              onClick={() => openPaymentModal(empSalary)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-150 shadow-sm"
                            >
                              Mark as Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredEmployees.length === 0 && (
            <div className="p-12 text-center text-gray-500">
              No employees found matching your filters.
            </div>
          )}
        </div>
      )}

      {/* Payment Modal */}
      {isPaymentModalOpen && currentSalary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Mark Salary as Paid</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="check">Check</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID (Optional)</label>
                <input
                  type="text"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder="Enter transaction ID or reference number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                <textarea
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Enter any additional notes"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={markAsPaid}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-150"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </DashboardLayout>
  );
};

export default SalaryManagement;
