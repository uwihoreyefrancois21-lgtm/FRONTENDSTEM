
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

const EmployeeManagement = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('employeeManagementTab');
    return saved || 'employees';
  });
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [attendanceFormData, setAttendanceFormData] = useState({
    check_in: '',
    check_out: '',
    status: 'present',
    notes: ''
  });
  const { user, hasPermission } = useAuth();
  
  const menuItems = getMenuItems(user?.company?.business_type, hasPermission);
  const [formData, setFormData] = useState({
    employee_code: '',
    branch_id: '',
    user_id: '',
    first_name: '',
    last_name: '',
    position: '',
    department: '',
    salary_type: '',
    base_salary: '',
    hired_at: '',
    national_id: '',
    address: '',
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem('employeeManagementTab', activeTab);
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [employeesRes, branchesRes, usersRes, attendanceRes] = await Promise.all([
        api.get('/employees'),
        api.get('/branches'),
        api.get('/users'),
        api.get('/attendance'),
      ]);
      console.log('Raw attendance response:', attendanceRes.data);
      const companyEmployees = employeesRes.data.data.filter(e => e.company_id === user?.company_id);
      console.log('Company employees:', companyEmployees);
      setEmployees(companyEmployees);
      setBranches(branchesRes.data.data.filter(b => b.company_id === user?.company_id));
      const usersData = Array.isArray(usersRes.data.data) ? usersRes.data.data : [];
      setUsers(usersData.filter(u => u.company_id === user?.company_id));
      const filteredAttendance = attendanceRes.data.data.filter(a => 
        companyEmployees.some(e => e.id === a.employee_id)
      );
      console.log('Filtered attendance:', filteredAttendance);
      setAttendance(filteredAttendance);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  // Attendance functions
  const getAttendanceEmployeeName = (employeeId) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return 'N/A';
    return `${emp.first_name || ''} ${emp.last_name || ''}`.trim() || 'N/A';
  };

  const getCurrentTime = () => {
    return new Date().toTimeString().split(' ')[0].slice(0, 5);
  };

  const checkIn = async (employeeId) => {
    try {
      const existing = getAttendanceForEmployee(employeeId);
      const payload = {
        company_id: Number(user?.company_id),
        employee_id: Number(employeeId),
        attendance_date: selectedDate,
        check_in: getCurrentTime(),
        status: 'present',
      };
      if (existing) {
        await api.put(`/attendance/${existing.id}`, payload);
      } else {
        await api.post('/attendance', payload);
      }
      toast.success('Check-in successful!');
      fetchData();
    } catch (error) {
      toast.error('Failed to check in');
    }
  };

  const checkOut = async (employeeId) => {
    try {
      console.log('Checking out employee ID:', employeeId);
      const existing = getAttendanceForEmployee(employeeId);
      console.log('Existing attendance for check out:', existing);
      if (existing) {
        const payload = {
          employee_id: Number(employeeId),
          attendance_date: selectedDate,
          check_in: existing.check_in,
          check_out: getCurrentTime(),
          status: 'present',
          notes: existing.notes || null
        };
        console.log('Check out payload:', payload);
        const response = await api.put(`/attendance/${existing.id}`, payload);
        console.log('Check out response:', response);
        toast.success('Check-out successful!');
        fetchData();
      } else {
        toast.error('Please check in first');
      }
    } catch (error) {
      console.error('Error checking out:', error);
      console.error('Error response:', error.response);
      toast.error('Failed to check out');
    }
  };

  const markAbsent = async (employeeId) => {
    try {
      const existing = getAttendanceForEmployee(employeeId);
      const payload = {
        company_id: Number(user?.company_id),
        employee_id: Number(employeeId),
        attendance_date: selectedDate,
        status: 'absent',
      };
      if (existing) {
        await api.put(`/attendance/${existing.id}`, payload);
      } else {
        await api.post('/attendance', payload);
      }
      toast.success('Marked as absent');
      fetchData();
    } catch (error) {
      toast.error('Failed to mark absent');
    }
  };

  const bulkCheckIn = async () => {
    try {
      const employeesToCheckIn = filteredEmployees.filter(emp => {
        const att = getAttendanceForEmployee(emp.id);
        return !att?.check_in && att?.status !== 'absent';
      });
      
      if (employeesToCheckIn.length === 0) {
        toast.info('No employees to check in');
        return;
      }

      const currentTime = getCurrentTime();
      const promises = employeesToCheckIn.map(emp => {
        const existing = getAttendanceForEmployee(emp.id);
        const payload = {
          company_id: Number(user?.company_id),
          employee_id: Number(emp.id),
          attendance_date: selectedDate,
          check_in: currentTime,
          status: 'present',
        };
        if (existing) {
          return api.put(`/attendance/${existing.id}`, payload);
        } else {
          return api.post('/attendance', payload);
        }
      });

      await Promise.all(promises);
      toast.success(`Checked in ${employeesToCheckIn.length} employees`);
      fetchData();
    } catch (error) {
      console.error('Error in bulk check-in:', error);
      toast.error('Failed to check in employees');
    }
  };

  const bulkMarkAbsent = async () => {
    try {
      const employeesToMarkAbsent = filteredEmployees.filter(emp => {
        const att = getAttendanceForEmployee(emp.id);
        return !att?.status && !att?.check_in;
      });
      
      if (employeesToMarkAbsent.length === 0) {
        toast.info('No employees to mark absent');
        return;
      }

      const promises = employeesToMarkAbsent.map(emp => {
        const existing = getAttendanceForEmployee(emp.id);
        const payload = {
          company_id: Number(user?.company_id),
          employee_id: Number(emp.id),
          attendance_date: selectedDate,
          status: 'absent',
        };
        if (existing) {
          return api.put(`/attendance/${existing.id}`, payload);
        } else {
          return api.post('/attendance', payload);
        }
      });

      await Promise.all(promises);
      toast.success(`Marked ${employeesToMarkAbsent.length} employees as absent`);
      fetchData();
    } catch (error) {
      console.error('Error in bulk mark absent:', error);
      toast.error('Failed to mark employees absent');
    }
  };

  const getAttendanceForEmployee = (employeeId) => {
    const normalizeDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      // Use local date to avoid timezone issues
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    const targetDate = normalizeDate(selectedDate);
    console.log('Getting attendance for employee ID:', employeeId, 'target date:', targetDate);
    console.log('All attendance records:', attendance);
    const found = attendance.find(a => {
      const aDate = normalizeDate(a.attendance_date);
      const aEmpId = Number(a.employee_id);
      const targetEmpId = Number(employeeId);
      const match = aEmpId === targetEmpId && aDate === targetDate;
      if (match) {
        console.log('Match found:', a);
      }
      return match;
    });
    console.log('Returning attendance record:', found);
    return found;
  };

  const openAttendanceEditModal = (employeeId) => {
    console.log('Opening attendance edit modal for employee ID:', employeeId);
    const attendanceRecord = getAttendanceForEmployee(employeeId);
    console.log('Attendance record found:', attendanceRecord);
    if (attendanceRecord) {
      setEditingAttendance(attendanceRecord);
      const formData = {
        check_in: attendanceRecord.check_in || '',
        check_out: attendanceRecord.check_out || '',
        status: attendanceRecord.status || 'present',
        notes: attendanceRecord.notes || ''
      };
      console.log('Setting form data:', formData);
      setAttendanceFormData(formData);
      setIsAttendanceModalOpen(true);
    } else {
      console.log('No attendance record found for employee:', employeeId);
    }
  };

  const handleAttendanceUpdate = async (e) => {
    e.preventDefault();
    if (!editingAttendance) return;
    
    try {
      const payload = {
        employee_id: Number(editingAttendance.employee_id),
        attendance_date: selectedDate,
        check_in: attendanceFormData.check_in || null,
        check_out: attendanceFormData.check_out || null,
        status: attendanceFormData.status,
        notes: attendanceFormData.notes || null
      };
      
      console.log('Updating employee attendance with payload:', payload);
      console.log('Attendance ID:', editingAttendance.id);
      
      const response = await api.put(`/attendance/${editingAttendance.id}`, payload);
      console.log('Update response:', response);
      
      toast.success('Attendance updated successfully');
      setIsAttendanceModalOpen(false);
      setEditingAttendance(null);
      fetchData();
    } catch (error) {
      console.error('Error updating attendance:', error);
      console.error('Error response:', error.response);
      toast.error(error.response?.data?.message || 'Failed to update attendance');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const empBranchId = Number(emp.branch_id);
    const selectedBranchId = Number(selectedBranch);
    const matchesBranch = selectedBranch ? empBranchId === selectedBranchId : true;
    const matchesSearch = searchQuery 
      ? getAttendanceEmployeeName(emp.id).toLowerCase().includes(searchQuery.toLowerCase()) || 
        (emp.employee_code || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const empAttendance = getAttendanceForEmployee(emp.id);
    let matchesStatus = true;
    if (selectedStatus) {
      if (selectedStatus === 'present') {
        matchesStatus = empAttendance?.status === 'present' || !!empAttendance?.check_in;
      } else if (selectedStatus === 'absent') {
        matchesStatus = empAttendance?.status === 'absent';
      } else if (selectedStatus === 'not_marked') {
        matchesStatus = !empAttendance?.status && !empAttendance?.check_in;
      }
    }
    return matchesBranch && matchesSearch && matchesStatus;
  });

  // Statistics calculations
  const getAttendanceStats = () => {
    const total = filteredEmployees.length;
    const present = filteredEmployees.filter(emp => {
      const att = getAttendanceForEmployee(emp.id);
      return att?.status === 'present' || att?.check_in;
    }).length;
    const absent = filteredEmployees.filter(emp => {
      const att = getAttendanceForEmployee(emp.id);
      return att?.status === 'absent';
    }).length;
    const notMarked = total - present - absent;
    return { total, present, absent, notMarked };
  };

  const stats = getAttendanceStats();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        company_id: user?.company_id,
        branch_id: formData.branch_id ? Number(formData.branch_id) : null,
        user_id: formData.user_id ? Number(formData.user_id) : null,
        base_salary: formData.base_salary ? Number(formData.base_salary) : null,
      };

      if (editingEmployee) {
        await api.put(`/employees/${editingEmployee.id}`, payload);
        toast.success('Employee updated successfully!');
      } else {
        await api.post('/employees', payload);
        toast.success('Employee created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/employees/${id}`);
        toast.success('Employee deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete employee');
      }
    }
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setFormData({
      employee_code: employee.employee_code || '',
      branch_id: employee.branch_id || '',
      user_id: employee.user_id || '',
      first_name: employee.first_name || '',
      last_name: employee.last_name || '',
      position: employee.position || '',
      department: employee.department || '',
      salary_type: employee.salary_type || '',
      base_salary: employee.base_salary || '',
      hired_at: employee.hired_at || '',
      national_id: employee.national_id || '',
      address: employee.address || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingEmployee(null);
    setFormData({
      employee_code: '',
      branch_id: '',
      user_id: '',
      first_name: '',
      last_name: '',
      position: '',
      department: '',
      salary_type: '',
      base_salary: '',
      hired_at: '',
      national_id: '',
      address: '',
    });
  };

  const getEmployeeName = (employee) => {
    if (employee.user_id) {
      const userObj = users.find(u => u.id === employee.user_id);
      if (userObj) {
        return `${userObj.first_name} ${userObj.last_name}`;
      }
    }
    if (employee.first_name || employee.last_name) {
      return `${employee.first_name || ''} ${employee.last_name || ''}`.trim();
    }
    return 'N/A';
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || 'N/A';
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Employee Management</h1>
        <p className="text-gray-600">Manage your company employees and attendance</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'employees'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Employees
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'attendance'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Attendance
        </button>
      </div>

      {activeTab === 'employees' && (
        <>
          {hasPermission('employees', 'create') && (
            <div className="mb-6 text-right">
              <button
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                + Add New Employee
              </button>
            </div>
          )}

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Employee Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Base Salary</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {employees.map(employee => (
                      <tr key={employee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">{employee.employee_code}</td>
                        <td className="px-6 py-4">{getEmployeeName(employee)}</td>
                        <td className="px-6 py-4">{employee.position}</td>
                        <td className="px-6 py-4">{employee.department}</td>
                        <td className="px-6 py-4">{getBranchName(employee.branch_id)}</td>
                        <td className="px-6 py-4">{employee.base_salary}</td>
                        <td className="px-6 py-4">
                          {hasPermission('employees', 'update') && (
                            <button onClick={() => handleEdit(employee)} className="text-blue-600 hover:text-blue-800 mr-3">
                              Edit
                            </button>
                          )}
                          {hasPermission('employees', 'delete') && (
                            <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-800">
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {editingEmployee ? 'Edit Employee' : 'Create New Employee'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee Code</label>
                      <input
                        type="text"
                        value={formData.employee_code}
                        onChange={e => setFormData({ ...formData, employee_code: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                      <select
                        value={formData.branch_id}
                        onChange={e => setFormData({ ...formData, branch_id: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Branch</option>
                        {branches.map(branch => (
                          <option key={branch.id} value={branch.id}>
                            {branch.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">User Account (Optional)</label>
                      <select
                        value={formData.user_id}
                        onChange={e => setFormData({ ...formData, user_id: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">No User Account</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>
                            {u.first_name} {u.last_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                      <input
                        type="text"
                        value={formData.position}
                        onChange={e => setFormData({ ...formData, position: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Salary Type</label>
                      <select
                        value={formData.salary_type}
                        onChange={e => setFormData({ ...formData, salary_type: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Salary Type</option>
                        <option value="monthly">Monthly</option>
                        <option value="hourly">Hourly</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Base Salary</label>
                      <input
                        type="number"
                        value={formData.base_salary}
                        onChange={e => setFormData({ ...formData, base_salary: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Hire Date</label>
                      <input
                        type="date"
                        value={formData.hired_at}
                        onChange={e => setFormData({ ...formData, hired_at: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                      <input
                        type="text"
                        value={formData.national_id}
                        onChange={e => setFormData({ ...formData, national_id: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      placeholder="District, Sector, Cell, Village"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                    />
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
                      {editingEmployee ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'attendance' && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500">
              <div className="text-sm text-gray-500 mb-1">Total Employees</div>
              <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-green-500">
              <div className="text-sm text-gray-500 mb-1">Present</div>
              <div className="text-3xl font-bold text-green-600">{stats.present}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-red-500">
              <div className="text-sm text-gray-500 mb-1">Absent</div>
              <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-gray-400">
              <div className="text-sm text-gray-500 mb-1">Not Marked</div>
              <div className="text-3xl font-bold text-gray-600">{stats.notMarked}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex gap-3 mb-4">
              {hasPermission('attendance', 'create') && (
                <button
                  onClick={bulkCheckIn}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-150 shadow-sm"
                >
                  <span>⚡</span>
                  Check In All
                </button>
              )}
              {hasPermission('attendance', 'create') && (
                <button
                  onClick={bulkMarkAbsent}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-150 shadow-sm"
                >
                  <span>📋</span>
                  Mark All Absent
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
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
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="not_marked">Not Marked</option>
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
              <p className="text-gray-500">Loading attendance data...</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Employee</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Branch</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEmployees.map(employee => {
                      const empAttendance = getAttendanceForEmployee(employee.id);
                      const branchName = branches.find(b => b.id === employee.branch_id)?.name || 'No Branch';
                      
                      return (
                        <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                                {(employee.first_name?.charAt(0) || 'E').toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{getAttendanceEmployeeName(employee.id)}</div>
                                <div className="text-sm text-gray-500">{employee.employee_code || 'No Code'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {branchName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{employee.position}</td>
                          <td className="px-6 py-4">
                            <span className={`font-mono ${empAttendance?.check_in ? 'text-green-700' : 'text-gray-400'}`}>
                              {empAttendance?.check_in || '--:--'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-mono ${empAttendance?.check_out ? 'text-indigo-700' : 'text-gray-400'}`}>
                              {empAttendance?.check_out || '--:--'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {(empAttendance?.status === 'present' || empAttendance?.check_in) ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <span className="w-2 h-2 mr-2 rounded-full bg-green-500"></span>
                                Present
                              </span>
                            ) : empAttendance?.status === 'absent' ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                <span className="w-2 h-2 mr-2 rounded-full bg-red-500"></span>
                                Absent
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                <span className="w-2 h-2 mr-2 rounded-full bg-gray-400"></span>
                                Not Marked
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              {hasPermission('attendance', 'create') && !empAttendance?.check_in && empAttendance?.status !== 'absent' && (
                                <button
                                  onClick={() => checkIn(employee.id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-150 shadow-sm"
                                >
                                  Check In
                                </button>
                              )}
                              {hasPermission('attendance', 'update') && empAttendance?.check_in && !empAttendance?.check_out && (
                                <button
                                  onClick={() => checkOut(employee.id)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-150 shadow-sm"
                                >
                                  Check Out
                                </button>
                              )}
                              {hasPermission('attendance', 'create') && empAttendance?.status !== 'absent' && !empAttendance?.check_in && (
                                <button
                                  onClick={() => markAbsent(employee.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-150 shadow-sm"
                                >
                                  Mark Absent
                                </button>
                              )}
                              {hasPermission('attendance', 'update') && empAttendance && (
                                <button
                                  onClick={() => openAttendanceEditModal(employee.id)}
                                  className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors duration-150 shadow-sm"
                                >
                                  Edit
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
        </>
      )}

      {/* Attendance Edit Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Edit Attendance</h3>
              <button
                onClick={() => {
                  setIsAttendanceModalOpen(false);
                  setEditingAttendance(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAttendanceUpdate} className="p-6 space-y-4">
              <div>
                <label htmlFor="emp_attendance_check_in" className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
                <input
                  id="emp_attendance_check_in"
                  name="emp_attendance_check_in"
                  type="time"
                  value={attendanceFormData.check_in}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, check_in: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="emp_attendance_check_out" className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
                <input
                  id="emp_attendance_check_out"
                  name="emp_attendance_check_out"
                  type="time"
                  value={attendanceFormData.check_out}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, check_out: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="emp_attendance_status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="emp_attendance_status"
                  name="emp_attendance_status"
                  value={attendanceFormData.status}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <div>
                <label htmlFor="emp_attendance_notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  id="emp_attendance_notes"
                  name="emp_attendance_notes"
                  value={attendanceFormData.notes}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, notes: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any notes..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAttendanceModalOpen(false);
                    setEditingAttendance(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Attendance
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

export default EmployeeManagement;
