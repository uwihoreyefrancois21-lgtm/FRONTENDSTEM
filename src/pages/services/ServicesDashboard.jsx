
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = () => {
  const baseItems = [
    { path: '/company', label: 'Company Dashboard', icon: '🏠' },
    { path: '/company/users', label: 'Users', icon: '👥' },
    { path: '/company/employees', label: 'Employees', icon: '👨‍💼' },
    { path: '/company/workers', label: 'Workers', icon: '👷' },
  ];
  
  return [...baseItems, 
    { path: '/services', label: 'Services Dashboard', icon: '💼' },
    { path: '/services/services', label: 'Services', icon: '💼' },
    { path: '/services/requests', label: 'Service Requests', icon: '📋' },
    { path: '/services/suppliers-customers', label: 'Suppliers & Customers', icon: '👥' },
    { path: '/services/sales', label: 'Sales', icon: '💰' },
    { path: '/services/reports', label: 'Reports', icon: '📈' },
    { path: '/services/ai', label: 'AI Assistant', icon: '🤖' },
    { path: '/profile', label: 'My Profile', icon: '👤' }
  ];
};

const ServicesDashboard = () => {
  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, formatCurrency } = useAuth();
  const menuItems = getMenuItems();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, productsRes] = await Promise.all([
        api.get('/services'),
        api.get('/products'),
      ]);
      const allServices = servicesRes.data.data;
      const allProducts = productsRes.data.data;
      // Filter to only show services/products for this company
      const companyServices = allServices.filter(s => Number(s.company_id) === Number(user?.company_id));
      const companyProducts = allProducts.filter(p => Number(p.company_id) === Number(user?.company_id));
      setServices(companyServices);
      setProducts(companyProducts);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Services Dashboard</h1>
        <p className="text-gray-600">Manage your service business and clients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{services.length}</div>
          <div className="text-gray-600">Total Services</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">{products.length}</div>
          <div className="text-gray-600">Materials / Products</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">0</div>
          <div className="text-gray-600">Customers</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-orange-600">0</div>
          <div className="text-gray-600">Revenue This Month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Services</h2>
          {loading ? (
            <div className="animate-pulse">Loading...</div>
          ) : services.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">💼</div>
              <p>No services yet. Create your first service!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                  <div className="text-xl font-bold text-blue-600">{formatCurrency(service.price)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Reports</h2>
          <div className="space-y-3">
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
              <div className="font-semibold">Service Revenue Report</div>
              <div className="text-sm text-gray-500">Track income from services</div>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
              <div className="font-semibold">Employee Performance</div>
              <div className="text-sm text-gray-500">Analyze service delivery</div>
            </div>
            <div className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
              <div className="font-semibold">Profit/Loss</div>
              <div className="text-sm text-gray-500">Financial performance</div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </DashboardLayout>
  );
};

export default ServicesDashboard;

