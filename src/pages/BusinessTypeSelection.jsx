import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const businessTypes = [
  {
    id: 'services',
    title: 'Services',
    description: 'Offer and manage services for your clients',
    icon: '💼',
  },
  {
    id: 'projects',
    title: 'Projects',
    description: 'Manage projects, tasks, and project resources',
    icon: '📊',
  },
  {
    id: 'products',
    title: 'Products / POS',
    description: 'Manage inventory, sales, and point of sale',
    icon: '�',
  },
  {
    id: 'all',
    title: 'All-in-One',
    description: 'Access all features - services, projects, and products',
    icon: '🚀',
  },
];

const BusinessTypeSelection = () => {
  const [selectedType, setSelectedType] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const handleContinue = async () => {
    if (!selectedType) {
      toast.error('Please select a business type');
      return;
    }
    
    setLoading(true);
    try {
      const companyResponse = await api.put(`/companies/${user.company_id}`, {
        business_type: selectedType,
      });
      
      const updatedUser = { ...user, company: { ...user.company, business_type: selectedType } };
      updateUser(updatedUser);
      
      toast.success('Business type selected successfully!');
      
      switch (selectedType) {
        case 'services':
          navigate('/services');
          break;
        case 'projects':
          navigate('/projects');
          break;
        case 'products':
          navigate('/products');
          break;
        case 'all':
          navigate('/allinone');
          break;
        default:
          navigate('/login');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update business type');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Choose Your Business Type</h1>
          <p className="text-gray-600 text-lg">Select the type of business you operate</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {businessTypes.map((type) => (
            <div
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`cursor-pointer p-8 rounded-2xl border-4 transition-all duration-300 ${
                selectedType === type.id
                  ? 'border-blue-600 bg-blue-50 shadow-xl transform scale-105'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-lg'
              }`}
            >
              <div className="text-6xl mb-4">{type.icon}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{type.title}</h3>
              <p className="text-gray-600">{type.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={loading || !selectedType}
            className="px-12 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default BusinessTypeSelection;
