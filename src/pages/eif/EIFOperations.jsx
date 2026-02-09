import { useEffect, useState } from 'react';
import { 
  eifGetOperations, 
  eifGetProducts, 
  eifGetPartners, 
  eifCreateOperation,
  eifGetOperation,
  eifUpdateOperation,
  eifDeleteOperation,
  eifGetCategories,
  eifGetOperationSummary
} from '../../services/eifService';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';

const EIFOperations = () => {
  const [operations, setOperations] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingOperation, setEditingOperation] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [filters, setFilters] = useState({
    product_id: '',
    category_id: ''
  });
  const [summary, setSummary] = useState({
    total_import_quantity: 0,
    total_export_quantity: 0,
    total_stock_quantity: 0
  });
  const [formData, setFormData] = useState({
    type: 'IMPORT',
    partner_id: '',
    reference: '',
    operation_date: new Date().toISOString().split('T')[0],
    status: 'PENDING',
    items: [{ product_id: '', quantity: '', price: '', expiry_date: '' }]
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [opsRes, prodsRes, partRes, catRes] = await Promise.all([
        eifGetOperations(),
        eifGetProducts(),
        eifGetPartners(),
        eifGetCategories()
      ]);
      if (opsRes.success) setOperations(opsRes.data || []);
      if (prodsRes.success) setProducts(prodsRes.data || []);
      if (partRes.success) setPartners(partRes.data || []);
      if (catRes.success) setCategories(catRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await eifGetOperationSummary({
        product_id: filters.product_id || undefined,
        category_id: filters.category_id || undefined
      });
      if (res.success) {
        setSummary(res.data.overall || {
          total_import_quantity: 0,
          total_export_quantity: 0,
          total_stock_quantity: 0
        });
      }
    } catch (error) {
      toast.error('Failed to load summary');
    } finally {
      setSummaryLoading(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { product_id: '', quantity: '', price: '', expiry_date: '' }]
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Filter and validate items
      const validItems = formData.items.filter(item => {
        const hasRequired = item.product_id && item.quantity && item.price;
        // For IMPORT operations, expiry_date is required
        if (formData.type === 'IMPORT' && !item.expiry_date) {
          return false;
        }
        return hasRequired;
      });
      
      if (validItems.length === 0) {
        if (formData.type === 'IMPORT') {
          toast.error('Please add at least one item with product, quantity, price, and expiry date');
        } else {
          toast.error('Please add at least one item with product, quantity, and price');
        }
        return;
      }

      if (editingOperation) {
        // For editing, only update status, reference, and date (not items to avoid stock issues)
        const updateData = {
          status: formData.status,
          reference: formData.reference,
          operation_date: formData.operation_date
        };
        const response = await eifUpdateOperation(editingOperation, updateData);
        if (response.success) {
          toast.success('Operation updated successfully');
          setShowModal(false);
          setEditingOperation(null);
          setFormData({
            type: 'IMPORT',
            partner_id: '',
            reference: '',
            operation_date: new Date().toISOString().split('T')[0],
            status: 'PENDING',
            items: [{ product_id: '', quantity: '', price: '', expiry_date: '' }]
          });
          setCurrentPage(1);
          fetchData();
          fetchSummary();
        } else {
          toast.error(response.message || 'Failed to update operation');
        }
        } else {
          const operationData = {
            ...formData,
            partner_id: formData.partner_id || null,
            items: validItems.map(item => ({
              product_id: item.product_id,
              quantity: parseFloat(item.quantity),
              price: parseFloat(item.price),
              expiry_date: item.expiry_date || null
            }))
          };
          const response = await eifCreateOperation(operationData);
        if (response.success) {
        toast.success('Operation created successfully');
        setShowModal(false);
        setFormData({
          type: 'IMPORT',
          partner_id: '',
          reference: '',
          operation_date: new Date().toISOString().split('T')[0],
          status: 'PENDING',
          items: [{ product_id: '', quantity: '', price: '', expiry_date: '' }]
        });
        setCurrentPage(1);
        fetchData();
        fetchSummary();
        } else {
          toast.error(response.message || 'Failed to create operation');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create operation';
      toast.error(errorMessage);
      console.error('Error creating operation:', error);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Operations</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">New Operation</button>
      </div>

      {/* Filters and Summary */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
            <select
              value={filters.product_id}
              onChange={(e) => setFilters({ ...filters, product_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">All Products</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category_id}
              onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={fetchSummary}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium"
            >
              {summaryLoading ? 'Calculating...' : 'Refresh Totals'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Imported Quantity</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">
              {summary.total_import_quantity?.toFixed
                ? summary.total_import_quantity.toFixed(2)
                : Number(summary.total_import_quantity || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Exported Quantity</p>
            <p className="text-2xl font-bold text-green-700 mt-1">
              {summary.total_export_quantity?.toFixed
                ? summary.total_export_quantity.toFixed(2)
                : Number(summary.total_export_quantity || 0).toFixed(2)}
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Current Stock Quantity</p>
            <p className="text-2xl font-bold text-purple-700 mt-1">
              {summary.total_stock_quantity?.toFixed
                ? summary.total_stock_quantity.toFixed(2)
                : Number(summary.total_stock_quantity || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(() => {
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const currentOperations = operations.slice(startIndex, endIndex);
              
              if (currentOperations.length === 0) {
                return (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No operations found
                    </td>
                  </tr>
                );
              }
              
              return currentOperations.map(op => (
                <tr key={op.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{op.reference || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm"><span className={`px-2 py-1 rounded text-xs ${op.type === 'IMPORT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{op.type}</span></td>
                  <td className="px-6 py-4 text-sm text-gray-900">{op.partner_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{op.operation_date}</td>
                  <td className="px-6 py-4 text-sm font-medium">${parseFloat(op.total_amount || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm"><span className={`px-2 py-1 rounded text-xs ${op.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{op.status}</span></td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => {
                        eifGetOperation(op.id).then(res => {
                          if (res.success) {
                            const opData = res.data;
                            setFormData({
                              type: opData.type,
                              partner_id: opData.partner_id || '',
                              reference: opData.reference || '',
                              operation_date: opData.operation_date,
                              status: opData.status || 'PENDING',
                              items: opData.items?.map(item => ({
                                product_id: item.product_id,
                                quantity: item.quantity,
                                price: item.price
                              })) || [{ product_id: '', quantity: '', price: '' }]
                            });
                            setEditingOperation(op.id);
                            setShowModal(true);
                          }
                        });
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this operation?')) {
                          eifDeleteOperation(op.id).then(() => {
                            toast.success('Operation deleted');
                            fetchData();
                            fetchSummary();
                          }).catch(() => toast.error('Failed to delete operation'));
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(operations.length / itemsPerPage)}
          itemsPerPage={itemsPerPage}
          totalItems={operations.length}
          onPageChange={setCurrentPage}
          itemName="operations"
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl my-8">
            <h2 className="text-2xl font-bold mb-4">{editingOperation ? 'Edit Operation' : 'New Operation'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="IMPORT">Import</option>
                    <option value="EXPORT">Export</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input type="date" value={formData.operation_date} onChange={(e) => setFormData({ ...formData, operation_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner</label>
                  <select value={formData.partner_id} onChange={(e) => setFormData({ ...formData, partner_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                    <option value="">None</option>
                    {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reference</label>
                  <input type="text" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
                </div>
              </div>
              {editingOperation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required>
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Note: Items cannot be edited. Create a new operation to change items.</p>
                </div>
              )}
              {!editingOperation && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">Items *</label>
                    <button type="button" onClick={addItem} className="text-sm text-purple-600 hover:text-purple-700">+ Add Item</button>
                  </div>
                  {formData.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-3 mb-3 bg-gray-50">
                      <div className="grid grid-cols-4 gap-2 mb-2">
                        <select value={item.product_id} onChange={(e) => updateItem(index, 'product_id', e.target.value)} className="px-3 py-2 border rounded-lg bg-white" required>
                          <option value="">Product *</option>
                          {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="number" step="0.01" placeholder="Quantity *" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="px-3 py-2 border rounded-lg bg-white" required />
                        <input type="number" step="0.01" placeholder="Price *" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} className="px-3 py-2 border rounded-lg bg-white" required />
                        {formData.items.length > 1 && <button type="button" onClick={() => removeItem(index)} className="text-red-600 hover:text-red-800 px-2">Remove</button>}
                      </div>
                      {formData.type === 'IMPORT' && (
                        <div className="mt-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Expiry Date * (Required for imports)</label>
                          <input 
                            type="date" 
                            value={item.expiry_date} 
                            onChange={(e) => updateItem(index, 'expiry_date', e.target.value)} 
                            className="w-full px-3 py-2 border rounded-lg bg-white" 
                            required 
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {editingOperation && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Operation Items (Read-only)</label>
                  {formData.items.map((item, index) => {
                    const product = products.find(p => p.id === item.product_id);
                    return (
                      <div key={index} className="mb-2 p-2 bg-white rounded border">
                        <p className="text-sm"><strong>Product:</strong> {product?.name || 'N/A'}</p>
                        <p className="text-sm"><strong>Quantity:</strong> {item.quantity} {product?.unit || ''}</p>
                        <p className="text-sm"><strong>Price:</strong> ${parseFloat(item.price || 0).toFixed(2)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">{editingOperation ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => { setShowModal(false); setEditingOperation(null); setFormData({ type: 'IMPORT', partner_id: '', reference: '', operation_date: new Date().toISOString().split('T')[0], status: 'PENDING', items: [{ product_id: '', quantity: '', price: '' }] }); }} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EIFOperations;

