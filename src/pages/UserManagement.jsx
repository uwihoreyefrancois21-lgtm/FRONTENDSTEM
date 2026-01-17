import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { authService, userService, paymentService } from '../services';
import { Tag, Button, Popconfirm, message } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
// Add these functions inside the UserManagement component
const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [userPayments, setUserPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    role: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      if (response && response.success && response.data) {
        setUsers(response.data.users || []);
        // Fetch payment status for each user
        fetchPaymentStatuses(response.data.users || []);
      } else if (response && response.users) {
        setUsers(response.users || []);
        fetchPaymentStatuses(response.users || []);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStatuses = async (usersList) => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      oneMonthAgo.setHours(0, 0, 0, 0);
      
      const paymentsMap = {};
      for (const u of usersList.filter(u => u.role !== 'admin')) {
        try {
          // Fetch current month payment
          const paymentRes = await paymentService.getAll(u.id, null, currentMonth, currentYear);
          const payments = paymentRes?.data?.payments || paymentRes?.payments || [];
          
          // Find payment for current month
          const currentMonthPayment = payments.find(p => {
            if (!p.payment_month) return false;
            const pDate = new Date(p.payment_month);
            return pDate.getMonth() + 1 === currentMonth && pDate.getFullYear() === currentYear;
          });
          
          if (currentMonthPayment) {
            // Check if it's paid and within last month
            if (currentMonthPayment.status === 'paid' && currentMonthPayment.paid_at) {
              const paidDate = new Date(currentMonthPayment.paid_at);
              paymentsMap[u.id] = paidDate >= oneMonthAgo ? 'paid' : 'unpaid';
            } else {
              paymentsMap[u.id] = currentMonthPayment.status || 'unpaid';
            }
          } else {
            // No payment record for current month - check if they have any recent paid payment
            const allPaymentsRes = await paymentService.getAll(u.id, null, null, null);
            const allPayments = allPaymentsRes?.data?.payments || allPaymentsRes?.payments || [];
            const recentPaid = allPayments.find(
              p => p.status === 'paid' && p.paid_at && new Date(p.paid_at) >= oneMonthAgo
            );
            paymentsMap[u.id] = recentPaid ? 'paid' : 'unpaid';
          }
        } catch (error) {
          console.error(`Failed to fetch payment for user ${u.id}:`, error);
          paymentsMap[u.id] = 'unknown';
        }
      }
      setUserPayments(paymentsMap);
    } catch (error) {
      console.error('Failed to fetch payment statuses:', error);
    }
  };

  const handleApprove = async (userId) => {
    try {
      await authService.approveUser(userId);
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to approve user:', error);
      toast.error('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    const user = users.find(u => u.id === userId);
    const action = user?.approve_user ? 'unapprove' : 'reject';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        await authService.rejectUser(userId);
        fetchUsers();
        toast.success(`User ${action === 'reject' ? 'rejected' : 'unapproved'} successfully`);
      } catch (error) {
        console.error('Failed to reject user:', error);
        toast.error('Failed to reject user');
      }
    }
  };

  const handlePaymentStatusChange = async (userId, newStatus) => {
    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      const firstDayOfMonth = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      
      // Try to find existing payment for current month
      const paymentRes = await paymentService.getAll(userId, null, currentMonth, currentYear);
      const payments = paymentRes?.data?.payments || paymentRes?.payments || [];
      const existingPayment = payments.find(p => {
        if (!p.payment_month) return false;
        const pDate = new Date(p.payment_month);
        return pDate.getMonth() + 1 === currentMonth && pDate.getFullYear() === currentYear;
      });
      
      let response;
      if (existingPayment && existingPayment.id) {
        // Update existing payment
        response = await paymentService.update(existingPayment.id, { status: newStatus });
      } else {
        // Create new payment
        response = await paymentService.create({
          user_id: userId,
          amount: 15000,
          payment_month: firstDayOfMonth,
          status: newStatus,
          payment_method: null
        });
      }
      
      if (response && (response.success || response.data)) {
        toast.success(`Payment marked as ${newStatus}`);
        fetchUsers(); // Refresh to update payment status
      } else {
        throw new Error(response?.message || 'Failed to update payment');
      }
    } catch (error) {
      console.error('Failed to update payment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update payment';
      
      // If error is "already exists", try to find and update
      if (errorMessage.includes('already exists') || errorMessage.includes('Payment already exists')) {
        try {
          const currentDate = new Date();
          const currentMonth = currentDate.getMonth() + 1;
          const currentYear = currentDate.getFullYear();
          const paymentRes = await paymentService.getAll(userId, null, currentMonth, currentYear);
          const payments = paymentRes?.data?.payments || paymentRes?.payments || [];
          const existingPayment = payments.find(p => {
            if (!p.payment_month) return false;
            const pDate = new Date(p.payment_month);
            return pDate.getMonth() + 1 === currentMonth && pDate.getFullYear() === currentYear;
          });
          
          if (existingPayment && existingPayment.id) {
            const updateResponse = await paymentService.update(existingPayment.id, { status: newStatus });
            if (updateResponse && (updateResponse.success || updateResponse.data)) {
              toast.success(`Payment marked as ${newStatus}`);
              fetchUsers();
              return;
            }
          }
        } catch (retryError) {
          console.error('Retry also failed:', retryError);
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleDeleteUser = async (userId, email) => {
    if (window.confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      try {
        await userService.delete(userId);
        fetchUsers();
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Failed to delete user:', error);
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleResetPassword = async (email) => {
    if (window.confirm(`Send password reset link to ${email}?`)) {
      try {
        await authService.forgotPassword({ email });
        toast.success('Password reset link sent to user\'s email');
      } catch (error) {
        console.error('Failed to send password reset:', error);
        toast.error('Failed to send password reset link');
      }
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      role: user.role || 'staff',
    });
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
    setEditForm({ role: '' });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await userService.update(editingUser.id, { role: editForm.role });
      toast.success('User updated successfully');
      handleCloseEdit();
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const filteredUsers = filter === 'all'
    ? users
    : filter === 'pending'
    ? users.filter(u => !u.approve_user)
    : users.filter(u => u.approve_user);

  // Reset to first page when filters or total users change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, users.length]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage all registered users, approve registrations, and monitor account status</p>
        </div>
        <div className="flex gap-3">
          {/*<Link 
            to="/payments" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Manage Payments
          </Link>*/}
          <Link 
            to="/profile-settings" 
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Profile Settings
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Users</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{users.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {users.filter(u => !u.approve_user).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Approved Users</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {users.filter(u => u.approve_user).length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Paid Users</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {Object.values(userPayments).filter(status => status === 'paid').length}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6 p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending Approval ({users.filter(u => !u.approve_user).length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'approved'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved Users ({users.filter(u => u.approve_user).length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Registered Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approval Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{u.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{u.phone || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.approve_user
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {u.approve_user ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.role === 'admin' ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          N/A
                        </span>
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userPayments[u.id] === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : userPayments[u.id] === 'unpaid'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {userPayments[u.id] === 'paid' ? 'Paid' : 
                           userPayments[u.id] === 'unpaid' ? 'Unpaid' : 'Unknown'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-2">
                        <div className="flex space-x-2 flex-wrap">
                          {!u.approve_user ? (
                            <>
                              <button
                                onClick={() => handleApprove(u.id)}
                                className="text-green-600 hover:text-green-900 text-sm font-medium transition-colors"
                              >
                                Approve
                              </button>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleReject(u.id)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="text-green-600 text-sm font-medium">Approved</span>
                              <span className="text-gray-300">|</span>
                              <button
                                onClick={() => handleReject(u.id)}
                                className="text-red-600 hover:text-red-900 text-sm font-medium transition-colors"
                                title="Unapprove user"
                              >
                                Unapprove
                              </button>
                            </>
                          )}
                        </div>
                        {u.role !== 'admin' && u.approve_user && (
                          <div className="flex space-x-2 flex-wrap">
                            {userPayments[u.id] !== 'paid' && (
                              <>
                                <button
                                  onClick={() => handlePaymentStatusChange(u.id, 'paid')}
                                  className="text-green-600 hover:text-green-900 text-xs font-medium transition-colors"
                                  title="Mark payment as paid"
                                >
                                  Mark Paid
                                </button>
                                <span className="text-gray-300">|</span>
                              </>
                            )}
                            {userPayments[u.id] !== 'unpaid' && (
                              <>
                                <button
                                  onClick={() => handlePaymentStatusChange(u.id, 'unpaid')}
                                  className="text-red-600 hover:text-red-900 text-xs font-medium transition-colors"
                                  title="Mark payment as unpaid"
                                >
                                  Mark Unpaid
                                </button>
                                <span className="text-gray-300">|</span>
                              </>
                            )}
                          </div>
                        )}
                        <div className="flex space-x-2 flex-wrap">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="text-gray-700 hover:text-gray-900 text-xs font-medium transition-colors"
                            title="Edit user (change role)"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          {/*<button
                            onClick={() => handleResetPassword(u.email)}
                            className="text-blue-600 hover:text-blue-900 text-xs font-medium transition-colors"
                            title="Send password reset link"
                          >
                            Reset Password
                          </button>*/}
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDeleteUser(u.id, u.email)}
                            className="text-red-600 hover:text-red-900 text-xs font-medium transition-colors"
                            title="Delete user"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredUsers.length > pageSize && (
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing{' '}
            <span className="font-medium">
              {startIndex + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(startIndex + pageSize, filteredUsers.length)}
            </span>{' '}
            of{' '}
            <span className="font-medium">
              {filteredUsers.length}
            </span>{' '}
            users
          </p>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium border ${
                currentPage === 1
                  ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page <span className="font-medium">{currentPage}</span> of{' '}
              <span className="font-medium">{totalPages}</span>
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium border ${
                currentPage === totalPages
                  ? 'text-gray-400 bg-gray-100 border-gray-200 cursor-not-allowed'
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
              <button
                onClick={handleCloseEdit}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={editingUser.username}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;

