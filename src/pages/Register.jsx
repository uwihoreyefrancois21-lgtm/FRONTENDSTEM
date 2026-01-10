import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { validateEmail, validatePassword, validatePhone } from '../utils/validation';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
  });
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password });
    if (password.length > 0) {
      setPasswordValidation(validatePassword(password));
    } else {
      setPasswordValidation(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid phone number');
      return;
    }
    
    if (!passwordValidation?.isValid) {
      setError('Password does not meet strength requirements. Please follow the guidelines.');
      return;
    }
    
    setLoading(true);

    const result = await authService.register(formData);
    
    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Join SPEMS today</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
            Registration successful! Please wait for admin approval.
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              id="username"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              id="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="+250 7"
            />
          
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              id="password"
              required
              value={formData.password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Enter strong password"
            />
            {passwordValidation && (
              <div className="mt-2">
                <div className="flex items-center mb-2">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full mr-3">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        passwordValidation.strength <= 1 ? 'bg-red-500' :
                        passwordValidation.strength <= 2 ? 'bg-orange-500' :
                        passwordValidation.strength <= 3 ? 'bg-yellow-500' :
                        passwordValidation.strength <= 4 ? 'bg-green-500' :
                        'bg-green-600'
                      }`}
                      style={{ width: `${(passwordValidation.strength / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${
                    passwordValidation.strength <= 1 ? 'text-red-600' :
                    passwordValidation.strength <= 2 ? 'text-orange-600' :
                    passwordValidation.strength <= 3 ? 'text-yellow-600' :
                    passwordValidation.strength <= 4 ? 'text-green-600' :
                    'text-green-700'
                  }`}>
                    {passwordValidation.message}
                  </span>
                </div>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li className={passwordValidation.requirements.minLength ? 'text-green-600' : ''}>
                    {passwordValidation.requirements.minLength ? '✓' : '✗'} At least 8 characters
                  </li>
                  <li className={passwordValidation.requirements.hasUpperCase ? 'text-green-600' : ''}>
                    {passwordValidation.requirements.hasUpperCase ? '✓' : '✗'} One uppercase letter
                  </li>
                  <li className={passwordValidation.requirements.hasLowerCase ? 'text-green-600' : ''}>
                    {passwordValidation.requirements.hasLowerCase ? '✓' : '✗'} One lowercase letter
                  </li>
                  <li className={passwordValidation.requirements.hasNumber ? 'text-green-600' : ''}>
                    {passwordValidation.requirements.hasNumber ? '✓' : '✗'} One number
                  </li>
                  <li className={passwordValidation.requirements.hasSpecialChar ? 'text-green-600' : ''}>
                    {passwordValidation.requirements.hasSpecialChar ? '✓' : '✗'} One special character (optional)
                  </li>
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : success ? 'Redirecting...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

