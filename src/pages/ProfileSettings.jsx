import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FaEye, FaEyeSlash, FaUserCircle } from 'react-icons/fa';
import { paymentService } from '../services';

const ProfileSettings = () => {
  const { user, updatePassword } = useAuth();
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user || user.role === 'admin') {
        setPaymentLoading(false);
        return;
      }
      try {
        const response = await paymentService.getMyStatus();
        if (response.success) {
          setPaymentStatus(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch payment status:', err);
      } finally {
        setPaymentLoading(false);
      }
    };
    fetchStatus();
  }, [user]);

  const formatDateTime = (iso) => {
    if (!iso) return 'Not available';
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.new_password !== formData.confirm_password) {
      setError('New password and confirm password do not match');
      return false;
    }
    if (formData.new_password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const result = await updatePassword({
        current_password: formData.current_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      if (result.success) {
        setMessage('Password updated successfully');
        setFormData({
          current_password: '',
          new_password: '',
          confirm_password: '',
        });
      } else {
        setError(result.message || 'Failed to update password');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      setError(
        err.response?.data?.message ||
          'An error occurred while updating your password'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
        <p className="text-sm text-gray-600 mt-1">
          Manage your account security and subscription status
        </p>
      </div>

      <div className="mb-6 flex items-center space-x-4 p-4 bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="text-primary-600">
          <FaUserCircle size={40} />
        </div>
        <div>
          <div className="text-lg font-medium text-gray-900">{user?.username}</div>
          <div className="text-sm text-gray-600">{user?.email}</div>
          <div className="text-xs text-gray-500 mt-1">
            {user?.role === 'admin' ? 'Administrator' : 'User'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: password form */}
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Change Password</h3>
          <p className="text-sm text-gray-600 mb-4">
            Update your password regularly to keep your account secure.
          </p>

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="current_password"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="current_password"
                  name="current_password"
                  type={showPassword.current ? 'text' : 'password'}
                  required
                  value={formData.current_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter current password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  tabIndex="-1"
                >
                  {showPassword.current ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="new_password"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="new_password"
                  name="new_password"
                  type={showPassword.new ? 'text' : 'password'}
                  required
                  minLength="8"
                  value={formData.new_password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter new password (min 8 characters)"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  tabIndex="-1"
                >
                  {showPassword.new ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label
                className="block text-sm font-medium text-gray-700 mb-1"
                htmlFor="confirm_password"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  name="confirm_password"
                  type={showPassword.confirm ? 'text' : 'password'}
                  required
                  minLength="8"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 pr-10 border ${
                    formData.new_password &&
                    formData.confirm_password &&
                    formData.new_password !== formData.confirm_password
                      ? 'border-red-300'
                      : 'border-gray-300'
                  } rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent`}
                  placeholder="Confirm new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  tabIndex="-1"
                >
                  {showPassword.confirm ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
              {formData.new_password &&
                formData.confirm_password &&
                formData.new_password !== formData.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">Passwords do not match</p>
                )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition ${
                  loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                }`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>

              {formData.new_password && formData.new_password.length < 8 && (
                <p className="mt-2 text-sm text-yellow-600">
                  Password must be at least 8 characters long
                </p>
              )}
            </div>
          </form>
        </div>

        {/* Right column: payment status */}
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Status</h3>
          <p className="text-sm text-gray-600 mb-4">
            Overview of your last payment and when access will expire.
          </p>

          {user?.role === 'admin' ? (
            <p className="text-sm text-gray-500">
              Payment status is managed per user. Switch to a staff account to see this
              card.
            </p>
          ) : paymentLoading ? (
            <p className="text-sm text-gray-500">Loading payment status...</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-700">Account status</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    paymentStatus?.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {paymentStatus?.status === 'active' ? 'Active' : 'Blocked'}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex justify-between">
                  <span className="font-medium">Last payment:</span>
                  <span className="text-right">
                    {formatDateTime(paymentStatus?.last_payment_at)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Block on:</span>
                  <span className="text-right">
                    {formatDateTime(paymentStatus?.block_date)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">Days until block:</span>
                  <span className="text-orange-600 font-semibold">
                    {paymentStatus?.days_until_block ?? 0}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-yellow-400"
                    style={{
                      width: `${
                        Math.max(
                          0,
                          Math.min(
                            100,
                            ((30 - (paymentStatus?.days_until_block ?? 0)) / 30) * 100
                          )
                        ).toFixed(0)
                      }%`,
                    }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  30-day window from your last payment
                </p>
              </div>

              <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-600 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                  <span>Last payment</span>
                  <span className="ml-auto text-gray-500">
                    {formatDateTime(paymentStatus?.last_payment_at).split(',')[0]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-red-500" />
                  <span>Block date</span>
                  <span className="ml-auto text-gray-500">
                    {formatDateTime(paymentStatus?.block_date).split(',')[0]}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;