
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import api from '../../utils/api';

const getMenuItems = () => {
  const baseItems = [
    { path: '/company', label: 'Company Dashboard', icon: '🏠' },
    { path: '/company/users', label: 'Users', icon: '👥' },
    { path: '/company/employees', label: 'Employees', icon: '👨‍💼' },
    { path: '/company/workers', label: 'Workers', icon: '👷' },
  ];
  
  return [...baseItems, 
    { path: '/products', label: 'Products Dashboard', icon: '🛒' },
    { path: '/products/products', label: 'Products', icon: '🛒' },
    { path: '/products/inventory', label: 'Inventory', icon: '📦' },
    { path: '/products/suppliers-customers', label: 'Suppliers & Customers', icon: '👥' },
    { path: '/products/sales', label: 'Sales / POS', icon: '💰' },
    { path: '/products/reports', label: 'Reports', icon: '📈' },
    { path: '/products/ai', label: 'AI Assistant', icon: '🤖' },
    { path: '/profile', label: 'My Profile', icon: '👤' }
  ];
};

const ProductsDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, formatCurrency } = useAuth();
  const menuItems = getMenuItems();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      const allProducts = response.data.data;
      // Filter to only show products for this company
      const companyProducts = allProducts.filter(p => Number(p.company_id) === Number(user?.company_id));
      setProducts(companyProducts);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const lowStockProducts = products.filter(p => p.stock_quantity <= (p.min_stock || 10));

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Products & POS Dashboard</h1>
        <p className="text-gray-600">Manage your inventory and sales operations</p>      
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{products.length}</div>
          <div className="text-gray-600">Total Products</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-red-600">{lowStockProducts.length}</div>
          <div className="text-gray-600">Low Stock</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-purple-600">0</div>
          <div className="text-gray-600">Sales Today</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-orange-600">0</div>
          <div className="text-gray-600">Revenue This Month</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Products</h2>
          {loading ? (
            <div className="animate-pulse">Loading...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">🛒</div>
              <p>No products yet. Add your first product!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {products.slice(0, 5).map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-semibold">{product.name}</div>       
                    <div className="text-sm text-gray-500">SKU: {product.sku || 'N/A'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">{formatCurrency(product.selling_price)}</div>
                    <div className={`text-sm font-semibold ${
                      product.stock_quantity <= (product.min_stock || 10) ? 'text-red-600' : 'text-green-600'
                    }`}>
                      Stock: {product.stock_quantity}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {lowStockProducts.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-red-600 mb-4">⚠️ Low Stock Alert</h2>
            <div className="space-y-4">
              {lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center justify-between p-4 border-2 border-red-200 rounded-lg bg-red-50">
                  <div>
                    <div className="font-semibold">{product.name}</div>       
                    <div className="text-sm text-gray-500">Min: {product.min_stock || 10}</div>
                  </div>
                  <div className="text-lg font-bold text-red-600">
                    {product.stock_quantity} left
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <h3 className="font-semibold mb-1">Inventory Report</h3>
            <p className="text-sm text-gray-500">Stock levels and movements</p>
          </div>
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <h3 className="font-semibold mb-1">Sales Report</h3>
            <p className="text-sm text-gray-500">Revenue and transaction details</p>
          </div>
          <div className="p-4 border rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <h3 className="font-semibold mb-1">Profit/Loss</h3>
            <p className="text-sm text-gray-500">Financial performance</p>
          </div>
        </div>
      </div>

      <ToastContainer />
    </DashboardLayout>
  );
};

export default ProductsDashboard;

