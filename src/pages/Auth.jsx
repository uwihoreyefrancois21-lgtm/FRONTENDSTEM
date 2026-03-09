import { useEffect, useState } from 'react';
import { FaBars, FaEye, FaEyeSlash, FaPhone, FaTimes } from 'react-icons/fa';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';
import { eifLogin, eifRegister } from '../services/eifService';
import { validateEmail, validatePassword, validatePhone } from '../utils/validation';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const systemParam = searchParams.get('system');
  const [activeSystem, setActiveSystem] = useState(systemParam || 'SPEMS');
  const [isLogin, setIsLogin] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { login: spemsLogin, user } = useAuth();

  // SPEMS Form Data
  const [spemsFormData, setSpemsFormData] = useState({
    email: '',
    password: '',
    username: '',
    phone: ''
  });

  // EIF Form Data
  const [eifFormData, setEifFormData] = useState({
    email: '',
    password: '',
    owner_name: '',
    company_name: '',
    phone: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState(null);
  const [error, setError] = useState({ SPEMS: '', EIF: '' });
  const [loading, setLoading] = useState({ SPEMS: false, EIF: false });

  useEffect(() => {
    if (systemParam) {
      setActiveSystem(systemParam);
    }
  }, [systemParam]);

  // Handle system switch and update URL
  const switchSystem = (system) => {
    setActiveSystem(system);
    window.history.pushState(null, '', `?system=${system}`);
  };

  // SPEMS Login Handler
  const handleSpemsLogin = async (e) => {
    e.preventDefault();
    setError({ ...error, SPEMS: '' });
    setLoading({ ...loading, SPEMS: true });

    const result = await spemsLogin({ email: spemsFormData.email, password: spemsFormData.password });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError({ ...error, SPEMS: result.message });
    }
    setLoading({ ...loading, SPEMS: false });
  };

  // SPEMS Register Handler
  const handleSpemsRegister = async (e) => {
    e.preventDefault();
    setError({ ...error, SPEMS: '' });
    
    if (!validateEmail(spemsFormData.email)) {
      setError({ ...error, SPEMS: 'Please enter a valid email address' });
      return;
    }
    
    if (spemsFormData.phone && !validatePhone(spemsFormData.phone)) {
      setError({ ...error, SPEMS: 'Please enter a valid phone number' });
      return;
    }
    
    if (!passwordValidation?.isValid) {
      setError({ ...error, SPEMS: 'Password does not meet strength requirements' });
      return;
    }

    setLoading({ ...loading, SPEMS: true });

    try {
      const response = await authService.register({
        username: spemsFormData.username,
        email: spemsFormData.email,
        password: spemsFormData.password,
        phone: spemsFormData.phone
      });

      if (response.success) {
        toast.success('Registration successful! Please wait for admin approval.');
        setIsLogin(true);
        setSpemsFormData({ email: '', password: '', username: '', phone: '' });
      } else {
        setError({ ...error, SPEMS: response.message || 'Registration failed' });
      }
    } catch (err) {
      setError({ ...error, SPEMS: err.response?.data?.message || 'Registration failed' });
    } finally {
      setLoading({ ...loading, SPEMS: false });
    }
  };

  // EIF Login Handler
  const handleEifLogin = async (e) => {
    e.preventDefault();
    setError({ ...error, EIF: '' });
    setLoading({ ...loading, EIF: true });

    try {
      const response = await eifLogin({ email: eifFormData.email, password: eifFormData.password });
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.account));
        localStorage.setItem('system', 'eif');
        toast.success('Login successful!');
        navigate('/eif/dashboard');
      } else {
        setError({ ...error, EIF: response.message || 'Login failed' });
      }
    } catch (err) {
      setError({ ...error, EIF: err.response?.data?.message || err.message || 'Login failed' });
    } finally {
      setLoading({ ...loading, EIF: false });
    }
  };

  // EIF Register Handler
  const handleEifRegister = async (e) => {
    e.preventDefault();
    setError({ ...error, EIF: '' });

    // Validate phone number
    if (!/^\d{10}$/.test(eifFormData.phone)) {
      setError({ ...error, EIF: 'Phone number must be exactly 10 digits' });
      return;
    }

    setLoading({ ...loading, EIF: true });

    try {
      const response = await eifRegister({
        owner_name: eifFormData.owner_name,
        email: eifFormData.email,
        password: eifFormData.password,
        company_name: eifFormData.company_name,
        phone: eifFormData.phone
      });

      if (response.success) {
        toast.success('Registration successful! Please login to continue.');
        setIsLogin(true);
        setEifFormData({ email: '', password: '', owner_name: '', company_name: '', phone: '' });
      } else {
        setError({ ...error, EIF: response.message || 'Registration failed' });
      }
    } catch (err) {
      setError({ ...error, EIF: err.response?.data?.message || err.message || 'Registration failed' });
    } finally {
      setLoading({ ...loading, EIF: false });
    }
  };

  const handlePasswordChange = (password, system) => {
    if (system === 'SPEMS') {
      setSpemsFormData({ ...spemsFormData, password });
      if (password.length > 0) {
        setPasswordValidation(validatePassword(password));
      } else {
        setPasswordValidation(null);
      }
    } else {
      setEifFormData({ ...eifFormData, password });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                  GlobalTrade Hub
                </span>
                <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-medium">
                </span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/#features" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Features
              </Link>
              <Link 
                to="/#how-it-works" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                How It Works
              </Link>
              <Link 
                to="/#pricing" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Pricing
              </Link>
              <Link 
                to="/where-systems-apply" 
                className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                Where Our Systems Apply
              </Link>
            </nav>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              {user ? (
                <Link 
                  to="/dashboard" 
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    to="/" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Home
                  </Link>
                  <Link 
                    to="/auth" 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
              
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-700 hover:text-primary-600 transition-colors"
              >
                {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
              <nav className="flex flex-col space-y-4">
                <Link 
                  to="/#features" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                >
                  Features
                </Link>
                <Link 
                  to="/#how-it-works" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                >
                  How It Works
                </Link>
                <Link 
                  to="/#pricing" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                >
                  Pricing
                </Link>
                <Link 
                  to="/where-systems-apply" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors py-2"
                >
                  Where Our Systems Apply
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          {/* System Selection Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-lg shadow-md p-1 inline-flex">
              <button
                onClick={() => switchSystem('SPEMS')}
                className={`px-6 py-3 rounded-md font-semibold transition-all ${
                  activeSystem === 'SPEMS'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <span className="text-2xl mr-2">📊</span> SPEMS
              </button>
              <button
                onClick={() => switchSystem('EIF')}
                className={`px-6 py-3 rounded-md font-semibold transition-all ${
                  activeSystem === 'EIF'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                <span className="text-2xl mr-2">🚢</span> Export-Import & Finance
              </button>
            </div>
          </div>

          {/* Single Form Layout */}
          <div className="max-w-md mx-auto">
            {activeSystem === 'SPEMS' ? (
              <div className="bg-white rounded-2xl shadow-xl p-8 transition-all ring-2 ring-blue-500">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">📊</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">SPEMS</h2>
                  <p className="text-gray-600">Smart Project Earnings Management System</p>
                  <p className="text-sm text-blue-600 font-semibold mt-2">$10/month</p>
                </div>

                {/* Toggle Login/Register */}
                <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 rounded-md font-medium transition ${
                      isLogin ? 'bg-blue-600 text-white' : 'text-gray-700'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 rounded-md font-medium transition ${
                      !isLogin ? 'bg-blue-600 text-white' : 'text-gray-700'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {error.SPEMS && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error.SPEMS}
                  </div>
                )}

                {isLogin ? (
                  <form onSubmit={handleSpemsLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={spemsFormData.email}
                        onChange={(e) => setSpemsFormData({ ...spemsFormData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={spemsFormData.password}
                          onChange={(e) => setSpemsFormData({ ...spemsFormData, password: e.target.value })}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading.SPEMS}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
                    >
                      {loading.SPEMS ? 'Logging in...' : 'Login'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSpemsRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username *</label>
                      <input
                        type="text"
                        value={spemsFormData.username}
                        onChange={(e) => setSpemsFormData({ ...spemsFormData, username: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={spemsFormData.email}
                        onChange={(e) => setSpemsFormData({ ...spemsFormData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={spemsFormData.password}
                          onChange={(e) => handlePasswordChange(e.target.value, 'SPEMS')}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={spemsFormData.phone}
                        onChange={(e) => setSpemsFormData({ ...spemsFormData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading.SPEMS}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
                    >
                      {loading.SPEMS ? 'Registering...' : 'Register'}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl p-8 transition-all ring-2 ring-purple-500">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">🚢</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Export-Import & Finance</h2>
                  <p className="text-gray-600">Complete Import/Export & Financial Management</p>
                  <p className="text-sm text-purple-600 font-semibold mt-2">$10/month</p>
                </div>

                {/* Toggle Login/Register */}
                <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 rounded-md font-medium transition ${
                      isLogin ? 'bg-purple-600 text-white' : 'text-gray-700'
                    }`}
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 rounded-md font-medium transition ${
                      !isLogin ? 'bg-purple-600 text-white' : 'text-gray-700'
                    }`}
                  >
                    Register
                  </button>
                </div>

                {error.EIF && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error.EIF}
                  </div>
                )}

                {isLogin ? (
                  <form onSubmit={handleEifLogin} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={eifFormData.email}
                        onChange={(e) => setEifFormData({ ...eifFormData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={eifFormData.password}
                          onChange={(e) => setEifFormData({ ...eifFormData, password: e.target.value })}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading.EIF}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
                    >
                      {loading.EIF ? 'Logging in...' : 'Login'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleEifRegister} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Owner Name *</label>
                      <input
                        type="text"
                        value={eifFormData.owner_name}
                        onChange={(e) => setEifFormData({ ...eifFormData, owner_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={eifFormData.email}
                        onChange={(e) => setEifFormData({ ...eifFormData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={eifFormData.password}
                          onChange={(e) => handlePasswordChange(e.target.value, 'EIF')}
                          className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                      <input
                        type="text"
                        value={eifFormData.company_name}
                        onChange={(e) => setEifFormData({ ...eifFormData, company_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <div className="flex items-center gap-2">
                          <FaPhone size={14} className="text-purple-600" />
                          Phone Number * (10 digits)
                        </div>
                      </label>
                      <input
                        type="tel"
                        value={eifFormData.phone}
                        onChange={(e) => setEifFormData({ ...eifFormData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                        placeholder="1234567890"
                        maxLength="10"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter a valid 10-digit phone number</p>
                    </div>
                    <button
                      type="submit"
                      disabled={loading.EIF}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50"
                    >
                      {loading.EIF ? 'Registering...' : 'Register'}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

          <div className="text-center mt-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;

