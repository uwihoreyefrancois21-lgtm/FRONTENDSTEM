import { useEffect, useState } from 'react';
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
  
  if (isCompanyAdmin) {
    baseItems.push({ path: '/company/users', label: 'Users', icon: '👥' });
  }
  
  return baseItems;
};

const ProjectExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, formatCurrency } = useAuth();
  
  const isCompanyAdmin = user?.role?.name === 'Company Admin' || user?.is_super_admin;
  const menuItems = getMenuItems(isCompanyAdmin);
  const [formData, setFormData] = useState({
    project_id: '',
    expense_category_id: '',
    custom_category_name: '',
    title: '',
    description: '',
    amount: '',
    expense_date: '',
    payment_method: '',
    status: 'Approved',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [expensesRes, projectsRes, categoriesRes] = await Promise.all([
        api.get('/expenses'),
        api.get('/projects'),
        api.get('/expense-categories'),
      ]);

      const companyProjects = projectsRes.data.data.filter(p => Number(p.company_id) === Number(user?.company_id));
      const companyProjectIds = companyProjects.map(p => Number(p.id));
      const companyExpenses = expensesRes.data.data.filter(e => 
        e.project_id && companyProjectIds.includes(Number(e.project_id))
      );
      const companyCategories = categoriesRes.data.data.filter(c => Number(c.company_id) === Number(user?.company_id));

      setExpenses(companyExpenses);
      setProjects(companyProjects);
      setCategories(companyCategories);
    } catch (error) {
      // Don't show toast for 403 (permission denied) errors
      if (error.response?.status !== 403) {
        toast.error('Failed to load data');
      }
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let expenseCategoryId = formData.expense_category_id ? Number(formData.expense_category_id) : null;
      
      // If custom category name is provided, create a new category first
      if (formData.custom_category_name && formData.custom_category_name.trim()) {
        const categoryRes = await api.post('/expense-categories', {
          company_id: user?.company_id,
          name: formData.custom_category_name.trim(),
          description: 'Custom category from expense form',
        });
        expenseCategoryId = categoryRes.data.data.id;
      }
      
      const payload = {
        ...formData,
        project_id: Number(formData.project_id),
        company_id: user?.company_id,
        expense_category_id: expenseCategoryId,
        amount: Number(formData.amount),
      };

      if (editingExpense) {
        await api.put(`/expenses/${editingExpense.id}`, payload);
        toast.success('Expense updated successfully!');
      } else {
        await api.post('/expenses', payload);
        toast.success('Expense recorded successfully!');
      }
      setIsModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await api.delete(`/expenses/${id}`);
        toast.success('Expense deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete expense');
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      project_id: expense.project_id || '',
      expense_category_id: expense.expense_category_id || '',
      custom_category_name: '',
      title: expense.title || '',
      description: expense.description || '',
      amount: expense.amount || '',
      expense_date: expense.expense_date || '',
      payment_method: expense.payment_method || '',
      status: expense.status || 'Approved',
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingExpense(null);
    setFormData({
      project_id: '',
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

  const getProjectName = (projectId) => {
    const project = projects.find(p => Number(p.id) === Number(projectId));
    return project?.name || 'N/A';
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => Number(c.id) === Number(categoryId));
    return category?.name || 'N/A';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Project Expenses</h1>
        <p className="text-gray-600">Record and track project expenses</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + Record Expense
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Expense #</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {expenses.map(expense => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{expense.expense_number}</td>
                    <td className="px-6 py-4">{getProjectName(expense.project_id)}</td>
                    <td className="px-6 py-4">{expense.title}</td>
                    <td className="px-6 py-4">{getCategoryName(expense.expense_category_id)}</td>
                    <td className="px-6 py-4">{formatCurrency(expense.amount)}</td>
                    <td className="px-6 py-4">{expense.expense_date}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(expense)} className="text-blue-600 hover:text-blue-800 mr-3">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {expenses.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No expenses recorded yet. Record your first expense!
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
              {editingExpense ? 'Edit Expense' : 'Record Expense'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <select
                  value={formData.project_id}
                  onChange={e => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={formData.expense_category_id}
                  onChange={e => setFormData({ ...formData, expense_category_id: e.target.value, custom_category_name: '' })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                  <option value="other">Other (Custom)</option>
                </select>
              </div>
              {formData.expense_category_id === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Custom Category Name</label>
                  <input
                    type="text"
                    value={formData.custom_category_name}
                    onChange={e => setFormData({ ...formData, custom_category_name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter custom category name"
                    required
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={formData.expense_date}
                  onChange={e => setFormData({ ...formData, expense_date: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <input
                  type="text"
                  value={formData.payment_method}
                  onChange={e => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Cash, Bank Transfer, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows="3"
                />
              </div>
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
                  {editingExpense ? 'Update' : 'Record'}
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

export default ProjectExpenses;
