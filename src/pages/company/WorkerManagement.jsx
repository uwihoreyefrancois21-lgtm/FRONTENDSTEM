
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import { useCallback } from 'react';

const getMenuItems = (businessType, hasPermission) => {
  const baseItems = [
    { path: '/company', label: 'Dashboard', icon: '🏠', resource: 'dashboard' },
    { path: '/company/users', label: 'Users', icon: '👥', resource: 'users' },
    { path: '/company/employees', label: 'Employees', icon: '👨‍💼', resource: 'employees' },
    { path: '/company/workers', label: 'Workers', icon: '👷', resource: 'workers' },
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

const WorkerManagement = () => {
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('workerManagementTab');
    return saved || 'workers';
  });
  const [workers, setWorkers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [workerAttendance, setWorkerAttendance] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(null);
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
    worker_code: '',
    branch_id: '',
    first_name: '',
    last_name: '',
    position: '',
    phone: '',
    national_id: '',
    address: '',
    daily_salary: '',
  });

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    localStorage.setItem('workerManagementTab', activeTab);
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const [workersRes, branchesRes, attendanceRes] = await Promise.all([
        api.get('/workers'),
        api.get('/branches'),
        api.get('/worker-attendance'),
      ]);
      setWorkers(workersRes.data.data || []);
      setBranches(branchesRes.data.data || []);
      setWorkerAttendance(attendanceRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  // Attendance functions
  const getAttendanceWorkerName = (workerId) => {
    const w = workers.find(w => w.id === workerId);
    if (!w) return 'N/A';
    return `${w.first_name || ''} ${w.last_name || ''}`.trim() || 'N/A';
  };

  const getCurrentTime = () => {
    return new Date().toTimeString().split(' ')[0].slice(0, 5);
  };

  const checkIn = async (workerId) => {
    try {
      const existing = getAttendanceForWorker(workerId);
      const payload = {
        worker_id: Number(workerId),
        attendance_date: selectedDate,
        check_in: getCurrentTime(),
        status: 'present',
      };
      
      let response;
      if (existing) {
        response = await api.put(`/worker-attendance/${existing.id}`, payload);
      } else {
        response = await api.post('/worker-attendance', payload);
      }
      toast.success('Check-in successful!');
      fetchData();
    } catch (error) {
      console.error('Error checking in worker:', error);
      toast.error(error.response?.data?.message || 'Failed to check in');
    }
  };

  const checkOut = async (workerId) => {
    try {
      const existing = getAttendanceForWorker(workerId);
      if (existing) {
        const payload = {
          worker_id: Number(workerId),
          attendance_date: selectedDate,
          check_in: existing.check_in,
          check_out: getCurrentTime(),
          status: existing.status || 'present',
        };
        await api.put(`/worker-attendance/${existing.id}`, payload);
        toast.success('Check-out successful!');
        fetchData();
      } else {
        toast.error('Please check in first');
      }
    } catch (error) {
      console.error('Error checking out worker:', error);
      toast.error('Failed to check out');
    }
  };

  const markAbsent = async (workerId) => {
    try {
      const existing = getAttendanceForWorker(workerId);
      const payload = {
        worker_id: Number(workerId),
        attendance_date: selectedDate,
        status: 'absent',
      };
      
      let response;
      if (existing) {
        response = await api.put(`/worker-attendance/${existing.id}`, payload);
      } else {
        response = await api.post('/worker-attendance', payload);
      }
      toast.success('Marked as absent');
      fetchData();
    } catch (error) {
      console.error('Error marking worker absent:', error);
      toast.error(error.response?.data?.message || 'Failed to mark absent');
    }
  };

  const openAttendanceEditModal = (workerId) => {
    const attendance = getAttendanceForWorker(workerId);
    if (attendance) {
      setEditingAttendance(attendance);
      setAttendanceFormData({
        check_in: attendance.check_in || '',
        check_out: attendance.check_out || '',
        status: attendance.status || 'present',
        notes: attendance.notes || ''
      });
      setIsAttendanceModalOpen(true);
    }
  };

  const handleAttendanceUpdate = async (e) => {
    e.preventDefault();
    if (!editingAttendance) return;
    
    try {
      const payload = {
        worker_id: Number(editingAttendance.worker_id),
        attendance_date: selectedDate,
        check_in: attendanceFormData.check_in || null,
        check_out: attendanceFormData.check_out || null,
        status: attendanceFormData.status,
        notes: attendanceFormData.notes || null
      };
      
      await api.put(`/worker-attendance/${editingAttendance.id}`, payload);
      toast.success('Attendance updated successfully');
      setIsAttendanceModalOpen(false);
      setEditingAttendance(null);
      fetchData();
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast.error(error.response?.data?.message || 'Failed to update attendance');
    }
  };

  const getAttendanceForWorker = (workerId) => {
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
    const result = workerAttendance.find(a => {
      const aDate = normalizeDate(a.attendance_date);
      const aWorkerId = Number(a.worker_id);
      const targetWorkerId = Number(workerId);
      return aWorkerId === targetWorkerId && aDate === targetDate;
    });
    return result;
  };

  const filteredWorkers = workers.filter(w => {
    const wBranchId = Number(w.branch_id);
    const selectedBranchId = Number(selectedBranch);
    const matchesBranch = selectedBranch ? wBranchId === selectedBranchId : true;
    const matchesSearch = searchQuery 
      ? getWorkerName(w).toLowerCase().includes(searchQuery.toLowerCase()) || 
        (w.worker_code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (w.phone || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesBranch && matchesSearch;
  });

  const filteredWorkersAttendance = workers.filter(w => {
    const wBranchId = Number(w.branch_id);
    const selectedBranchId = Number(selectedBranch);
    const matchesBranch = selectedBranch ? wBranchId === selectedBranchId : true;
    const matchesSearch = searchQuery 
      ? getAttendanceWorkerName(w.id).toLowerCase().includes(searchQuery.toLowerCase()) || 
        (w.worker_code || '').toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const wAttendance = getAttendanceForWorker(w.id);
    let matchesStatus = true;
    if (selectedStatus) {
      if (selectedStatus === 'present') {
        matchesStatus = wAttendance?.status === 'present' || !!wAttendance?.check_in;
      } else if (selectedStatus === 'absent') {
        matchesStatus = wAttendance?.status === 'absent';
      } else if (selectedStatus === 'not_marked') {
        matchesStatus = !wAttendance?.status && !wAttendance?.check_in;
      }
    }
    return matchesBranch && matchesSearch && matchesStatus;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { 
        ...formData, 
        branch_id: formData.branch_id ? Number(formData.branch_id) : null,
        daily_salary: Number(formData.daily_salary) || 0,
      };

      if (editingWorker) {
        await api.put(`/workers/${editingWorker.id}`, payload);
        toast.success('Worker updated successfully!');
      } else {
        await api.post('/workers', payload);
        toast.success('Worker created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating/updating worker:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      setDeleting(id);
      try {
        await api.delete(`/workers/${id}`);
        toast.success('Worker deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete worker');
      } finally {
        setDeleting(null);
      }
    }
  };

  const handleEdit = (worker) => {
    setEditingWorker(worker);
    setFormData({
      worker_code: worker.worker_code || '',
      branch_id: worker.branch_id || '',
      first_name: worker.first_name || '',
      last_name: worker.last_name || '',
      position: worker.position || '',
      phone: worker.phone || '',
      national_id: worker.national_id || '',
      address: worker.address || '',
      daily_salary: worker.daily_salary || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingWorker(null);
    setFormData({
      worker_code: '',
      branch_id: '',
      first_name: '',
      last_name: '',
      position: '',
      phone: '',
      national_id: '',
      address: '',
      daily_salary: '',
    });
  };

  const getWorkerName = (worker) => {
    if (worker.first_name || worker.last_name) {
      return `${worker.first_name || ''} ${worker.last_name || ''}`.trim();
    }
    return 'N/A';
  };

  const getBranchName = (branchId) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || 'N/A';
  };

  // Statistics calculations
  const getAttendanceStats = () => {
    const total = filteredWorkersAttendance.length;
    const present = filteredWorkersAttendance.filter(w => {
      const att = getAttendanceForWorker(w.id);
      return att?.status === 'present' || att?.check_in;
    }).length;
    const absent = filteredWorkersAttendance.filter(w => {
      const att = getAttendanceForWorker(w.id);
      return att?.status === 'absent';
    }).length;
    const notMarked = total - present - absent;
    return { total, present, absent, notMarked };
  };

  const stats = getAttendanceStats();

  // Bulk actions
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const bulkCheckIn = async () => {
    const notCheckedIn = filteredWorkersAttendance.filter(w => {
      const att = getAttendanceForWorker(w.id);
      return !att?.check_in && att?.status !== 'absent';
    });
    
    if (notCheckedIn.length === 0) {
      toast.info('No workers to check in');
      return;
    }

    if (window.confirm(`Check in ${notCheckedIn.length} workers?`)) {
      setBulkProcessing(true);
      try {
        await Promise.all(notCheckedIn.map(w => {
          const payload = {
            company_id: Number(user?.company_id),
            worker_id: Number(w.id),
            attendance_date: selectedDate,
            check_in: getCurrentTime(),
            status: 'present',
          };
          return api.post('/worker-attendance', payload);
        }));
        toast.success(`Checked in ${notCheckedIn.length} workers successfully!`);
        fetchData();
      } catch (error) {
        toast.error('Failed to bulk check in');
      } finally {
        setBulkProcessing(false);
      }
    }
  };

  const bulkMarkAbsent = async () => {
    const notMarked = filteredWorkersAttendance.filter(w => {
      const att = getAttendanceForWorker(w.id);
      return !att?.status && !att?.check_in;
    });
    
    if (notMarked.length === 0) {
      toast.info('No workers to mark absent');
      return;
    }

    if (window.confirm(`Mark ${notMarked.length} workers as absent?`)) {
      setBulkProcessing(true);
      try {
        await Promise.all(notMarked.map(w => {
          const payload = {
            company_id: Number(user?.company_id),
            worker_id: Number(w.id),
            attendance_date: selectedDate,
            status: 'absent',
          };
          return api.post('/worker-attendance', payload);
        }));
        toast.success(`Marked ${notMarked.length} workers as absent!`);
        fetchData();
      } catch (error) {
        toast.error('Failed to bulk mark absent');
      } finally {
        setBulkProcessing(false);
      }
    }
  };

  // Keyboard shortcuts for attendance
  useEffect(() => {
    if (activeTab !== 'attendance') return;

    const handleKeyPress = (e) => {
      // Only trigger if not typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        bulkCheckIn();
      } else if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        bulkMarkAbsent();
      } else if (e.key === '?' || e.key === '/') {
        e.preventDefault();
        toast.info('Shortcuts: C = Check In All, A = Mark All Absent', { autoClose: 3000 });
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [activeTab, filteredWorkersAttendance]);

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Worker Management</h1>
        <p className="text-gray-600">Manage your company workers and their attendance</p>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab('workers')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'workers'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Workers
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

      {activeTab === 'workers' && (
        <>
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

          {hasPermission('workers', 'create') && (
            <div className="mb-6 text-right">
              <button
                onClick={() => { resetForm(); setIsModalOpen(true); }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                + Add New Worker
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
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Worker Code</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Position</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Branch</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredWorkers.map(worker => (
                      <tr key={worker.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {worker.worker_code || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3 text-sm">
                              {(worker.first_name?.charAt(0) || 'W').toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">{getWorkerName(worker)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{worker.position || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-700">{worker.phone || 'N/A'}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            {worker.branch_name || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {hasPermission('workers', 'update') && (
                            <button 
                              onClick={() => handleEdit(worker)} 
                              className="text-blue-600 hover:text-blue-800 mr-3 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={deleting === worker.id}
                            >
                              Edit
                            </button>
                          )}
                          {hasPermission('workers', 'delete') && (
                            <button 
                              onClick={() => handleDelete(worker.id)} 
                              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={deleting === worker.id}
                            >
                              {deleting === worker.id ? 'Deleting...' : 'Delete'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {filteredWorkers.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                          No workers found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {filteredWorkers.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  No workers found matching your filters.
                </div>
              )}
            </div>
          )}

          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-xl p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {editingWorker ? 'Edit Worker' : 'Create New Worker'}
                </h2>
                <p className="text-gray-500 text-sm mb-6">Fill in the worker details below. Fields marked with * are required.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.first_name}
                          onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                          placeholder="Enter first name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.last_name}
                          onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          required
                          placeholder="Enter last name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="e.g., +250 788 123 456"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">National ID</label>
                        <input
                          type="text"
                          value={formData.national_id}
                          onChange={e => setFormData({ ...formData, national_id: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Enter national ID"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Work Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Work Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Worker Code</label>
                        <input
                          type="text"
                          value={formData.worker_code}
                          onChange={e => setFormData({ ...formData, worker_code: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="e.g., W-001"
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
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                        <input
                          type="text"
                          value={formData.position}
                          onChange={e => setFormData({ ...formData, position: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="e.g., Mason, Carpenter, Electrician"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Daily Salary <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={formData.daily_salary}
                          onChange={e => setFormData({ ...formData, daily_salary: e.target.value })}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="0.00"
                          required
                          min="0"
                          step="0.01"
                        />
                        <p className="text-xs text-gray-500 mt-1">Daily rate used for attendance-based payment calculation</p>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4 pb-2 border-b">Address</h3>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Address</label>
                      <textarea
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={3}
                        placeholder="District, Sector, Cell, Village"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={submitting}
                    >
                      {submitting ? 'Processing...' : (editingWorker ? 'Update Worker' : 'Create Worker')}
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
              <div className="text-sm text-gray-500 mb-1">Total Workers</div>
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

          {/* Bulk Actions */}
          {hasPermission('worker_attendance', 'create') && (
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex gap-3 items-center justify-between">
              <div className="flex gap-3">
                <button
                  onClick={bulkCheckIn}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={bulkProcessing}
                >
                  <span>⚡</span> {bulkProcessing ? 'Processing...' : 'Check In All'}
                </button>
                <button
                  onClick={bulkMarkAbsent}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={bulkProcessing}
                >
                  <span>📋</span> {bulkProcessing ? 'Processing...' : 'Mark All Absent'}
                </button>
              </div>
              <div className="text-sm text-gray-500">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">C</span> Check In All
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono ml-2">A</span> Mark All Absent
                <span className="px-2 py-1 bg-gray-100 rounded text-xs font-mono ml-2">?</span> Help
              </div>
            </div>
          )}

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
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Worker</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Branch</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Position</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Check In</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Check Out</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredWorkersAttendance.map(worker => {
                      const wAttendance = getAttendanceForWorker(worker.id);
                      const branchName = worker.branch_name || 'No Branch';
                      
                      return (
                        <tr key={worker.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                                {(worker.first_name?.charAt(0) || 'W').toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{getAttendanceWorkerName(worker.id)}</div>
                                <div className="text-sm text-gray-500">{worker.worker_code || 'No Code'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {branchName}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-700">{worker.position}</td>
                          <td className="px-6 py-4">
                            <span className={`font-mono ${wAttendance?.check_in ? 'text-green-700' : 'text-gray-400'}`}>
                              {wAttendance?.check_in || '--:--'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`font-mono ${wAttendance?.check_out ? 'text-indigo-700' : 'text-gray-400'}`}>
                              {wAttendance?.check_out || '--:--'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {(wAttendance?.status === 'present' || wAttendance?.check_in) ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <span className="w-2 h-2 mr-2 rounded-full bg-green-500"></span>
                                Present
                              </span>
                            ) : wAttendance?.status === 'absent' ? (
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
                              {hasPermission('worker_attendance', 'create') && !wAttendance?.check_in && wAttendance?.status !== 'absent' && (
                                <button
                                  onClick={() => checkIn(worker.id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors duration-150 shadow-sm"
                                >
                                  Check In
                                </button>
                              )}
                              {hasPermission('worker_attendance', 'update') && wAttendance?.check_in && !wAttendance?.check_out && (
                                <button
                                  onClick={() => checkOut(worker.id)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors duration-150 shadow-sm"
                                >
                                  Check Out
                                </button>
                              )}
                              {hasPermission('worker_attendance', 'create') && wAttendance?.status !== 'absent' && !wAttendance?.check_in && (
                                <button
                                  onClick={() => markAbsent(worker.id)}
                                  className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors duration-150 shadow-sm"
                                >
                                  Mark Absent
                                </button>
                              )}
                              {hasPermission('worker_attendance', 'update') && wAttendance && (
                                <button
                                  onClick={() => openAttendanceEditModal(worker.id)}
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
              {filteredWorkersAttendance.length === 0 && (
                <div className="p-12 text-center text-gray-500">
                  No workers found matching your filters.
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Check In Time</label>
                <input
                  type="time"
                  value={attendanceFormData.check_in}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, check_in: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check Out Time</label>
                <input
                  type="time"
                  value={attendanceFormData.check_out}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, check_out: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={attendanceFormData.status}
                  onChange={(e) => setAttendanceFormData({ ...attendanceFormData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
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

export default WorkerManagement;
