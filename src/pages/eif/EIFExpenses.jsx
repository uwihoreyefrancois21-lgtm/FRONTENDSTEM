import { useEffect, useState } from 'react';
import { eifGetExpenses, eifCreateExpense, eifUpdateExpense, eifDeleteExpense, eifGetProducts } from '../../services/eifService';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';

const EIFExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({ title: '', amount: '', expense_date: new Date().toISOString().split('T')[0], product_id: '' });

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, []);

  const fetchData = async () => {
    try {
      const res = await eifGetExpenses();
      if (res.success) setExpenses(res.data || []);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await eifGetProducts();
      if (res.success) setProducts(res.data || []);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingExpense) {
        await eifUpdateExpense(editingExpense.id, formData);
        toast.success('Expense updated');
      } else {
        await eifCreateExpense(formData);
        toast.success('Expense created');
      }
      setShowModal(false);
      setEditingExpense(null);
      setFormData({ title: '', amount: '', expense_date: new Date().toISOString().split('T')[0], product_id: '' });
      setCurrentPage(1);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await eifDeleteExpense(id);
      toast.success('Expense deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
        <button onClick={() => { setEditingExpense(null); setFormData({ title: '', amount: '', expense_date: new Date().toISOString().split('T')[0], product_id: '' }); setShowModal(true); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add Expense</button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(() => {
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const currentExpenses = expenses.slice(startIndex, endIndex);
              
              if (currentExpenses.length === 0) {
                return (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No expenses found
                    </td>
                  </tr>
                );
              }
              
              return currentExpenses.map(exp => (
                <tr key={exp.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{exp.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {exp.product_name ? (
                      <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                        {exp.product_name}
                        {exp.category_name && ` (${exp.category_name})`}
                      </span>
                    ) : (
                      <span className="text-gray-400">No product</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-red-600">${parseFloat(exp.amount || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{exp.expense_date}</td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => { setEditingExpense(exp); setFormData({ title: exp.title, amount: exp.amount, expense_date: exp.expense_date, product_id: exp.product_id || '' }); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button onClick={() => handleDelete(exp.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(expenses.length / itemsPerPage)}
          itemsPerPage={itemsPerPage}
          totalItems={expenses.length}
          onPageChange={setCurrentPage}
          itemName="expenses"
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingExpense ? 'Edit' : 'Add'} Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                <input type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input type="date" value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product (Optional)</label>
                <select 
                  value={formData.product_id} 
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="">Select Product (Optional)</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.category_name ? `(${product.category_name})` : ''}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">Assign this expense to a specific product</p>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">{editingExpense ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EIFExpenses;

