
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { validateConfirmPassword, validateEmail, validatePassword, validatePhone, validateRequired } from '../utils/validation';

const businessTypes = [
  { id: 'services', name: 'Services', desc: 'Offer and manage services for your clients', icon: '💼' },
  { id: 'projects', name: 'Projects', desc: 'Manage projects, tasks, and project resources', icon: '📊' },
  { id: 'products', name: 'Products / POS', desc: 'Manage inventory, sales, and point of sale', icon: '🛒' },
  { id: 'all', name: 'All-in-One', desc: 'Access all features - services, projects, and products', icon: '🚀' },
];

const Register = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    businessType: searchParams.get('businessType') || '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { login, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate all fields
    const companyNameValidation = validateRequired(formData.companyName, 'Company name');
    if (!companyNameValidation.valid) {
      toast.error(companyNameValidation.message);
      return;
    }
    
    const companyEmailValidation = validateEmail(formData.companyEmail);
    if (!companyEmailValidation.valid) {
      toast.error(companyEmailValidation.message);
      return;
    }
    
    const companyPhoneValidation = validatePhone(formData.companyPhone);
    if (!companyPhoneValidation.valid) {
      toast.error(companyPhoneValidation.message);
      return;
    }
    
    const companyAddressValidation = validateRequired(formData.companyAddress, 'Company address');
    if (!companyAddressValidation.valid) {
      toast.error(companyAddressValidation.message);
      return;
    }
    
    if (!formData.businessType) {
      toast.error('Please select your business type');
      return;
    }
    
    const firstNameValidation = validateRequired(formData.firstName, 'First name');
    if (!firstNameValidation.valid) {
      toast.error(firstNameValidation.message);
      return;
    }
    
    const lastNameValidation = validateRequired(formData.lastName, 'Last name');
    if (!lastNameValidation.valid) {
      toast.error(lastNameValidation.message);
      return;
    }
    
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      toast.error(emailValidation.message);
      return;
    }
    
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.valid) {
      toast.error(passwordValidation.message);
      return;
    }
    
    const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (!confirmPasswordValidation.valid) {
      toast.error(confirmPasswordValidation.message);
      return;
    }

    setLoading(true);
    try {
      // 1. Register company and user
      const registerResponse = await api.post('/auth/register-company', {
        company_name: formData.companyName,
        company_email: formData.companyEmail,
        company_phone: formData.companyPhone,
        company_address: formData.companyAddress,
        business_type: formData.businessType,
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      // 2. Log the user in automatically
      const userData = await login(formData.email, formData.password);

      toast.success('Registration successful!');

      // 3. Redirect to subscription page
      navigate('/subscription');
    } catch (error) {
      toast.error(error.userMessage || error.message || 'Registration failed');      
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">    
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
          <p className="text-gray-500">Join NegTradeHub today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Company Information */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Company Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.companyEmail}
                  onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                  placeholder="company@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Phone</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.companyPhone}
                  onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Address</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.companyAddress}
                  onChange={(e) => setFormData({ ...formData, companyAddress: e.target.value })}
                  placeholder="123 Business St"
                />
              </div>
            </div>
          </div>

          {/* Business Type */}
          <div className="border-b pb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Select Your Business Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {businessTypes.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setFormData({ ...formData, businessType: type.id })}
                  className={`cursor-pointer p-6 rounded-xl border-4 transition-all duration-300 ${
                    formData.businessType === type.id
                      ? 'border-blue-600 bg-blue-50 shadow-lg transform scale-[1.02]'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="text-4xl mb-3">{type.icon}</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{type.name}</h3>
                  <p className="text-gray-600 text-sm">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Account */}
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Admin Account</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
              <div></div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Register;

