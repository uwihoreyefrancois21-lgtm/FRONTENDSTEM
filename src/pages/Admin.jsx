import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { authService, userService, paymentService } from '../services';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [userPayments, setUserPayments] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, approved
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
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentStatuses = async (usersList) => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      
      const paymentsMap = {};
      for (const u of usersList.filter(u => u.role !== 'admin')) {
        try {
          const paymentRes = await paymentService.getAll(u.id, null, null, null);
          if (paymentRes.success && paymentRes.data.payments.length > 0) {
            const recentPaid = paymentRes.data.payments.find(
              p => p.status === 'paid' && p.paid_at && new Date(p.paid_at) >= oneMonthAgo
            );
            paymentsMap[u.id] = recentPaid ? 'paid' : 'unpaid';
          } else {
            paymentsMap[u.id] = 'unpaid';
          }
        } catch (error) {
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
      fetchUsers();
    } catch (error) {
      console.error('Failed to approve user:', error);
      alert('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Are you sure you want to reject this user?')) {
      try {
        await authService.rejectUser(userId);
        fetchUsers();
        toast.success('User rejected successfully');
      } catch (error) {
        console.error('Failed to reject user:', error);
        toast.error('Failed to reject user');
      }
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
        toast.error('Failed to delete user');
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

  const filteredUsers = filter === 'all'
    ? users
    : filter === 'pending'
    ? users.filter(u => !u.approve_user)
    : users.filter(u => u.approve_user);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of system users and quick access to management tools</p>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/user-management" 
              className="px-4 py-2 bg-green-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Manage Users
            </Link>
            <Link 
              to="/payments" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Payments
            </Link>
            <Link 
              to="/profile-settings" 
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Profile Settings
            </Link>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Admin Dashboard:</strong> Use <Link to="/user-management" className="underline font-semibold">User Management</Link> to manage all registered users, 
            or <Link to="/payments" className="underline font-semibold">Payments</Link> to manage payment records.
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
            All Users
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending Approval
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filter === 'approved'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Approved Users
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
      </div>

      {/* Quick Users Overview */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">All Registered Users</h2>
          <Link 
            to="/user-management" 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All →
          </Link>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.slice(0, 10).map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.username}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{user.phone || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.approve_user
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.approve_user ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.role === 'admin' ? (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        N/A
                      </span>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        userPayments[user.id] === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : userPayments[user.id] === 'unpaid'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {userPayments[user.id] === 'paid' ? 'Paid' : 
                         userPayments[user.id] === 'unpaid' ? 'Unpaid' : 'Unknown'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-2">
                      <div className="flex space-x-2">
                        {!user.approve_user ? (
                          <>
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="text-green-600 hover:text-green-900 text-sm"
                            >
                              Approve
                            </button>
                            <span>|</span>
                            <button
                              onClick={() => handleReject(user.id)}
                              className="text-red-600 hover:text-red-900 text-sm"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-green-600 text-sm">Approved</span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleResetPassword(user.email)}
                          className="text-blue-600 hover:text-blue-900 text-xs"
                          title="Send password reset link"
                        >
                          Reset Password
                        </button>
                        <span>|</span>
                        <button
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          className="text-red-600 hover:text-red-900 text-xs"
                          title="Delete user"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length > 10 && (
          <div className="px-6 py-4 border-t border-gray-200 text-center">
            <Link 
              to="/user-management" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              View all {filteredUsers.length} users →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;

