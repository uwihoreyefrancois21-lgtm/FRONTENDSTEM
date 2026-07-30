
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = (isCompanyAdmin) => {
  const baseItems = [
    { path: '/projects', label: 'Dashboard', icon: '🏠' },
    { path: '/projects/projects', label: 'Projects', icon: '📊' },
    { path: '/projects/workers', label: 'Project Workers', icon: '👷' },
    { path: '/projects/expenses', label: 'Project Expenses', icon: '💰' },
    { path: '/projects/tasks', label: 'Tasks', icon: '✅' },
    { path: '/projects/reports', label: 'Reports', icon: '📈' },
    { path: '/projects/ai', label: 'AI Assistant', icon: '🤖' },
  ];
  
  // Add admin-only menu items
  if (isCompanyAdmin) {
    baseItems.push({ path: '/company/users', label: 'Users', icon: '👥' });
  }
  
  return baseItems;
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [companyWorkers, setCompanyWorkers] = useState([]);
  const [products, setProducts] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { user } = useAuth();
  
  const isCompanyAdmin = user?.role?.name === 'Company Admin' || user?.is_super_admin;

  const [isWorkerModalOpen, setIsWorkerModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [workerFormData, setWorkerFormData] = useState({
    worker_id: '',
    role: '',
    payment_type: 'daily',
    rate: '',
  });

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialFormData, setMaterialFormData] = useState({
    product_id: '',
    quantity: '',
    unit_cost: '',
    used_date: '',
  });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseFormData, setExpenseFormData] = useState({
    expense_category_id: '',
    custom_category_name: '',
    title: '',
    description: '',
    amount: '',
    expense_date: '',
    payment_method: '',
    status: 'Approved',
  });

  const menuItems = getMenuItems(isCompanyAdmin);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      console.log('Fetching project data for ID:', id);
      const [
        projectRes,
        tasksRes,
        materialsRes,
        expensesRes,
        workersListRes,
        productsRes,
        expenseCategoriesRes
      ] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/project-tasks'),
        api.get('/project-materials'),
        api.get('/expenses'),
        api.get('/workers'),
        api.get('/products'),
        api.get('/expense-categories'),
      ]);

      console.log('✅ Project data:', projectRes.data.data);
      console.log('✅ All tasks:', tasksRes.data.data);

      setProject(projectRes.data.data);

      const companyWorkersList = workersListRes.data.data.filter(w => Number(w.company_id) === Number(user?.company_id));
      const companyProducts = productsRes.data.data.filter(p => Number(p.company_id) === Number(user?.company_id));
      const companyExpenseCategories = expenseCategoriesRes.data.data.filter(c => Number(c.company_id) === Number(user?.company_id));

      const projectId = Number(id);
      const projectTasks = tasksRes.data.data.filter(t => Number(t.project_id) === projectId);
      const projectMaterials = materialsRes.data.data.filter(m => Number(m.project_id) === projectId);
      const projectExpenses = expensesRes.data.data.filter(e => Number(e.project_id) === projectId);

      console.log('✅ Filtered tasks:', projectTasks);

      setTasks(projectTasks);
      setMaterials(projectMaterials);
      setExpenses(projectExpenses);
      setCompanyWorkers(companyWorkersList);
      setProducts(companyProducts);
      setExpenseCategories(companyExpenseCategories);

      // Fetch project workers separately to handle 403 errors gracefully
      try {
        const workersRes = await api.get('/project-workers');
        const projectWorkers = workersRes.data.data.filter(w => Number(w.project_id) === projectId);
        setWorkers(projectWorkers);
      } catch (workerError) {
        console.warn('⚠️ Could not load project workers (permission denied):', workerError);
        setWorkers([]);
      }
    } catch (error) {
      console.error('❌ Error loading project data:', error);
      // Don't show toast for 403 (permission denied) errors
      if (error.response?.status !== 403) {
        toast.error('Failed to load project data');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateFinancials = () => {
    if (!project) return { totalBudget: 0, totalExpenses: 0, totalMaterials: 0, totalLabor: 0, grossProfit: 0, netProfit: 0 };

    const totalBudget = Number(project.budget) || 0;
    
    const totalExpenses = expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
    
    const totalMaterials = materials.reduce((sum, material) => {
      const qty = Number(material.quantity) || 0;
      const cost = Number(material.unit_cost) || 0;
      return sum + (qty * cost);
    }, 0);
    
    const totalLabor = workers.reduce((sum, worker) => {
      const rate = Number(worker.rate) || 0;
      return sum + rate;
    }, 0);
    
    const totalCost = totalExpenses + totalMaterials + totalLabor;
    const grossProfit = totalBudget - totalCost;
    const netProfit = grossProfit;

    return { totalBudget, totalExpenses, totalMaterials, totalLabor, totalCost, grossProfit, netProfit };
  };

  const handleWorkerSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...workerFormData, 
        project_id: Number(id),
        worker_id: Number(workerFormData.worker_id),
        rate: Number(workerFormData.rate),
      };

      if (editingWorker) {
        await api.put(`/project-workers/${editingWorker.id}`, payload);
        toast.success('Worker updated successfully!');
      } else {
        await api.post('/project-workers', payload);
        toast.success('Worker added successfully!');
      }
      setIsWorkerModalOpen(false);
      resetWorkerForm();
      fetchData();
    } catch (error) {
      console.error('Error saving worker:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleWorkerDelete = async (workerId) => {
    if (window.confirm('Are you sure you want to remove this worker from the project?')) {
      try {
        await api.delete(`/project-workers/${workerId}`);
        toast.success('Worker removed successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to remove worker');
      }
    }
  };

  const handleWorkerEdit = (worker) => {
    setEditingWorker(worker);
    setWorkerFormData({
      worker_id: worker.worker_id || '',
      role: worker.role || '',
      payment_type: worker.payment_type || 'daily',
      rate: worker.rate || '',
    });
    setIsWorkerModalOpen(true);
  };

  const resetWorkerForm = () => {
    setEditingWorker(null);
    setWorkerFormData({
      worker_id: '',
      role: '',
      payment_type: 'daily',
      rate: '',
    });
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    try {
      const selectedProduct = products.find(p => Number(p.id) === Number(materialFormData.product_id));
      const requestedQuantity = Number(materialFormData.quantity);
      const currentStock = selectedProduct ? Number(selectedProduct.stock_quantity) : 0;

      // Check if editing or creating new
      if (!editingMaterial && requestedQuantity > currentStock) {
        toast.error(`Insufficient stock. Available: ${currentStock}, Requested: ${requestedQuantity}`);
        return;
      }

      const payload = {
        ...materialFormData,
        project_id: Number(id),
        product_id: Number(materialFormData.product_id),
        quantity: requestedQuantity,
        unit_cost: Number(materialFormData.unit_cost),
      };

      if (editingMaterial) {
        // When editing, check if the new quantity exceeds available stock plus what was already allocated
        const existingQuantity = Number(editingMaterial.quantity);
        const availableForChange = currentStock + existingQuantity;
        if (requestedQuantity > availableForChange) {
          toast.error(`Insufficient stock. Available: ${availableForChange}, Requested: ${requestedQuantity}`);
          return;
        }
        await api.put(`/project-materials/${editingMaterial.id}`, payload);
        toast.success('Material updated successfully!');
      } else {
        await api.post('/project-materials', payload);
        toast.success('Material added successfully!');
      }
      setIsMaterialModalOpen(false);
      resetMaterialForm();
      fetchData();
    } catch (error) {
      console.error('Error saving material:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleMaterialDelete = async (materialId) => {
    if (window.confirm('Are you sure you want to remove this material from the project?')) {
      try {
        await api.delete(`/project-materials/${materialId}`);
        toast.success('Material removed successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to remove material');
      }
    }
  };

  const handleMaterialEdit = (material) => {
    setEditingMaterial(material);
    setMaterialFormData({
      product_id: material.product_id || '',
      quantity: material.quantity || '',
      unit_cost: material.unit_cost || '',
      used_date: material.used_date || '',
    });
    setIsMaterialModalOpen(true);
  };

  const resetMaterialForm = () => {
    setEditingMaterial(null);
    setMaterialFormData({
      product_id: '',
      quantity: '',
      unit_cost: '',
      used_date: '',
    });
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    try {
      let expenseCategoryId = expenseFormData.expense_category_id ? Number(expenseFormData.expense_category_id) : null;
      
      // If custom category name is provided, create a new category first
      if (expenseFormData.custom_category_name && expenseFormData.custom_category_name.trim()) {
        const categoryRes = await api.post('/expense-categories', {
          company_id: user?.company_id,
          name: expenseFormData.custom_category_name.trim(),
          description: 'Custom category from expense form',
        });
        expenseCategoryId = categoryRes.data.data.id;
      }
      
      const payload = { 
        ...expenseFormData, 
        project_id: Number(id),
        company_id: user?.company_id,
        expense_category_id: expenseCategoryId,
        amount: Number(expenseFormData.amount),
      };

      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, payload);
        toast.success('Expense updated successfully!');
      } else {
        await api.post('/expenses', payload);
        toast.success('Expense added successfully!');
      }
      setIsExpenseModalOpen(false);
      resetExpenseForm();
      fetchData();
    } catch (error) {
      console.error('Error saving expense:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleExpenseDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${expenseId}`);
        toast.success('Expense deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const handleExpenseEdit = (expense) => {
    setEditingExpense(expense);
    setExpenseFormData({
      expense_category_id: expense.expense_category_id || '',
      custom_category_name: '',
      title: expense.title || '',
      description: expense.description || '',
      amount: expense.amount || '',
      expense_date: expense.expense_date || '',
      payment_method: expense.payment_method || '',
      status: expense.status || 'Approved',
    });
    setIsExpenseModalOpen(true);
  };

  const resetExpenseForm = () => {
    setEditingExpense(null);
    setExpenseFormData({
      expense_category_id: '',
      custom_category_name: '',
      title: '',
      description: '',
      amount: '',
      expense_date: '',
      payment_method: '',
      status: 'Approved',
    });
  };

  const getWorkerName = (workerId) => {
    const worker = companyWorkers.find(w => Number(w.id) === Number(workerId));
    if (!worker) return 'N/A';
    const fullName = `${worker.first_name || ''} ${worker.last_name || ''}`.trim();
    return fullName || `Worker ${workerId}`;
  };

  const getProductName = (productId) => {
    const product = products.find(p => Number(p.id) === Number(productId));
    return product?.name || 'N/A';
  };

  const getExpenseCategoryName = (categoryId) => {
    const category = expenseCategories.find(c => Number(c.id) === Number(categoryId));
    return category?.name || 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const { formatCurrency } = useAuth();
  const financials = calculateFinancials();

  if (loading) {
    return (
      <DashboardLayout menuItems={menuItems}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 text-lg">Loading project data...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout menuItems={menuItems}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 text-lg">Project not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button onClick={() => navigate('/projects/projects')} className="text-blue-600 hover:text-blue-800 mb-2">← Back to Projects</button>
            <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Budget</div>
          <div className="text-2xl font-bold text-blue-600">{formatCurrency(financials.totalBudget)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Labor Cost</div>
          <div className="text-2xl font-bold text-orange-600">{formatCurrency(financials.totalLabor)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Material Cost</div>
          <div className="text-2xl font-bold text-purple-600">{formatCurrency(financials.totalMaterials)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Expenses</div>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(financials.totalExpenses)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Total Cost</div>
          <div className="text-2xl font-bold text-gray-800">{formatCurrency(financials.totalCost)}</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Gross Profit</div>
          <div className={`text-2xl font-bold ${financials.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(financials.grossProfit)}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="text-sm text-gray-500 mb-1">Net Profit</div>
          <div className={`text-2xl font-bold ${financials.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(financials.netProfit)}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {['overview', 'tasks', 'workers', 'materials', 'expenses'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Project Code:</span>
                      <span className="font-medium">{project.project_code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Location:</span>
                      <span className="font-medium">{project.location || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Start Date:</span>
                      <span className="font-medium">{project.start_date || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">End Date:</span>
                      <span className="font-medium">{project.end_date || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Tasks:</span>
                      <span className="font-medium">{tasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Workers Assigned:</span>
                      <span className="font-medium">{workers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Materials Used:</span>
                      <span className="font-medium">{materials.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Expenses Recorded:</span>
                      <span className="font-medium">{expenses.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Project Tasks</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Assigned To</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Start Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">End Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tasks.map(task => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{task.title}</td>
                        <td className="px-4 py-3">{getEmployeeName(task.assigned_to)}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{task.start_date || 'N/A'}</td>
                        <td className="px-4 py-3">{task.end_date || 'N/A'}</td>
                      </tr>
                    ))}
                    {tasks.length === 0 && (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                          No tasks yet. Add tasks from the Tasks page!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'workers' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Project Workers</h3>
                <button
                  onClick={() => { resetWorkerForm(); setIsWorkerModalOpen(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  + Add Worker
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Worker</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role/Type</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rate</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {workers.map(worker => (
                      <tr key={worker.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{getWorkerName(worker.worker_id)}</td>
                        <td className="px-4 py-3">{worker.role || 'General Worker'}</td>
                        <td className="px-4 py-3">{formatCurrency(worker.rate)}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleWorkerEdit(worker)} className="text-blue-600 hover:text-blue-800 mr-3">
                            Edit
                          </button>
                          <button onClick={() => handleWorkerDelete(worker.id)} className="text-red-600 hover:text-red-800">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {workers.length === 0 && (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                          No workers assigned yet. Add your first worker!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'materials' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Project Materials</h3>
                <button
                  onClick={() => { resetMaterialForm(); setIsMaterialModalOpen(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  + Add Material
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Material</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Unit Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total Cost</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Used Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {materials.map(material => (
                      <tr key={material.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{getProductName(material.product_id)}</td>
                        <td className="px-4 py-3">{material.quantity}</td>
                        <td className="px-4 py-3">{formatCurrency(material.unit_cost)}</td>
                        <td className="px-4 py-3">{formatCurrency((Number(material.quantity) || 0) * (Number(material.unit_cost) || 0))}</td>
                        <td className="px-4 py-3">{material.used_date || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleMaterialEdit(material)} className="text-blue-600 hover:text-blue-800 mr-3">
                            Edit
                          </button>
                          <button onClick={() => handleMaterialDelete(material.id)} className="text-red-600 hover:text-red-800">
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                    {materials.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No materials recorded yet. Add your first material!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Project Expenses</h3>
                <button
                  onClick={() => { resetExpenseForm(); setIsExpenseModalOpen(true); }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  + Add Expense
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expense #</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expenses.map(expense => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{expense.expense_number}</td>
                        <td className="px-4 py-3">{expense.title}</td>
                        <td className="px-4 py-3">{getExpenseCategoryName(expense.expense_category_id)}</td>
                        <td className="px-4 py-3">{formatCurrency(expense.amount)}</td>
                        <td className="px-4 py-3">{expense.expense_date}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(expense.status)}`}>
                            {expense.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleExpenseEdit(expense)} className="text-blue-600 hover:text-blue-800 mr-3">
                            Edit
                          </button>
                          <button onClick={() => handleExpenseDelete(expense.id)} className="text-red-600 hover:text-red-800">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {expenses.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                          No expenses recorded yet. Add your first expense!
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

      {/* Worker Modal */}
      {isWorkerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingWorker ? 'Edit Worker' : 'Add Worker'}
            </h2>
            <form onSubmit={handleWorkerSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Worker</label>
                <select
                  value={workerFormData.worker_id}
                  onChange={e => setWorkerFormData({ ...workerFormData, worker_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select Worker</option>
                  {companyWorkers.map(w => (
                    <option key={w.id} value={w.id}>
                      {`${w.first_name || ''} ${w.last_name || ''}`.trim() || `Worker ${w.id}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role/Type</label>
                <input
                  type="text"
                  value={workerFormData.role}
                  onChange={e => setWorkerFormData({ ...workerFormData, role: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="e.g., Mason, Electrician, Carpenter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Type</label>
                <select
                  value={workerFormData.payment_type}
                  onChange={e => setWorkerFormData({ ...workerFormData, payment_type: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="per_task">Per Task</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rate ($)</label>
                <input
                  type="number"
                  value={workerFormData.rate}
                  onChange={e => setWorkerFormData({ ...workerFormData, rate: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsWorkerModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingWorker ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingMaterial ? 'Edit Material' : 'Add Material'}
            </h2>
            <form onSubmit={handleMaterialSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material</label>
                <select
                  value={materialFormData.product_id}
                  onChange={e => setMaterialFormData({ ...materialFormData, product_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                >
                  <option value="">Select Material</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Stock: {product.stock_quantity})
                    </option>
                  ))}
                </select>
                {materialFormData.product_id && (
                  <div className="mt-1 text-sm">
                    <span className={`font-medium ${
                      products.find(p => Number(p.id) === Number(materialFormData.product_id))?.stock_quantity > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      Available Stock: {products.find(p => Number(p.id) === Number(materialFormData.product_id))?.stock_quantity || 0}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={materialFormData.quantity}
                  onChange={e => setMaterialFormData({ ...materialFormData, quantity: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="0"
                  required
                />
                {materialFormData.product_id && materialFormData.quantity && (
                  <div className="mt-1 text-sm">
                    {Number(materialFormData.quantity) > (products.find(p => Number(p.id) === Number(materialFormData.product_id))?.stock_quantity || 0) ? (
                      <span className="text-red-600 font-medium">
                        ⚠️ Exceeds available stock
                      </span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        ✓ Within stock limits
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={materialFormData.unit_cost}
                  onChange={e => setMaterialFormData({ ...materialFormData, unit_cost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Used Date</label>
                <input
                  type="date"
                  value={materialFormData.used_date}
                  onChange={e => setMaterialFormData({ ...materialFormData, used_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsMaterialModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
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

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingExpense ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={expenseFormData.title}
                  onChange={e => setExpenseFormData({ ...expenseFormData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Expense title"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={expenseFormData.expense_category_id}
                  onChange={e => setExpenseFormData({ ...expenseFormData, expense_category_id: e.target.value, custom_category_name: '' })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  <option value="other">Other (Custom)</option>
                </select>
              </div>
              {expenseFormData.expense_category_id === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Category Name</label>
                  <input
                    type="text"
                    value={expenseFormData.custom_category_name}
                    onChange={e => setExpenseFormData({ ...expenseFormData, custom_category_name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter custom category name"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  value={expenseFormData.amount}
                  onChange={e => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={expenseFormData.expense_date}
                  onChange={e => setExpenseFormData({ ...expenseFormData, expense_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <input
                  type="text"
                  value={expenseFormData.payment_method}
                  onChange={e => setExpenseFormData({ ...expenseFormData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Cash, Bank Transfer, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={expenseFormData.description}
                  onChange={e => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingExpense ? 'Update' : 'Add'}
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

export default ProjectDetails;
