
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = () => {
  return [
    { path: '/products', label: 'Dashboard', icon: '🏠' },
    { path: '/products/products', label: 'Products', icon: '🛒' },
    { path: '/products/inventory', label: 'Inventory', icon: '📦' },
    { path: '/products/sales', label: 'Sales / POS', icon: '💰' },
    { path: '/products/suppliers-customers', label: 'Suppliers & Customers', icon: '👥' },
    { path: '/products/reports', label: 'Reports', icon: '📈' },
    { path: '/products/ai', label: 'AI Assistant', icon: '🤖' },
  ];
};

const ProductsManagement = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [stockMovements, setStockMovements] = useState([]);
  const [sales, setSales] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, formatCurrency } = useAuth();
  
  const menuItems = getMenuItems();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('inventory')) {
      setActiveTab('inventory');
    } else if (path.includes('sales')) {
      setActiveTab('sales');
    } else if (path.includes('suppliers-customers')) {
      setActiveTab('suppliers-customers');
    } else if (path.includes('categories')) {
      setActiveTab('categories');
    } else if (path.includes('units')) {
      setActiveTab('units');
    } else {
      setActiveTab('products');
    }
  }, [location.pathname]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, unitsRes, stockMovementsRes, salesRes, customersRes, suppliersRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/units'),
        api.get('/stock_movements'),
        api.get('/sales'),
        api.get('/customers'),
        api.get('/suppliers'),
      ]);
      const companyId = Number(user?.company_id);
      setProducts(productsRes.data.data.filter(p => Number(p.company_id) === companyId));
      setCategories(categoriesRes.data.data.filter(c => Number(c.company_id) === companyId));
      setUnits(unitsRes.data.data.filter(u => Number(u.company_id) === companyId));
      setStockMovements(stockMovementsRes.data.data.filter(sm => Number(sm.company_id) === companyId));
      setSales(salesRes.data.data.filter(s => Number(s.company_id) === companyId));
      setCustomers(customersRes.data.data.filter(c => Number(c.company_id) === companyId));
      setSuppliers(suppliersRes.data.data.filter(s => Number(s.company_id) === companyId));
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        company_id: user?.company_id,
        cost_price: formData.cost_price ? Number(formData.cost_price) : null,
        selling_price: formData.selling_price ? Number(formData.selling_price) : null,
        stock_quantity: formData.stock_quantity ? Number(formData.stock_quantity) : null,
        min_stock: formData.min_stock ? Number(formData.min_stock) : null,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        unit_id: formData.unit_id ? Number(formData.unit_id) : null,
      };

      if (editingItem) {
        await api.put(`/products/${editingItem.id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        company_id: user?.company_id,
        parent_id: formData.parent_id ? Number(formData.parent_id) : null,
      };
      
      if (editingItem) {
        await api.put(`/categories/${editingItem.id}`, payload);
        toast.success('Category updated successfully!');
      } else {
        await api.post('/categories', payload);
        toast.success('Category created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleUnitSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        company_id: user?.company_id,
      };
      
      if (editingItem) {
        await api.put(`/units/${editingItem.id}`, payload);
        toast.success('Unit updated successfully!');
      } else {
        await api.post('/units', payload);
        toast.success('Unit created successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/products/${id}`);
        toast.success('Product deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete product');
      }
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const handleDeleteUnit = async (id) => {
    if (window.confirm('Are you sure you want to delete this unit?')) {
      try {
        await api.delete(`/units/${id}`);
        toast.success('Unit deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete unit');
      }
    }
  };

  const handleStockMovementSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        company_id: user?.company_id,
        product_id: Number(formData.product_id),
        quantity: Number(formData.quantity),
      };
      await api.post('/stock_movements', payload);
      toast.success('Stock movement recorded successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleSaleSubmit = async (e) => {
    e.preventDefault();
    try {
      const subtotal = Number(formData.total_amount);
      const discount = Number(formData.discount) || 0;
      const total_amount = subtotal - discount;
      const paid_amount = Number(formData.paid_amount) || 0;
      const payload = {
        ...formData,
        company_id: user?.company_id,
        user_id: user?.id,
        customer_id: formData.customer_id ? Number(formData.customer_id) : null,
        subtotal: subtotal,
        discount: discount,
        total_amount: total_amount,
        paid_amount: paid_amount,
        balance_amount: total_amount - paid_amount,
        sale_status: formData.sale_status || 'Completed',
        sale_date: new Date().toISOString(),
      };
      await api.post('/sales', payload);
      toast.success('Sale recorded successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEditProduct = (product) => {
    setActiveTab('products');
    setEditingItem(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      cost_price: product.cost_price || '',
      selling_price: product.selling_price || '',
      stock_quantity: product.stock_quantity || '',
      min_stock: product.min_stock || '',
      category_id: product.category_id || '',
      unit_id: product.unit_id || '',
    });
    setIsModalOpen(true);
  };

  const openStockMovementModal = () => {
    setActiveTab('inventory');
    resetForm();
    setFormData({ movement_type: 'ADJUSTMENT', quantity: '', notes: '' });
    setIsModalOpen(true);
  };

  const openSaleModal = () => {
    setActiveTab('sales');
    resetForm();
    setFormData({ 
      customer_id: '', 
      invoice_number: '', 
      total_amount: '', 
      discount: '', 
      paid_amount: '', 
      payment_status: 'Pending', 
      sale_status: 'Completed' 
    });
    setIsModalOpen(true);
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'N/A';
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'N/A';
  };

  const handleEditCategory = (category) => {
    setActiveTab('categories');
    setEditingItem(category);
    setFormData({
      name: category.name || '',
      parent_id: category.parent_id || '',
    });
    setIsModalOpen(true);
  };

  const handleEditUnit = (unit) => {
    setActiveTab('units');
    setEditingItem(unit);
    setFormData({
      name: unit.name || '',
      short_name: unit.short_name || '',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({});
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'N/A';
  };

  const getUnitName = (unitId) => {
    const unit = units.find(u => u.id === unitId);
    return unit?.name || 'N/A';
  };

  const getStockColor = (stock, minStock) => {
    if (!minStock || stock > minStock) return 'text-green-600';
    if (stock === minStock) return 'text-yellow-600';
    return 'text-red-600';
  };

  const openProductModal = () => {
    setActiveTab('products');
    resetForm();
    setIsModalOpen(true);
  };

  const openCategoryModal = () => {
    setActiveTab('categories');
    resetForm();
    setFormData({ name: '', parent_id: '' });
    setIsModalOpen(true);
  };

  const openUnitModal = () => {
    setActiveTab('units');
    resetForm();
    setFormData({ name: '', short_name: '' });
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Product Management
        </h1>
        <p className="text-gray-600">Manage your products, categories, and units</p>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="flex flex-wrap gap-1">
          <button
            onClick={() => setActiveTab('products')}
            className={`py-3 px-6 rounded-t-xl font-semibold text-sm transition-all ${
              activeTab === 'products'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Products
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-6 rounded-t-xl font-semibold text-sm transition-all ${
              activeTab === 'categories'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Categories
          </button>
          <button
            onClick={() => setActiveTab('units')}
            className={`py-3 px-6 rounded-t-xl font-semibold text-sm transition-all ${
              activeTab === 'units'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Units
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`py-3 px-6 rounded-t-xl font-semibold text-sm transition-all ${
              activeTab === 'inventory'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`py-3 px-6 rounded-t-xl font-semibold text-sm transition-all ${
              activeTab === 'sales'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Sales
          </button>
          <button
            onClick={() => setActiveTab('suppliers-customers')}
            className={`py-3 px-6 rounded-t-xl font-semibold text-sm transition-all ${
              activeTab === 'suppliers-customers'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Suppliers & Customers
          </button>
        </nav>
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <>
          <div className="mb-6">
            <button
              onClick={openProductModal}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              + Add New Product
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-sm p-12 text-center text-gray-500">
              <div className="text-5xl mb-4 animate-pulse">⏳</div>
              <p className="text-lg">Loading.......</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Product Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">SKU</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{product.name}</div>
                          {product.description && (
                            <div className="text-sm text-gray-500 mt-1">{product.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{product.sku || '-'}</td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{getCategoryName(product.category_id)}</td>
                        <td className="px-6 py-4 font-bold text-blue-600">{formatCurrency(product.selling_price)}</td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${getStockColor(product.stock_quantity, product.min_stock)}`}>
                            {product.stock_quantity} {getUnitName(product.unit_id)}
                          </span>
                          {product.min_stock && product.stock_quantity <= product.min_stock && (
                            <div className="text-xs text-red-500 font-medium mt-1">Low stock!</div>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleEditProduct(product)} className="text-blue-600 hover:text-blue-800 mr-4 font-medium transition-colors">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteProduct(product.id)} className="text-red-600 hover:text-red-800 font-medium transition-colors">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center text-gray-500">
                          <div className="text-6xl mb-4">🛒</div>
                          <h3 className="text-xl font-bold mb-2 text-gray-700">No products yet</h3>
                          <p className="mb-8 text-gray-500">Create your first product to get started</p>
                          <button
                            onClick={openProductModal}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                          >
                            Create Product
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <>
          <div className="mb-6">
            <button
              onClick={openCategoryModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Add New Category
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Parent Category</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {categories.map(category => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{category.name}</td>
                        <td className="px-6 py-4 text-gray-600">{getCategoryName(category.parent_id)}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleEditCategory(category)} className="text-blue-600 hover:text-blue-800 mr-3">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteCategory(category.id)} className="text-red-600 hover:text-red-800">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {categories.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                          <div className="text-5xl mb-4">📂</div>
                          <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
                          <p className="mb-6">Create your first category to get started</p>
                          <button
                            onClick={openCategoryModal}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Create Category
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Units Tab */}
      {activeTab === 'units' && (
        <>
          <div className="mb-6">
            <button
              onClick={openUnitModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Add New Unit
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Short Name</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {units.map(unit => (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{unit.name}</td>
                        <td className="px-6 py-4 text-gray-600">{unit.short_name}</td>
                        <td className="px-6 py-4">
                          <button onClick={() => handleEditUnit(unit)} className="text-blue-600 hover:text-blue-800 mr-3">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteUnit(unit.id)} className="text-red-600 hover:text-red-800">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {units.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                          <div className="text-5xl mb-4">⚖️</div>
                          <h3 className="text-lg font-semibold mb-2">No units yet</h3>
                          <p className="mb-6">Create your first unit to get started</p>
                          <button
                            onClick={openUnitModal}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Create Unit
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Inventory Tab */}
      {activeTab === 'inventory' && (
        <>
          <div className="mb-6">
            <button
              onClick={openStockMovementModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Add Stock Movement
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stockMovements.map(movement => (
                      <tr key={movement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{getProductName(movement.product_id)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            movement.movement_type === 'PURCHASE' || movement.movement_type === 'RETURN' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {movement.movement_type}
                          </span>
                        </td>
                        <td className="px-6 py-4">{movement.quantity}</td>
                        <td className="px-6 py-4 text-gray-600">{movement.notes || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{new Date(movement.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {stockMovements.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <div className="text-5xl mb-4">📦</div>
                          <h3 className="text-lg font-semibold mb-2">No stock movements yet</h3>
                          <p className="mb-6">Record your first stock movement to get started</p>
                          <button
                            onClick={openStockMovementModal}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Add Stock Movement
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Sales Tab */}
      {activeTab === 'sales' && (
        <>
          <div className="mb-6">
            <button
              onClick={openSaleModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Record New Sale
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sales.map(sale => (
                      <tr key={sale.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">{sale.invoice_number || '-'}</td>
                        <td className="px-6 py-4 text-gray-600">{getCustomerName(sale.customer_id)}</td>
                        <td className="px-6 py-4 font-semibold text-blue-600">{formatCurrency(sale.total_amount)}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            sale.payment_status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {sale.payment_status || 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{new Date(sale.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {sales.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          <div className="text-5xl mb-4">💰</div>
                          <h3 className="text-lg font-semibold mb-2">No sales yet</h3>
                          <p className="mb-6">Record your first sale to get started</p>
                          <button
                            onClick={openSaleModal}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                          >
                            Record Sale
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Suppliers & Customers Tab */}
      {activeTab === 'suppliers-customers' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Suppliers</h3>
              {loading ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {suppliers.map(supplier => (
                          <tr key={supplier.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{supplier.name}</td>
                            <td className="px-4 py-3 text-gray-600">{supplier.email || '-'}</td>
                          </tr>
                        ))}
                        {suppliers.length === 0 && (
                          <tr>
                            <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                              No suppliers yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Customers</h3>
              {loading ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {customers.map(customer => (
                          <tr key={customer.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{customer.name}</td>
                            <td className="px-4 py-3 text-gray-600">{customer.phone || '-'}</td>
                          </tr>
                        ))}
                        {customers.length === 0 && (
                          <tr>
                            <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                              No customers yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingItem 
                ? (activeTab === 'products' ? 'Edit Product' : activeTab === 'categories' ? 'Edit Category' : 'Edit Unit')
                : activeTab === 'inventory' ? 'Record Stock Movement'
                : activeTab === 'sales' ? 'Record New Sale'
                : (activeTab === 'products' ? 'Create New Product' : activeTab === 'categories' ? 'Create New Category' : 'Create New Unit')
              }
            </h2>
            <form 
              onSubmit={
                activeTab === 'products' 
                  ? handleProductSubmit 
                  : activeTab === 'categories' 
                    ? handleCategorySubmit 
                    : activeTab === 'inventory'
                      ? handleStockMovementSubmit
                      : activeTab === 'sales'
                        ? handleSaleSubmit
                        : handleUnitSubmit
              } 
              className="space-y-4"
            >
              {/* Product Form */}
              {activeTab === 'products' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      value={formData.sku || ''}
                      onChange={e => setFormData({ ...formData, sku: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                    <input
                      type="text"
                      value={formData.barcode || ''}
                      onChange={e => setFormData({ ...formData, barcode: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cost Price</label>
                    <input
                      type="number"
                      value={formData.cost_price || ''}
                      onChange={e => setFormData({ ...formData, cost_price: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price</label>
                    <input
                      type="number"
                      value={formData.selling_price || ''}
                      onChange={e => setFormData({ ...formData, selling_price: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={formData.stock_quantity || ''}
                      onChange={e => setFormData({ ...formData, stock_quantity: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stock</label>
                    <input
                      type="number"
                      value={formData.min_stock || ''}
                      onChange={e => setFormData({ ...formData, min_stock: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category_id || ''}
                      onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                    <select
                      value={formData.unit_id || ''}
                      onChange={e => setFormData({ ...formData, unit_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Unit</option>
                      {units.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Category Form */}
              {activeTab === 'categories' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category (optional)</label>
                    <select
                      value={formData.parent_id || ''}
                      onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">None (Top Level)</option>
                      {categories
                        .filter(c => !editingItem || c.id !== editingItem.id)
                        .map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}

              {/* Unit Form */}
              {activeTab === 'units' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Unit Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g., Kilogram, Meter"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Short Name</label>
                    <input
                      type="text"
                      value={formData.short_name || ''}
                      onChange={e => setFormData({ ...formData, short_name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="e.g., kg, m"
                      required
                    />
                  </div>
                </>
              )}

              {/* Stock Movement Form */}
              {activeTab === 'inventory' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                    <select
                      value={formData.product_id || ''}
                      onChange={e => setFormData({ ...formData, product_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="">Select Product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Movement Type</label>
                    <select
                      value={formData.movement_type || 'ADJUSTMENT'}
                      onChange={e => setFormData({ ...formData, movement_type: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="PURCHASE">Purchase (Stock In)</option>
                      <option value="SALE">Sale (Stock Out)</option>
                      <option value="RETURN">Return</option>
                      <option value="DAMAGED">Damaged</option>
                      <option value="EXPIRED">Expired</option>
                      <option value="ADJUSTMENT">Adjustment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      value={formData.quantity || ''}
                      onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                    <textarea
                      value={formData.notes || ''}
                      onChange={e => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Sales Form */}
              {activeTab === 'sales' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                    <input
                      type="text"
                      value={formData.invoice_number || ''}
                      onChange={e => setFormData({ ...formData, invoice_number: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer (Optional)</label>
                    <select
                      value={formData.customer_id || ''}
                      onChange={e => setFormData({ ...formData, customer_id: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subtotal</label>
                    <input
                      type="number"
                      value={formData.total_amount || ''}
                      onChange={e => setFormData({ ...formData, total_amount: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Discount</label>
                    <input
                      type="number"
                      value={formData.discount || ''}
                      onChange={e => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Paid Amount</label>
                    <input
                      type="number"
                      value={formData.paid_amount || ''}
                      onChange={e => setFormData({ ...formData, paid_amount: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                    <select
                      value={formData.payment_status || 'Pending'}
                      onChange={e => setFormData({ ...formData, payment_status: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sale Status</label>
                    <select
                      value={formData.sale_status || 'Completed'}
                      onChange={e => setFormData({ ...formData, sale_status: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="Completed">Completed</option>
                      <option value="Pending">Pending</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all"
                >
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </DashboardLayout>
  );
};

export default ProductsManagement;
