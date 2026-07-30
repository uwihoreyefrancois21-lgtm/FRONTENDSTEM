
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = (isCompanyAdmin) => {
  const baseItems = [
    { path: '/projects', label: 'Dashboard', icon: '🏠' },
    { path: '/projects/projects', label: 'Projects', icon: '📊' },
    { path: '/projects/workers', label: 'Project Workers', icon: '👷' },
    { path: '/projects/materials', label: 'Project Materials', icon: '🛠️' },
    { path: '/projects/expenses', label: 'Project Expenses', icon: '💰' },
    { path: '/projects/tasks', label: 'Tasks', icon: '✅' },
    { path: '/projects/reports', label: 'Reports', icon: '📈' },
    { path: '/projects/ai', label: 'AI Assistant', icon: '🤖' },
  ];

  if (isCompanyAdmin) {
    baseItems.push({ path: '/company/users', label: 'Users', icon: '👥' });
  }

  return baseItems;
};

const ProjectMaterials = () => {
  const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, formatCurrency, hasPermission } = useAuth();

  const isCompanyAdmin = user?.role?.name === 'Company Admin' || user?.is_super_admin;
  const menuItems = getMenuItems(isCompanyAdmin);
  const [formData, setFormData] = useState({
    project_id: '',
    product_id: '',
    quantity: '',
    unit_cost: '',
    used_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('=== Fetching Project Materials Data ===');
      const [materialsRes, projectsRes, productsRes] = await Promise.all([
        api.get('/project-materials'),
        api.get('/projects'),
        api.get('/products'),
      ]);

      console.log('Materials Response:', materialsRes.data);
      console.log('Projects Response:', projectsRes.data);
      console.log('Products Response:', productsRes.data);

      // Parse data - check if data has .data property
      const materialsData = materialsRes?.data?.data || materialsRes?.data || [];
      const projectsData = projectsRes?.data?.data || projectsRes?.data || [];
      const productsData = productsRes?.data?.data || productsRes?.data || [];

      console.log('✅ Parsed materials:', materialsData);
      console.log('✅ Parsed projects:', projectsData);
      console.log('✅ Parsed products:', productsData);

      // Filter by current user's company
      const companyProjects = projectsData.filter(p =>
        Number(p.company_id) === Number(user?.company_id)
      );

      const companyProjectIds = companyProjects.map(p => Number(p.id));
      const companyMaterials = materialsData.filter(m =>
        companyProjectIds.includes(Number(m.project_id))
      );

      const companyProducts = productsData.filter(p =>
        Number(p.company_id) === Number(user?.company_id)
      );

      console.log('🏢 Filtered company projects:', companyProjects);
      console.log('🏢 Filtered company products:', companyProducts);

      setMaterials(companyMaterials);
      setProjects(companyProjects);
      setProducts(companyProducts);
    } catch (error) {
      console.error('❌ Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        project_id: Number(formData.project_id),
        product_id: Number(formData.product_id),
        quantity: Number(formData.quantity),
        unit_cost: Number(formData.unit_cost),
      };

      if (editingMaterial) {
        await api.put(`/project-materials/${editingMaterial.id}`, payload);
        toast.success('Material updated successfully!');
      } else {
        await api.post('/project-materials', payload);
        toast.success('Material assigned successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this material from the project?')) {
      try {
        await api.delete(`/project-materials/${id}`);
        toast.success('Material removed successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to remove material');
      }
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      project_id: material.project_id || '',
      product_id: material.product_id || '',
      quantity: material.quantity || '',
      unit_cost: material.unit_cost || '',
      used_date: material.used_date || new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setFormData({
      project_id: '',
      product_id: '',
      quantity: '',
      unit_cost: '',
      used_date: new Date().toISOString().split('T')[0],
    });
  };

  const getProductName = (productId) => {
    const product = products.find(p => Number(p.id) === Number(productId));
    return product?.name || 'N/A';
  };

  const getProjectName = (projectId) => {
    const project = projects.find(p => Number(p.id) === Number(projectId));
    return project?.name || 'N/A';
  };

  const calculateTotal = (quantity, unitCost) => {
    return Number(quantity) * Number(unitCost);
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Project Materials</h1>
        <p className="text-gray-600">Manage materials used in projects</p>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        {hasPermission('project_materials', 'create') && (
          <>
            <button
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
              disabled={projects.length === 0 || products.length === 0}
            >
              + Add Project Material
            </button>
            {projects.length === 0 && (
              <button
                onClick={() => navigate('/projects/projects')}
                className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition"
              >
                Create Project First
              </button>
            )}
            {products.length === 0 && (
              <button
                onClick={() => navigate('/products/products')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition"
              >
                Create Product First
              </button>
            )}
          </>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit Cost</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Used Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {materials.map(material => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{getProjectName(material.project_id)}</td>
                    <td className="px-6 py-4">{getProductName(material.product_id)}</td>
                    <td className="px-6 py-4">{material.quantity}</td>
                    <td className="px-6 py-4">{formatCurrency(material.unit_cost)}</td>
                    <td className="px-6 py-4">{formatCurrency(calculateTotal(material.quantity, material.unit_cost))}</td>
                    <td className="px-6 py-4">{material.used_date}</td>
                    <td className="px-6 py-4">
                      {hasPermission('project_materials', 'update') && (
                        <button onClick={() => handleEdit(material)} className="text-blue-600 hover:text-blue-800 mr-3">
                          Edit
                        </button>
                      )}
                      {hasPermission('project_materials', 'delete') && (
                        <button onClick={() => handleDelete(material.id)} className="text-red-600 hover:text-red-800">
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {materials.length === 0 && (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No materials added yet!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingMaterial ? 'Edit Project Material' : 'Add Project Material'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  value={formData.project_id}
                  onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                  disabled={projects.length === 0}
                >
                  <option value="">{projects.length === 0 ? 'No projects available' : 'Select Project'}</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product</label>
                <select
                  value={formData.product_id}
                  onChange={e => {
                    const product = products.find(p => Number(p.id) === Number(e.target.value));
                    setFormData({
                      ...formData,
                      product_id: e.target.value,
                      unit_cost: product?.cost_price || ''
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                  disabled={products.length === 0}
                >
                  <option value="">{products.length === 0 ? 'No products available' : 'Select Product'}</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stock_quantity || 0})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost</label>
                <input
                  type="number"
                  value={formData.unit_cost}
                  onChange={e => setFormData({ ...formData, unit_cost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Used Date</label>
                <input
                  type="date"
                  value={formData.used_date}
                  onChange={e => setFormData({ ...formData, used_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingMaterial ? 'Update' : 'Add'}
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

export default ProjectMaterials;
