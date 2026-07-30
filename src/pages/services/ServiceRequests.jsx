
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = () => {
  return [
    { path: '/services', label: 'Dashboard', icon: '🏠' },
    { path: '/services/services', label: 'Services', icon: '💼' },
    { path: '/services/requests', label: 'Requests', icon: '📋' },
    { path: '/services/sales', label: 'Sales', icon: '💰' },
    { path: '/services/reports', label: 'Reports', icon: '📈' },
    { path: '/services/ai', label: 'AI Assistant', icon: '🤖' },
  ];
};

const ServiceRequests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, formatCurrency } = useAuth();

  const menuItems = getMenuItems();
  const [formData, setFormData] = useState({
    customer_id: '',
    sale_date: new Date().toISOString().split('T')[0],
    notes: '',
    payment_status: 'Pending',
    sale_status: 'Pending',
  });

  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [salesRes, servicesRes, customersRes, employeesRes] = await Promise.all([
        api.get('/sales'),
        api.get('/services'),
        api.get('/customers'),
        api.get('/employees'),
      ]);
      const companySales = salesRes.data.data.filter(s => Number(s.company_id) === Number(user?.company_id));
      const companyServices = servicesRes.data.data.filter(s => Number(s.company_id) === Number(user?.company_id));
      const companyCustomers = customersRes.data.data.filter(c => Number(c.company_id) === Number(user?.company_id));
      const companyEmployees = employeesRes.data.data.filter(e => Number(e.company_id) === Number(user?.company_id));

      setRequests(companySales);
      setServices(companyServices);
      setCustomers(companyCustomers);
      setEmployees(companyEmployees);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let totalAmount = 0;
      selectedItems.forEach(item => {
        totalAmount += Number(item.price) * Number(item.quantity);
      });

      const payload = {
        ...formData,
        company_id: user?.company_id,
        user_id: user?.id,
        total_amount: totalAmount,
        subtotal: totalAmount,
        paid_amount: 0,
        balance_amount: totalAmount,
        customer_id: formData.customer_id ? Number(formData.customer_id) : null,
      };

      let sale;
      if (editingRequest) {
        sale = await api.put(`/sales/${editingRequest.id}`, payload);
        toast.success('Service request updated successfully!');
        
        // Delete old sale items before adding new ones
        try {
          const oldItemsRes = await api.get('/sale_items');
          const oldItems = oldItemsRes.data.data.filter(item => 
            Number(item.sale_id) === Number(editingRequest.id)
          );
          for (const item of oldItems) {
            await api.delete(`/sale_items/${item.id}`);
          }
        } catch (error) {
          console.error('Failed to delete old items:', error);
        }
      } else {
        sale = await api.post('/sales', payload);
        toast.success('Service request created successfully!');
      }

      // Now create sale items
      if (selectedItems.length > 0 && sale?.data?.data?.id) {
        for (const item of selectedItems) {
          await api.post('/sale_items', {
            sale_id: sale.data.data.id,
            service_id: item.service_id,
            description: item.description,
            quantity: item.quantity,
            price: item.price,
            total: Number(item.price) * Number(item.quantity),
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

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service request?')) {
      try {
        await api.delete(`/sales/${id}`);
        toast.success('Service request deleted successfully!');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete service request');
      }
    }
  };

  const handleEdit = async (request) => {
    setEditingRequest(request);
    setFormData({
      customer_id: request.customer_id || '',
      sale_date: request.sale_date?.split('T')[0] || new Date().toISOString().split('T')[0],
      notes: request.notes || '',
      payment_status: request.payment_status || 'Pending',
      sale_status: request.sale_status || 'Pending',
    });
    
    // Fetch existing sale items for this request
    try {
      const saleItemsRes = await api.get('/sale_items');
      const requestItems = saleItemsRes.data.data.filter(item => 
        Number(item.sale_id) === Number(request.id)
      );
      
      // Map to our selectedItems format
      setSelectedItems(
        requestItems.map(item => ({
          service_id: item.service_id || '',
          description: item.description || '',
          quantity: item.quantity || 1,
          price: item.price || 0,
        }))
      );
    } catch (error) {
      console.error('Failed to fetch sale items:', error);
      toast.error('Failed to load existing items');
      setSelectedItems([]);
    }
    
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingRequest(null);
    setFormData({
      customer_id: '',
      sale_date: new Date().toISOString().split('T')[0],
      notes: '',
      payment_status: 'Pending',
      sale_status: 'Pending',
    });
    setSelectedItems([]);
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.name || 'Walk-in';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const addItem = () => {
    setSelectedItems([
      ...selectedItems,
      { service_id: '', description: '', quantity: 1, price: 0 },
    ]);
  };

  const removeItem = (index) => {
    const newItems = [...selectedItems];
    newItems.splice(index, 1);
    setSelectedItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...selectedItems];
    newItems[index][field] = value;
    if (field === 'service_id' && value) {
      const service = services.find(s => s.id === Number(value));
      if (service) {
        newItems[index].price = service.price;
        newItems[index].description = service.name;
      }
    }
    setSelectedItems(newItems);
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Service Requests</h1>
        <p className="text-gray-600">Manage customer service requests</p>
      </div>

      <div className="mb-6">
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + New Service Request
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
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {requests.map(request => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-blue-600">{request.invoice_number || `SR-${request.id}`}</td>
                    <td className="px-6 py-4 text-gray-900">{getCustomerName(request.customer_id)}</td>
                    <td className="px-6 py-4 text-gray-600">{request.sale_date?.split('T')[0]}</td>
                    <td className="px-6 py-4 font-bold text-gray-900">{formatCurrency(request.total_amount)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.sale_status)}`}>
                        {request.sale_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.payment_status)}`}>
                        {request.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => handleEdit(request)} className="text-blue-600 hover:text-blue-800 mr-3">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(request.id)} className="text-red-600 hover:text-red-800">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {requests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      <div className="text-5xl mb-4">📋</div>
                      <h3 className="text-lg font-semibold mb-2">No service requests yet</h3>
                      <p className="mb-6">Create your first service request to get started</p>
                      <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                      >
                        Create Request
                      </button>
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
          <div className="bg-white rounded-xl p-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              {editingRequest ? 'Edit Service Request' : 'New Service Request'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Customer</label>
                  <select
                    value={formData.customer_id}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    value={formData.sale_date}
                    onChange={e => setFormData({ ...formData, sale_date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Request Status</label>
                  <select
                    value={formData.sale_status}
                    onChange={e => setFormData({ ...formData, sale_status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                  <select
                    value={formData.payment_status}
                    onChange={e => setFormData({ ...formData, payment_status: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">Services</label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                  >
                    + Add Service
                  </button>
                </div>
                {selectedItems.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg mb-3 grid grid-cols-1 md:grid-cols-6 gap-3">
                    <div>
                      <select
                        value={item.service_id}
                        onChange={e => updateItem(index, 'service_id', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">Select Service</option>
                        {services.map(service => (
                          <option key={service.id} value={service.id}>
                            {service.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => updateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Description"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Qty"
                        min="1"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={item.price}
                        onChange={e => updateItem(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Price"
                        min="0"
                      />
                    </div>
                    <div className="flex items-center justify-end">
                      <span className="text-sm font-semibold text-gray-700">
                        {formatCurrency(Number(item.price) * Number(item.quantity))}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800 justify-self-end"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {selectedItems.length > 0 && (
                  <div className="flex justify-end items-center mt-4 pt-4 border-t border-gray-200">
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-800 mr-2">Total:</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(
                          selectedItems.reduce((total, item) => 
                            total + (Number(item.price) * Number(item.quantity)), 0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
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
                  {editingRequest ? 'Update' : 'Create'}
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

export default ServiceRequests;
