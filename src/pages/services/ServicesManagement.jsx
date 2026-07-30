
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = () => {
  return [
    { path: '/services', label: 'Dashboard', icon: '🏠' },
    { path: '/services/services', label: 'Services', icon: '💼' },
    { path: '/services/sales', label: 'Sales', icon: '💰' },
    { path: '/services/reports', label: 'Reports', icon: '📈' },
    { path: '/services/ai', label: 'AI Assistant', icon: '🤖' },
  ];
};

const ServicesManagement = () => {
  const [activeTab, setActiveTab] = useState('services');
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, formatCurrency } = useAuth();
  
  const menuItems = getMenuItems();
  const [formData, setFormData] = useState({});
  const [serviceMaterials, setServiceMaterials] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const [serviceMaterialsList, setServiceMaterialsList] = useState([]);

  const fetchData = async () => {
    try {
      const [servicesRes, categoriesRes, productsRes, materialsRes] = await Promise.all([
        api.get('/services'),
        api.get('/categories'),
        api.get('/products'),
        api.get('/service_materials'),
      ]);
      const companyServices = servicesRes.data.data.filter(s => Number(s.company_id) === Number(user?.company_id));
      const companyCategories = categoriesRes.data.data.filter(c => Number(c.company_id) === Number(user?.company_id));
      const companyProducts = productsRes.data.data.filter(p => Number(p.company_id) === Number(user?.company_id));
      const companyMaterials = materialsRes.data.data.filter(m => {
        const service = companyServices.find(s => s.id === m.service_id);
        return !!service;
      });
      
      setServices(companyServices);
      setCategories(companyCategories);
      setProducts(companyProducts);
      setServiceMaterialsList(companyMaterials);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const getMaterialsForService = (serviceId) => {
    return serviceMaterialsList.filter(m => Number(m.service_id) === Number(serviceId));
  };

  const handleServiceSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...formData, 
        company_id: user?.company_id,
        price: formData.price ? Number(formData.price) : null,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        scheduled_datetime: formData.scheduled_datetime || null,
      };

      let serviceResponse;
      if (editingItem) {
        serviceResponse = await api.put(`/services/${editingItem.id}`, payload);
        toast.success('Service updated successfully!');
      } else {
        serviceResponse = await api.post('/services', payload);
        toast.success('Service created successfully!');
      }

      // Now handle service materials
      const serviceId = editingItem ? editingItem.id : serviceResponse.data.data?.id;

      // First, get existing materials if editing to delete them
      if (editingItem) {
        try {
          const existingMaterialsRes = await api.get('/service_materials');
          const existingMaterials = existingMaterialsRes.data.data.filter(m => Number(m.service_id) === Number(serviceId));
          for (const material of existingMaterials) {
            await api.delete(`/service_materials/${material.id}`);
          }
        } catch (e) {
          console.error('Error deleting old materials:', e);
        }
      }

      // Add new materials
      for (const material of serviceMaterials) {
        if (material.product_id) {
          await api.post('/service_materials', {
            service_id: Number(serviceId),
            product_id: Number(material.product_id),
            quantity: Number(material.quantity) || 1,
          });
        }
      }

      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteService = async (id) => {
    if (window.confirm('Are you sure you want to delete this service?')) {
      try {
        await api.delete(`/services/${id}`);
        toast.success('Service deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete service');
      }
    }
  };

  const handleEditService = async (service) => {
    setActiveTab('services');
    setEditingItem(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      price: service.price || '',
      category_id: service.category_id || '',
      scheduled_datetime: service.scheduled_datetime ? new Date(service.scheduled_datetime).toISOString().slice(0, 16) : '',
    });

    // Fetch existing service materials for this service
    try {
      const materialsRes = await api.get('/service_materials');
      const materials = materialsRes.data.data.filter(m => Number(m.service_id) === Number(service.id));
      setServiceMaterials(materials.map(m => ({
        product_id: m.product_id,
        quantity: m.quantity
      })));
    } catch (e) {
      console.error('Error loading service materials:', e);
      setServiceMaterials([]);
    }

    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({});
    setServiceMaterials([]);
  };

  const addMaterial = () => {
    setServiceMaterials([
      ...serviceMaterials,
      { product_id: '', quantity: 1 }
    ]);
  };

  const removeMaterial = (index) => {
    const newMaterials = [...serviceMaterials];
    newMaterials.splice(index, 1);
    setServiceMaterials(newMaterials);
  };

  const updateMaterial = (index, field, value) => {
    const newMaterials = [...serviceMaterials];
    newMaterials[index][field] = value;
    setServiceMaterials(newMaterials);
  };

  const getProductName = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.name || 'N/A';
  };

  const getProductPrice = (productId) => {
    const product = products.find(p => p.id === productId);
    return product?.price || 0;
  };

  const getMaterialTotal = (material) => {
    const price = getProductPrice(material.product_id);
    return Number(price) * Number(material.quantity);
  };

  const getServiceTotalMaterialsCost = (materials) => {
    return materials.reduce((total, mat) => {
      return total + getMaterialTotal(mat);
    }, 0);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'N/A';
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

  const handleEditCategory = (category) => {
    setActiveTab('categories');
    setEditingItem(category);
    setFormData({
      name: category.name || '',
      parent_id: category.parent_id || '',
    });
    setIsModalOpen(true);
  };

  const openServiceModal = () => {
    setActiveTab('services');
    resetForm();
    setFormData({ name: '', description: '', price: '', category_id: '', scheduled_datetime: '' });
    setServiceMaterials([]);
    setIsModalOpen(true);
  };

  const openCategoryModal = () => {
    setActiveTab('categories');
    resetForm();
    setFormData({ name: '', parent_id: '' });
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Service Management</h1>
        <p className="text-gray-600">Manage your company services and categories</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'services'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Services
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categories
          </button>
        </nav>
      </div>

      {activeTab === 'services' && (
        <>
          <div className="mb-6">
            <button
              onClick={openServiceModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              + Add New Service
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => {
                const materials = getMaterialsForService(service.id);
                const totalMaterialCost = materials.reduce((total, mat) => {
                  return total + (Number(getProductPrice(mat.product_id)) * Number(mat.quantity));
                }, 0);
                return (
                  <div key={service.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-gray-800">{service.name}</h3>
                      <div className="flex gap-2">
                        <button onClick={() => handleEditService(service)} className="text-blue-600 hover:text-blue-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button onClick={() => handleDeleteService(service.id)} className="text-red-600 hover:text-red-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2.2 0 0116.138 21H7.862a2.2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4">{service.description || 'No description'}</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-bold text-blue-600">{formatCurrency(service.price)}</span>
                      </div>
                      {service.scheduled_datetime && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Scheduled:</span>
                          <span className="text-gray-800">{new Date(service.scheduled_datetime).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-500">Category:</span>
                        <span className="text-gray-800">{getCategoryName(service.category_id)}</span>
                      </div>
                      {totalMaterialCost > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Materials Cost:</span>
                          <span className="font-semibold text-orange-600">{formatCurrency(totalMaterialCost)}</span>
                        </div>
                      )}
                    </div>
                    {materials.length > 0 && (
                      <div className="border-t border-gray-100 pt-3">
                        <p className="text-xs font-semibold text-gray-500 mb-2">Materials Used:</p>
                        <div className="space-y-1">
                          {materials.map((mat, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {getProductName(mat.product_id)} x {mat.quantity}
                              </span>
                              <span className="text-gray-800">
                                {formatCurrency(Number(getProductPrice(mat.product_id)) * Number(mat.quantity))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {services.length === 0 && (
                <div className="col-span-full bg-white rounded-xl shadow-sm p-12 text-center">
                  <div className="text-6xl mb-4">💼</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No services yet</h3>
                  <p className="text-gray-600 mb-6">Create your first service to get started</p>
                  <button
                    onClick={openServiceModal}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                  >
                    Create Your First Service
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}

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

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingItem 
                ? (activeTab === 'services' ? 'Edit Service' : 'Edit Category')
                : (activeTab === 'services' ? 'Create New Service' : 'Create New Category')
              }
            </h2>
            <form 
              onSubmit={activeTab === 'services' ? handleServiceSubmit : handleCategorySubmit} 
              className="space-y-4"
            >
              {activeTab === 'services' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Service Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                      <input
                        type="number"
                        value={formData.price || ''}
                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Date & Time</label>
                      <input
                        type="datetime-local"
                        value={formData.scheduled_datetime || ''}
                        onChange={e => setFormData({ ...formData, scheduled_datetime: e.target.value })}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
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
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">Materials Used (Products)</label>
                      <button
                        type="button"
                        onClick={addMaterial}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                      >
                        + Add Material
                      </button>
                    </div>
                    {serviceMaterials.map((material, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg mb-2 grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
                        <div>
                          <select
                            value={material.product_id}
                            onChange={e => updateMaterial(index, 'product_id', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
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
                          <input
                            type="number"
                            value={material.quantity}
                            onChange={e => updateMaterial(index, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Qty"
                            min="1"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-600">
                            {material.product_id ? formatCurrency(getProductPrice(material.product_id)) : '-'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">
                            {material.product_id ? formatCurrency(getMaterialTotal(material)) : '-'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMaterial(index)}
                          className="text-red-600 hover:text-red-800 justify-self-end"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {serviceMaterials.length > 0 && (
                      <div className="flex justify-between mt-3 pt-2 border-t border-gray-200">
                        <span className="font-semibold text-gray-700">Total Materials Cost:</span>
                        <span className="font-bold text-orange-600">
                          {formatCurrency(getServiceTotalMaterialsCost(serviceMaterials))}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}

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

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
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

export default ServicesManagement;
