
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';

const Subscription = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [momoNumber, setMomoNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const { user, getDashboardPath } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscription_plans');
      // Handle different response formats
      const apiData = response.data.data || response.data || [];
      let allPlans = Array.isArray(apiData) ? apiData : [];
      // Filter active plans
      allPlans = allPlans.filter(plan => plan.is_active !== false);
      
      // Filter plans by user's company business type
      if (user?.company?.business_type) {
        allPlans = allPlans.filter(plan => plan.business_type === user.company.business_type);
      }
      
      setPlans(allPlans);
    } catch (error) {
      toast.error('Failed to load plans');
    }
  };

  const handleMomoNumberChange = (e) => {
    // Only allow digits and limit to 10 characters
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setMomoNumber(value);
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!selectedPlan) {
      toast.error('Please select a plan');
      return;
    }
    if (!momoNumber || momoNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit MoMo number');
      return;
    }
    setLoading(true);
    try {
      // Get company ID from user data
      const userStr = localStorage.getItem('user');
      if (!userStr) throw new Error('No user logged in');
      const userData = JSON.parse(userStr);

      setStep(3); // Move to PIN confirmation
      setPaymentStatus('pending');

      // Simulate calling backend to send payment request
      await api.post('/subscriptions/subscribe', {
        company_id: userData.company_id,
        plan_id: selectedPlan.id,
        phone_number: momoNumber,
        auto_renew: false,
        payer_message: 'NegTradeHub Subscription',
        payee_note: 'Monthly Plan'
      });

      // Simulate successful payment (for demo purposes)
      setTimeout(() => {
        setPaymentStatus('success');
        toast.success('Payment successful! Subscription activated!');
      }, 2000);

    } catch (error) {
      setPaymentStatus('failed');
      toast.error(error.response?.data?.message || 'Subscription failed');
    } finally {
      setLoading(false);
    }
  };

  const confirmPIN = async () => {
    setLoading(true);
    try {
      // Simulate PIN confirmation
      setTimeout(() => {
        setStep(4);
        setLoading(false);
      }, 1500);
    } catch (error) {
      setPaymentStatus('failed');
      toast.error('PIN confirmation failed');
      setLoading(false);
    }
  };

  // Determine which plans to show - show all active API plans
  const getRelevantPlans = () => {
    return plans;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4 py-8">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Plan</h1>
          <p className="text-gray-500">Get started with NegTradeHub</p>
        </div>

        {/* Step 1: Plan Selection */}
        {step === 1 && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {getRelevantPlans().map(plan => (
                <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`cursor-pointer p-6 rounded-xl border-4 transition-all duration-300 ${
                      selectedPlan?.id === plan.id
                        ? 'border-blue-600 bg-blue-50 shadow-md transform scale-[1.02]'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                      <p className="text-gray-500 text-sm">{plan.description || 'No description'}</p>
                    </div>
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold text-blue-600">{plan.price ?? 0}</span>
                      <span className="text-gray-500 ml-1">{plan.currency || 'RWF'}/month</span>
                    </div>
                    <div className="space-y-1">
                      {plan.max_users !== null && plan.max_users !== undefined && (
                        <p className="text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {plan.max_users === -1 ? 'Unlimited' : plan.max_users} Users
                        </p>
                      )}
                      {plan.max_branches !== null && plan.max_branches !== undefined && (
                        <p className="text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {plan.max_branches === -1 ? 'Unlimited' : plan.max_branches} Branches
                        </p>
                      )}
                      {plan.duration_days !== null && plan.duration_days !== undefined && (
                        <p className="text-sm flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {plan.duration_days} Days
                        </p>
                      )}
                    </div>
                  </div>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!selectedPlan}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 2: Enter MoMo Number */}
        {step === 2 && (
          <div>
            <form onSubmit={handleSubscribe} className="space-y-6 max-w-md mx-auto">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">MTN MoMo Number</label>
                <input
                  type="text"
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                    momoNumber && momoNumber.length !== 10 ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={momoNumber}
                  onChange={handleMomoNumberChange}
                  placeholder="078XXXXXXX"
                />
                {momoNumber && momoNumber.length !== 10 && (
                  <p className="text-red-500 text-sm mt-2">Please enter exactly 10 digits</p>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">Selected Plan: {selectedPlan?.name}</p>
                <p className="text-2xl font-bold text-blue-600">{selectedPlan?.price} {selectedPlan?.currency || 'RWF'}/month</p>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: PIN Confirmation */}
        {step === 3 && (
          <div className="max-w-md mx-auto text-center">
            {paymentStatus === 'pending' && (
              <div>
                <div className="text-6xl mb-6 text-yellow-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Payment</h2>
                <p className="text-gray-600 mb-6">Please check your phone and enter your PIN to complete the payment of {selectedPlan?.price} {selectedPlan?.currency || 'RWF'}.</p>
                
                <div className="bg-gray-50 rounded-lg p-6 mb-6">
                  <p className="text-sm text-gray-500 mb-2">Sending payment request to:</p>
                  <p className="text-xl font-bold text-gray-800">{momoNumber}</p>
                </div>

                <button
                  onClick={confirmPIN}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Confirming...' : 'I have entered PIN'}
                </button>
              </div>
            )}
            
            {paymentStatus === 'success' && (
              <div>
                <div className="text-6xl mb-6 text-green-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful!</h2>
                <p className="text-gray-600 mb-6">Your subscription has been activated successfully!</p>
                <button
                  onClick={() => setStep(4)}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Continue to Dashboard
                </button>
              </div>
            )}

            {paymentStatus === 'failed' && (
              <div>
                <div className="text-6xl mb-6 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h2>
                <p className="text-gray-600 mb-6">The payment was not completed. Please try again.</p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                  >
                    Change Plan
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Success */}
        {step === 4 && (
          <div className="text-center">
            <div className="text-6xl mb-6 text-green-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome to NegTradeHub!</h2>
            <p className="text-gray-600 mb-6">Your account is now fully set up and ready to use!</p>
            <button
              onClick={() => navigate(getDashboardPath(user))}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Subscription;
