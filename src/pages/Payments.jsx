import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { paymentService, userService } from '../services';
import { formatCurrency } from '../utils/format';
import { toast } from 'react-toastify';

const Payments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
const [users, setUsers] = useState([]);
const [userPaymentMap, setUserPaymentMap] = useState({});
// Map of user_id to current month payment
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  
  // Helper to get first day of current month
  const getFirstDayOfMonth = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}-01`;
  };

  const currentMonth = getFirstDayOfMonth();

  const [formData, setFormData] = useState({
    user_id: '',
    amount: 15000,
    payment_month: currentMonth,
    status: 'unpaid',
    payment_method: 'MOMO',
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    } else {
      fetchData();
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'admin' && users.length > 0) {
      fetchAllUserPayments();
    }
  }, [users, selectedUserId, statusFilter, monthFilter, yearFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getAll(
        user?.role === 'admin' ? selectedUserId || null : user?.id,
        statusFilter || null,
        monthFilter || null,
        yearFilter || null
      );
      if (response && response.success && response.data) {
        setPayments(response.data.payments || []);
      } else if (response && response.payments) {
        // Handle case where response structure is different
        setPayments(response.payments);
      }
    } catch (error) {
      console.error('Failed to fetch payments:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getAll();
      if (response && response.success && response.data) {
        setUsers((response.data.users || []).filter(u => u.role !== 'admin'));
      } else if (response && response.users) {
        setUsers((response.users || []).filter(u => u.role !== 'admin'));
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    }
  };

  const fetchAllUserPayments = async () => {
    try {
      setLoading(true);
      const targetYear = yearFilter || new Date().getFullYear().toString();
      const targetMonth = monthFilter && yearFilter 
        ? `${targetYear}-${String(parseInt(monthFilter)).padStart(2, '0')}-01`
        : currentMonth;

      const paymentMap = {};
      
      // Use Promise.all to fetch payments for all users in parallel instead of sequentially
      const paymentPromises = users.map(async (u) => {
        try {
          const paymentRes = await paymentService.getAll(
            u.id,
            // IMPORTANT: don't pass statusFilter here; it would hide the real record after a status change
            // and we'd incorrectly fall back to a placeholder "unpaid" payment.
            null,
            monthFilter || null,
            yearFilter || null
          );
          
          const payments = (paymentRes && paymentRes.success && paymentRes.data) 
            ? (paymentRes.data.payments || [])
            : (paymentRes && paymentRes.payments ? paymentRes.payments : []);
          
          // Find payment for target month - try exact match first, then month/year match
          const monthPayment = payments.find(p => {
            if (!p.payment_month) return false;
            // Exact match
            if (p.payment_month === targetMonth) return true;
            // Month/year match
            const pMonth = new Date(p.payment_month);
            const tMonth = new Date(targetMonth);
            return pMonth.getFullYear() === tMonth.getFullYear() && 
                   pMonth.getMonth() === tMonth.getMonth();
          });
          
          if (monthPayment && monthPayment.id) {
            // Payment exists in database
            return { userId: u.id, payment: { ...monthPayment, username: u.username, email: u.email } };
          } else {
            // No payment record for this month - create a placeholder
            return {
              userId: u.id,
              payment: {
                id:'',
                user_id: u.id,
                amount: 15000,
                payment_month: targetMonth,
                status: '',
                payment_method: 'MOMO',
                paid_at: '',
                username: u.username,
                email: u.email
              }
            };
          }
        } catch (error) {
          console.error(`Failed to fetch payment for user ${u.id}:`, error);
          return {
            userId: u.id,
            payment: {
              id: '',
              user_id: u.id,
              amount: 15000,
              payment_month: targetMonth,
              status: '',
              payment_method: 'MOMO',
              paid_at: '',
              username: u.username,
              email: u.email
            }
          };
        }
      });

      // Wait for all promises to resolve in parallel
      const results = await Promise.all(paymentPromises);
      
      // Build the payment map from results
      results.forEach(({ userId, payment }) => {
        paymentMap[userId] = payment;
      });
      
      setUserPaymentMap(paymentMap);
    } catch (error) {
      console.error('Failed to fetch user payments:', error);
      toast.error('Failed to fetch payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPayment && editingPayment.id) {
        const response = await paymentService.update(editingPayment.id, formData);
        if (response.success) {
          toast.success('Payment updated successfully');
        } else {
          throw new Error(response.message || 'Failed to update payment');
        }
      } else {
        const response = await paymentService.create(formData);
        if (response.success) {
          toast.success('Payment created successfully');
        } else {
          throw new Error(response.message || 'Failed to create payment');
        }
      }
      setShowModal(false);
      setEditingPayment(null);
      resetForm();
      
      // Refresh data
      if (user?.role === 'admin') {
        await fetchAllUserPayments();
      } else {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to save payment:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to save payment';
      toast.error(errorMessage);
    }
  };

  const handleEdit = (payment) => {
    if (payment && payment.id) {
      setEditingPayment(payment);
      setFormData({
        user_id: payment.user_id,
        amount: payment.amount,
        payment_month: payment.payment_month,
        status: payment.status,
        payment_method: payment.payment_method || 'MOMO',
      });
      setShowModal(true);
    }
  };

  const handleStatusChange = async (userId, paymentId, newStatus) => {
    try {
      const payment = userPaymentMap[userId];
      const targetMonth = monthFilter && yearFilter 
        ? `${yearFilter}-${String(parseInt(monthFilter)).padStart(2, '0')}-01`
        : currentMonth;

      let response;
      const defaultMethod = 'MOMO';
      
      // If payment object exists and has an ID, update it directly
      if (payment && payment.id) {
        const updateData = {
          status: newStatus,
          payment_method: payment.payment_method || defaultMethod
        };
        
        // If marking as paid and not already paid, set paid_at to current time
        if (newStatus === 'paid' && payment.status !== 'paid') {
          updateData.paid_at = new Date().toISOString();
        }
        
        response = await paymentService.update(payment.id, updateData);
      } else {
        // Payment doesn't exist in UI map, try to find it in database first
        const monthNum = monthFilter ? parseInt(monthFilter) : new Date().getMonth() + 1;
        const yearNum = yearFilter ? parseInt(yearFilter) : new Date().getFullYear();
        
        try {
          const existingPaymentsRes = await paymentService.getAll(userId, null, monthNum, yearNum);
          const existingPayments = existingPaymentsRes?.data?.payments || existingPaymentsRes?.payments || [];
          
          // Find payment matching target month (exact match or same month/year)
          const existingPayment = existingPayments.find(p => {
            if (!p.payment_month) return false;
            const pDate = new Date(p.payment_month);
            const tDate = new Date(targetMonth);
            return pDate.getFullYear() === tDate.getFullYear() && 
                   pDate.getMonth() === tDate.getMonth();
          });
          
          if (existingPayment && existingPayment.id) {
            // Payment exists in DB, update it
            response = await paymentService.update(existingPayment.id, {
              status: newStatus,
              payment_method: existingPayment.payment_method || defaultMethod
            });
          } else {
            // No payment exists, create new one
            const createData = {
              user_id: userId,
              amount: 15000,
              payment_month: targetMonth,
              status: newStatus,
              payment_method: defaultMethod
            };
            
            // If marking as paid, set paid_at to current time
            if (newStatus === 'paid') {
              createData.paid_at = new Date().toISOString();
            }
            
            response = await paymentService.create(createData);
          }
        } catch (fetchError) {
          // If fetch fails, try to create (might fail if it exists, but backend will handle)
          const createData = {
            user_id: userId,
            amount: 15000,
            payment_month: targetMonth,
            status: newStatus,
            payment_method: defaultMethod
          };
          
          // If marking as paid, set paid_at to current time
          if (newStatus === 'paid') {
            createData.paid_at = new Date().toISOString();
          }
          
          response = await paymentService.create(createData);
        }
      }
      
      // Check response
      if (response && (response.success || response.data)) {
        toast.success(`Payment marked as ${newStatus}`);
        // Immediately update the UI with the response data if available
        if (response.data?.payment && user?.role === 'admin') {
          const updatedPayment = response.data.payment;
          setUserPaymentMap(prev => ({
            ...prev,
            [userId]: {
              ...prev[userId],
              ...updatedPayment,
              username: users.find(u => u.id === userId)?.username || prev[userId]?.username,
              email: users.find(u => u.id === userId)?.email || prev[userId]?.email
            }
          }));
        }
        // Refresh data to ensure consistency
        if (user?.role === 'admin') {
          await fetchAllUserPayments();
        } else {
          await fetchData();
        }
      } else {
        throw new Error(response?.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Failed to update payment:', error);
      const errorMessage = error.response?.data?.message || error.response?.message || error.message || 'Failed to update payment';
      
      // If error is "already exists", try to find and update instead
      if (errorMessage.includes('already exists') || errorMessage.includes('Payment already exists')) {
        try {
          const monthNum = monthFilter ? parseInt(monthFilter) : new Date().getMonth() + 1;
          const yearNum = yearFilter ? parseInt(yearFilter) : new Date().getFullYear();
          const targetMonth = monthFilter && yearFilter 
            ? `${yearFilter}-${String(parseInt(monthFilter)).padStart(2, '0')}-01`
            : currentMonth;
          
          const existingPaymentsRes = await paymentService.getAll(userId, null, monthNum, yearNum);
          const existingPayments = existingPaymentsRes?.data?.payments || existingPaymentsRes?.payments || [];
          const existingPayment = existingPayments.find(p => {
            if (!p.payment_month) return false;
            const pDate = new Date(p.payment_month);
            const tDate = new Date(targetMonth);
            return pDate.getFullYear() === tDate.getFullYear() && 
                   pDate.getMonth() === tDate.getMonth();
          });
          
          if (existingPayment && existingPayment.id) {
            const updateResponse = await paymentService.update(existingPayment.id, { 
              status: newStatus,
              payment_method: existingPayment.payment_method || defaultMethod
            });
            if (updateResponse && (updateResponse.success || updateResponse.data)) {
              toast.success(`Payment marked as ${newStatus}`);
              if (user?.role === 'admin') {
                await fetchAllUserPayments();
              } else {
                await fetchData();
              }
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payment record?')) {
      try {
        await paymentService.delete(id);
        toast.success('Payment deleted successfully');
        fetchData();
      } catch (error) {
        console.error('Failed to delete payment:', error);
        toast.error('Failed to delete payment');
      }
    }
  };

  const handleCheckAndRemind = async () => {
    if (window.confirm('This will check all payments and send reminder emails to unpaid users. Continue?')) {
      try {
        const response = await paymentService.checkAndRemind();
        if (response.success) {
          toast.success(response.message || response.data?.message || 'Payment check completed');
          if (user?.role === 'admin') {
            await fetchAllUserPayments();
          } else {
            await fetchData();
          }
        } else {
          throw new Error(response.message || 'Failed to check payments');
        }
      } catch (error) {
        console.error('Failed to check payments:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to check payments';
        toast.error(errorMessage);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      user_id: '',
      amount: 15000,
      payment_month: getFirstDayOfMonth(),
      status: 'unpaid',
      payment_method: 'MOMO',
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      paid: 'bg-green-100 text-green-800',
      unpaid: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading && (user?.role === 'admin' ? users.length === 0 : payments.length === 0)) {
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
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.role === 'admin' ? 'Payment Management - All Users' : 'Payment Management'}
          </h1>
          <p className="text-gray-600 mt-2">
            {user?.role === 'admin' 
              ? 'View and manage payment status for all users. Mark payments as paid or unpaid directly from the table.' 
              : 'View your payment history'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={handleCheckAndRemind}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-colors"
          >
            Check & Send Reminders
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {user?.role === 'admin' && (
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.username} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="late">Late</option>
            </select>
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Month</label>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Months</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <input
              type="number"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              min="2000"
              max="2100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <button
              onClick={() => {
                setSelectedUserId('');
                setStatusFilter('');
                setMonthFilter('');
                setYearFilter(new Date().getFullYear().toString());
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Users Payment Status Table (Admin) or Payments Table (Regular User) */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {user?.role === 'admin' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid At</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </>
                ) : (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Month</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid At</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {user?.role === 'admin' ? (
                // Admin view: Show all users with payment status
                users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      {loading ? 'Loading users...' : 'No users found.'}
                    </td>
                  </tr>
                ) : (
                  users
                    .filter(u => {
                      if (selectedUserId && u.id !== parseInt(selectedUserId)) return false;
                      if (statusFilter) {
                        const payment = userPaymentMap[u.id];
                        if (!payment) return statusFilter === 'unpaid';
                        return payment.status === statusFilter;
                      }
                      return true;
                    })
                    .map((u) => {
                      const payment = userPaymentMap[u.id] || {
                        id: null,
                        user_id: u.id,
                        amount: 15000,
                        payment_month: monthFilter && yearFilter 
                          ? `${yearFilter}-${String(parseInt(monthFilter)).padStart(2, '0')}-01`
                          : currentMonth,
                        status: 'unpaid',
                        paid_at: null
                      };
                      
                      return (
                        <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{u.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600">{u.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(payment.payment_month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            RWF {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.payment_method || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex items-center gap-2">
                              {payment.status !== 'paid' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(u.id, payment.id, 'paid')}
                                    className="text-green-600 hover:text-green-900 font-medium transition-colors text-sm"
                                    title="Mark as Paid"
                                  >
                                    Mark Paid
                                  </button>
                                  <span className="text-gray-300">|</span>
                                </>
                              )}
                              {payment.status !== 'unpaid' && (
                                <>
                                  <button
                                    onClick={() => handleStatusChange(u.id, payment.id, 'unpaid')}
                                    className="text-red-600 hover:text-red-900 font-medium transition-colors text-sm"
                                    title="Mark as Unpaid"
                                  >
                                    Mark Unpaid
                                  </button>
                                  <span className="text-gray-300">|</span>
                                </>
                              )}
                              {payment.id && (
                                <button
                                  onClick={() => {
                                    setEditingPayment(payment);
                                    setFormData({
                                      user_id: u.id,
                                      amount: payment.amount,
                                      payment_month: payment.payment_month,
                                      status: payment.status,
                                      payment_method: payment.payment_method || '',
                                    });
                                    setShowModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 font-medium transition-colors text-sm"
                                  title="Edit Payment Details"
                                >
                                  Edit
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )
              ) : (
                // Regular user view: Show their payment history
                payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No payments found for the selected filters.
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(payment.payment_month).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        RWF {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.payment_method || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Info Box */}
      {user?.role !== 'admin' && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Payment Instructions</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p><strong>Amount:</strong> 15,000 RWF</p>
            <p><strong>Pay To:</strong> NKUSI ENGINEERING GROUP LTD</p>
            <p><strong>Payment Method:</strong> Use the phone number <strong>Press *182*8*1*7930391#</strong> when paying to ensure your payment is matched.</p>
            <p className="mt-3 text-xs text-blue-600">Please make your payment monthly to continue using the system. Your account will be blocked if payment is not received.</p>
          </div>
        </div>
      )}

      {/* Edit Payment Modal (Only for editing existing payments) */}
      {showModal && user?.role === 'admin' && editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Edit Payment</h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPayment(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">User</label>
                <input
                  type="text"
                  value={users.find(u => u.id === parseInt(formData.user_id))?.username || 'N/A'}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (RWF) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Month *</label>
                <input
                  type="month"
                  required
                  value={formData.payment_month.substring(0, 7)}
                  onChange={(e) => {
                    const monthValue = e.target.value;
                    const firstDay = monthValue ? `${monthValue}-01` : getFirstDayOfMonth();
                    setFormData({ ...formData, payment_month: firstDay });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">Payment month will be set to the first day of the selected month</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="late">Late</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <input
                  type="text"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  placeholder="e.g., Mobile Money, Bank Transfer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPayment(null);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Update Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;

