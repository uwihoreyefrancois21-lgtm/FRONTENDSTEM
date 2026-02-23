import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { eifCreateProductLoss, eifDeleteProductLoss, eifGetProductLosses, eifGetProducts, eifUpdateProductLoss } from '../../services/eifService';

const EIFProductLosses = () => {
  const [losses, setLosses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLoss, setEditingLoss] = useState(null);
  const [filters, setFilters] = useState({ product_id: '', loss_type: '', start_date: '', end_date: '' });
  const [formData, setFormData] = useState({ 
    product_id: '', 
    loss_type: 'EXPIRED', 
    quantity: '', 
    loss_date: new Date().toISOString().split('T')[0], 
    description: '',
    expiry_date: null
  });

  useEffect(() => {
    fetchData();
    fetchProducts();
  }, [filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.product_id) params.product_id = filters.product_id;
      if (filters.loss_type) params.loss_type = filters.loss_type;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;

      const res = await eifGetProductLosses(params);
      if (res.success) setLosses(res.data || []);
    } catch (error) {
      toast.error('Failed to load product losses');
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
      if (editingLoss) {
        await eifUpdateProductLoss(editingLoss.id, formData);
        toast.success('Product loss updated');
      } else {
        await eifCreateProductLoss(formData);
        toast.success('Product loss recorded');
      }
      setShowModal(false);
      setEditingLoss(null);
      setFormData({ 
        product_id: '', 
        loss_type: 'EXPIRED', 
        quantity: '', 
        loss_date: new Date().toISOString().split('T')[0], 
        description: '',
        expiry_date: null
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product loss');
    }
  };

  const handleEdit = (loss) => {
    setEditingLoss(loss);
    setFormData({
      product_id: loss.product_id,
      loss_type: loss.loss_type,
      quantity: loss.quantity,
      loss_date: loss.loss_date,
      description: loss.description || '',
      expiry_date: loss.expiry_date || null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product loss? Stock will be restored.')) return;
    try {
      await eifDeleteProductLoss(id);
      toast.success('Product loss deleted and stock restored');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete product loss');
    }
  };

  const resetFilters = () => {
    setFilters({ product_id: '', loss_type: '', start_date: '', end_date: '' });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Losses</h1>
        <button
          onClick={() => {
            setEditingLoss(null);
            setFormData({ 
              product_id: '', 
              loss_type: 'EXPIRED', 
              quantity: '', 
              loss_date: new Date().toISOString().split('T')[0], 
              description: '',
              expiry_date: null
            });
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Record Loss
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Product</label>
            <select
              value={filters.product_id}
              onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Products</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Loss Type</label>
            <select
              value={filters.loss_type}
              onChange={(e) => setFilters({ ...filters, loss_type: e.target.value })}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Types</option>
              <option value="EXPIRED">Expired</option>
              <option value="DAMAGED">Damaged</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={resetFilters}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {losses.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No product losses found
                  </td>
                </tr>
              ) : (
                losses.map((loss) => (
                  <tr key={loss.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(loss.loss_date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{loss.product_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{loss.category_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full RWF{
                        loss.loss_type === 'EXPIRED' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {loss.loss_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {parseFloat(loss.quantity).toFixed(2)} {loss.unit || ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{loss.description || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleEdit(loss)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(loss.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingLoss ? 'Edit Product Loss' : 'Record Product Loss'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Product *</label>
                <select
                  required
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Loss Type *</label>
                <select
                  required
                  value={formData.loss_type}
                  onChange={(e) => setFormData({ ...formData, loss_type: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="EXPIRED">Expired</option>
                  <option value="DAMAGED">Damaged</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Quantity *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  min="0.01"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Loss Date *</label>
                <input
                  type="date"
                  required
                  value={formData.loss_date}
                  onChange={(e) => setFormData({ ...formData, loss_date: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              {editingLoss && formData.expiry_date && (
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Product Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiry_date}
                    disabled
                    className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">This is the expiry date from the product stock</p>
                </div>
              )}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  rows="3"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLoss(null);
                  }}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {editingLoss ? 'Update' : 'Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EIFProductLosses;

