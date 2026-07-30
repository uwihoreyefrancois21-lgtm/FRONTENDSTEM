
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import api from '../utils/api';

const Home = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await api.get('/subscription_plans');
      const apiData = response.data.data || response.data || [];
      let allPlans = Array.isArray(apiData) ? apiData : [];
      allPlans = allPlans.filter(plan => plan.is_active !== false);
      setPlans(allPlans);
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-8xl w-full mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Welcome to NegTradeHub</h1>
          <p className="text-xl text-gray-600 mb-8">
            Your all-in-one business management platform for services, projects, and products
          </p>
        </div>

       {/*  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Services</h3>
            <p className="text-gray-600">Manage your service-based business efficiently</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Projects</h3>
            <p className="text-gray-600">Track and manage your projects with ease</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Products</h3>
            <p className="text-gray-600">Handle inventory, sales, and POS operations</p>
          </div>
        </div> */}

        {plans.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Choose Your Plan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:border-blue-500 hover:shadow-2xl transition-all"
                >
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 min-h-[48px]">{plan.description || 'Perfect for your business needs'}</p>
                  
                  <div className="mb-8">
                    <div className="flex items-baseline justify-center">
                      <span className="text-5xl font-bold text-blue-600">{plan.price ?? 0}</span>
                      <span className="text-gray-500 ml-2">{plan.currency || 'RWF'}</span>
                    </div>
                    <p className="text-center text-gray-500">per {plan.duration_days ?? 30} days</p>
                  </div>

                  <div className="space-y-3 mb-8">
                    {plan.max_users !== null && plan.max_users !== undefined && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {plan.max_users === -1 ? 'Unlimited' : plan.max_users} Users
                      </div>
                    )}
                    {plan.max_branches !== null && plan.max_branches !== undefined && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {plan.max_branches === -1 ? 'Unlimited' : plan.max_branches} Branches
                      </div>
                    )}
                    {plan.business_type && (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {plan.business_type.charAt(0).toUpperCase() + plan.business_type.slice(1)}
                      </div>
                    )}
                  </div>

                  <Link
                    to={`/register${plan.business_type ? `?businessType=${plan.business_type}` : ''}`}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors inline-block text-center"
                  >
                    Get Started
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Home;
