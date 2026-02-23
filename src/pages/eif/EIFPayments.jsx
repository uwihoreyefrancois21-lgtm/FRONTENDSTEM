import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';
import { eifCreatePayment, eifDeletePayment, eifGetOperations, eifGetPayments, eifUpdatePayment } from '../../services/eifService';

const EIFPayments = () => {
  const [payments, setPayments] = useState([]);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({ operation_id: '', amount: '', method: 'CASH', status: 'PAID', paid_at: new Date().toISOString().split('T')[0] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [payRes, opsRes] = await Promise.all([eifGetPayments(), eifGetOperations()]);
      if (payRes.success) setPayments(payRes.data || []);
      if (opsRes.success) setOperations(opsRes.data || []);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      if (editingPayment) {
        await eifUpdatePayment(editingPayment.id, formData);
        toast.success('Payment updated');
      } else {
        await eifCreatePayment(formData);
        toast.success('Payment created');
      }
      setShowModal(false);
      setEditingPayment(null);
      setFormData({ operation_id: '', amount: '', method: 'CASH', status: 'PAID', paid_at: new Date().toISOString().split('T')[0] });
      setCurrentPage(1);
      fetchData();
    } catch (error) {
      toast.error('Failed to save payment');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add Payment</button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Operation Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentPayments = payments.slice(startIndex, endIndex);
                
                if (currentPayments.length === 0) {
                  return (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                        No payments found
                      </td>
                    </tr>
                  );
                }
                
                return currentPayments.map(p => {
                  // Find the operation to get its total amount
                  const relatedOperation = operations.find(op => op.id === p.operation_id);
                  const operationTotal = relatedOperation ? parseFloat(relatedOperation.total_amount || 0) : 0;
                  
                  // Determine type based on operation
                  // EXPORT = Income (money received from selling)
                  // IMPORT = Expense (money paid for buying)
                  const paymentType = p.operation_type === 'EXPORT' ? 'Income' : p.operation_type === 'IMPORT' ? 'Expense' : 'N/A';
                  const typeColor = p.operation_type === 'EXPORT' ? 'bg-green-100 text-green-800' : p.operation_type === 'IMPORT' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800';
                  
                  return (
                  <tr key={p.id}>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div className="font-semibold">
                        {p.operation_reference || `#${p.operation_id}`}
                      </div>
                      {p.operation_products && (
                        <div className="mt-1 text-xs text-gray-500">
                          {p.operation_products}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        {p.operation_type && (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              p.operation_type === 'IMPORT'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-green-100 text-green-800'
                            }`}
                          >
                            {p.operation_type === 'IMPORT' ? 'Import' : 'Export'}
                          </span>
                        )}
                        <div>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${typeColor}`}>
                            {paymentType}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      RWF{operationTotal.toFixed(2)}
                      <div className="text-xs text-gray-400 mt-1">Operation Total</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      RWF{parseFloat(p.amount || 0).toFixed(2)}
                      <div className="text-xs text-gray-400 mt-1">Payment Made/Received</div>
                      {operationTotal > 0 && (
                        <div className="text-xs mt-1">
                          {parseFloat(p.amount || 0) < operationTotal && (
                            <span className="text-orange-600">Partial payment</span>
                          )}
                          {parseFloat(p.amount || 0) === operationTotal && (
                            <span className="text-green-600">Full payment</span>
                          )}
                          {parseFloat(p.amount || 0) > operationTotal && (
                            <span className="text-red-600">Overpayment</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                        {p.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          p.status === 'PAID'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {p.paid_at ? new Date(p.paid_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingPayment(p);
                        setFormData({
                          operation_id: p.operation_id,
                          amount: p.amount,
                          method: p.method,
                          status: p.status,
                          paid_at: p.paid_at ? new Date(p.paid_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
                        });
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this payment?')) {
                          eifDeletePayment(p.id).then(() => {
                            toast.success('Payment deleted');
                            fetchData();
                          }).catch(() => toast.error('Failed to delete payment'));
                        }
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
              });
            })()}
          </tbody>
        </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(payments.length / itemsPerPage)}
          itemsPerPage={itemsPerPage}
          totalItems={payments.length}
          onPageChange={setCurrentPage}
          itemName="payments"
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">{editingPayment ? 'Edit Payment' : 'Add Payment'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800 font-medium mb-1">💡 How Payments Work:</p>
                <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                  <li><strong>Operation Amount:</strong> Total value of the operation (e.g., RWF1000 for importing products)</li>
                  <li><strong>Payment Amount:</strong> Actual money paid/received (can be partial, e.g., RWF500 now, RWF500 later)</li>
                  <li><strong>Export Operation:</strong> Payments received = <span className="font-semibold text-green-700">Income</span> (money coming in)</li>
                  <li><strong>Import Operation:</strong> Payments made = <span className="font-semibold text-red-700">Expense</span> (money going out)</li>
                </ul>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Operation *</label>
                <select
                  value={formData.operation_id}
                  onChange={(e) => {
                    const selectedOp = operations.find(op => op.id === parseInt(e.target.value));
                    setFormData({ ...formData, operation_id: e.target.value });
                  }}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Operation</option>
                  {operations.map(op => (
                    <option key={op.id} value={op.id}>
                      {op.reference || `#${op.id}`} — {op.type === 'IMPORT' ? 'Import' : 'Export'} — Total: RWF
                      {parseFloat(op.total_amount || 0).toFixed(2)}
                      {op.product_names ? ` | ${op.product_names}` : ''}
                    </option>
                  ))}
                </select>
                {formData.operation_id && (() => {
                  const selectedOp = operations.find(op => op.id === parseInt(formData.operation_id));
                  if (selectedOp) {
                    return (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <p><strong>Operation Type:</strong> {selectedOp.type === 'EXPORT' ? 'Export (Income)' : 'Import (Expense)'}</p>
                        <p><strong>Operation Total:</strong> RWF{parseFloat(selectedOp.total_amount || 0).toFixed(2)}</p>
                        <p className="text-gray-600 mt-1">
                          {selectedOp.type === 'EXPORT' 
                            ? 'This payment will be recorded as Income (money received)' 
                            : 'This payment will be recorded as Expense (money paid)'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount *</label>
                <input 
                  type="number" 
                  step="0.01" 
                  value={formData.amount} 
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })} 
                  className="w-full px-3 py-2 border rounded-lg" 
                  required 
                  placeholder="Enter payment amount"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the actual money paid/received. It can be less than the operation total (partial payment).
                </p>
                {formData.operation_id && formData.amount && (() => {
                  const selectedOp = operations.find(op => op.id === parseInt(formData.operation_id));
                  if (selectedOp) {
                    const paymentAmount = parseFloat(formData.amount || 0);
                    const operationTotal = parseFloat(selectedOp.total_amount || 0);
                    const remaining = operationTotal - paymentAmount;
                    return (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <p><strong>Operation Total:</strong> RWF{operationTotal.toFixed(2)}</p>
                        <p><strong>Payment Amount:</strong> RWF{paymentAmount.toFixed(2)}</p>
                        <p className={remaining > 0 ? 'text-orange-600 font-medium' : remaining < 0 ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                          <strong>Remaining:</strong> RWF{remaining.toFixed(2)}
                          {remaining > 0 && ' (Partial payment)'}
                          {remaining < 0 && ' (Overpayment)'}
                          {remaining === 0 && ' (Fully paid)'}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Method *</label>
                <select value={formData.method} onChange={(e) => setFormData({ ...formData, method: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank</option>
                  <option value="MOMO">Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="PAID">Paid</option>
                  <option value="PARTIAL">Partial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" value={formData.paid_at} onChange={(e) => setFormData({ ...formData, paid_at: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingPayment ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (saving) return;
                    setShowModal(false);
                    setEditingPayment(null);
                    setFormData({
                      operation_id: '',
                      amount: '',
                      method: 'CASH',
                      status: 'PAID',
                      paid_at: new Date().toISOString().split('T')[0]
                    });
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EIFPayments;

