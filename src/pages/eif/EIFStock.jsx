import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { eifDeleteStock, eifGetStock, eifUpdateStock } from '../../services/eifService';
import Pagination from '../../components/Pagination';

const EIFStock = () => {
  const [stock, setStock] = useState([]);
  const [allStock, setAllStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingStock, setEditingStock] = useState(null);
  const [editQuantity, setEditQuantity] = useState('');
  const [editBuyPrice, setEditBuyPrice] = useState('');
  const [editSellPrice, setEditSellPrice] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'low', 'in_stock'
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'range', 'monthly'
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterMonth, setFilterMonth] = useState('');

  useEffect(() => {
    fetchData();
  }, []); // Only fetch on mount

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const stockRes = await eifGetStock(params);
      if (stockRes.success) {
        setAllStock(stockRes.data || []);
        setStock(stockRes.data || []);
      }
    } catch (error) {
      toast.error('Failed to load stock');
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilters = async () => {
    try {
      setLoading(true);
      const params = {};
      
      // Add date filters to params
      if (dateFilter === 'range' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      } else if (dateFilter === 'monthly' && filterYear && filterMonth) {
        params.year = filterYear;
        params.month = filterMonth;
      } else if (dateFilter === 'all') {
        // Reset to all data
        fetchData();
        return;
      } else {
        // If filters are not complete, show error
        toast.error('Please complete all filter fields');
        setLoading(false);
        return;
      }

      const stockRes = await eifGetStock(params);
      if (stockRes.success) {
        setAllStock(stockRes.data || []);
        setStock(stockRes.data || []);
        toast.success(`Found RWF{stockRes.data?.length || 0} stock items`);
      } else {
        toast.error(stockRes.message || 'Failed to load stock');
      }
    } catch (error) {
      console.error('Filter error:', error);
      toast.error(error.response?.data?.message || 'Failed to filter stock');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...allStock];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.product_name?.toLowerCase().includes(searchLower) ||
        item.category_name?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter === 'low') {
      filtered = filtered.filter(item => parseFloat(item.quantity) < 10);
    } else if (statusFilter === 'in_stock') {
      filtered = filtered.filter(item => parseFloat(item.quantity) >= 10);
    }

    setStock(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchTerm, statusFilter, allStock]);

  const handleEditStock = (item) => {
    setEditingStock(item);
    setEditQuantity(item.quantity);
    setEditBuyPrice(item.buy_price || '');
    setEditSellPrice(item.sell_price || '');
  };

  const handleUpdateStock = async () => {
    if (!editingStock) return;
    
    const quantity = parseFloat(editQuantity);
    if (isNaN(quantity) || quantity < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const buyPrice = editBuyPrice ? parseFloat(editBuyPrice) : undefined;
    if (editBuyPrice && (isNaN(buyPrice) || buyPrice < 0)) {
      toast.error('Please enter a valid buy price');
      return;
    }

    const sellPrice = editSellPrice ? parseFloat(editSellPrice) : undefined;
    if (editSellPrice && (isNaN(sellPrice) || sellPrice < 0)) {
      toast.error('Please enter a valid sell price');
      return;
    }

    try {
      const updateData = { quantity };
      if (buyPrice !== undefined) updateData.buy_price = buyPrice;
      if (sellPrice !== undefined) updateData.sell_price = sellPrice;

      const res = await eifUpdateStock(editingStock.product_id, updateData);
      if (res.success) {
        toast.success('Stock updated successfully');
        setEditingStock(null);
        setEditQuantity('');
        setEditBuyPrice('');
        setEditSellPrice('');
        fetchData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const handleDeleteStock = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this stock entry? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await eifDeleteStock(productId);
      if (res.success) {
        toast.success('Stock deleted successfully');
        fetchData();
      } else {
        toast.error(res.message || 'Failed to delete stock');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete stock');
    }
  };


  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Stock Inventory</h1>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by product name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Stock</option>
              <option value="low">Low Stock (&lt; 10)</option>
              <option value="in_stock">In Stock (≥ 10)</option>
            </select>
          </div>
        </div>

        {/* Date Filter Section */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                if (e.target.value === 'all') {
                  setStartDate('');
                  setEndDate('');
                  setFilterYear('');
                  setFilterMonth('');
                  fetchData(); // Reset to all data immediately
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            >
              <option value="all">All Time</option>
              <option value="range">Date Range</option>
              <option value="monthly">Monthly</option>
            </select>

            {dateFilter === 'range' && (
              <>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={applyDateFilters}
                    disabled={!startDate || !endDate}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </>
            )}

            {dateFilter === 'monthly' && (
              <>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Year</label>
                  <input
                    type="number"
                    placeholder="YYYY"
                    min="2000"
                    max="2100"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Month</label>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Select Month</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={applyDateFilters}
                    disabled={!filterYear || !filterMonth}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Apply
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {(searchTerm || statusFilter !== 'all' || dateFilter !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
            Showing {stock.length} of {allStock.length} items
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setDateFilter('all');
                setStartDate('');
                setEndDate('');
                setFilterYear('');
                setFilterMonth('');
                fetchData(); // Reset to all data
              }}
              className="ml-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buy Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sell Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(() => {
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const currentStock = stock.slice(startIndex, endIndex);
              
              if (currentStock.length === 0) {
                return (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No stock items found
                    </td>
                  </tr>
                );
              }
              
              return currentStock.map(item => (
                <tr key={item.id} className={parseFloat(item.quantity) < 10 ? 'bg-red-50' : ''}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.product_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.category_name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.unit || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{parseFloat(item.quantity).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">RWF{parseFloat(item.buy_price || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">RWF{parseFloat(item.sell_price || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    {parseFloat(item.quantity) < 10 ? (
                      <span className="px-2 py-1 rounded text-xs bg-red-100 text-red-800">Low Stock</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">In Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditStock(item)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteStock(item.product_id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Stock"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(stock.length / itemsPerPage)}
          itemsPerPage={itemsPerPage}
          totalItems={stock.length}
          onPageChange={setCurrentPage}
          itemName="stock items"
        />
      </div>

      {/* Edit Stock Modal */}
      {editingStock && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Edit Stock</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <p className="font-bold text-gray-900">{editingStock.product_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Quantity</label>
                <p className="text-gray-600">{parseFloat(editingStock.quantity).toFixed(2)} {editingStock.unit || ''}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Quantity *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
                {editingStock.unit && (
                  <p className="text-xs text-gray-500 mt-1">Unit: {editingStock.unit}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buy Price (RWF)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editBuyPrice}
                  onChange={(e) => setEditBuyPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter buy price"
                />
                <p className="text-xs text-gray-500 mt-1">Current: RWF{parseFloat(editingStock.buy_price || 0).toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sell Price (RWF)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editSellPrice}
                  onChange={(e) => setEditSellPrice(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Enter sell price"
                />
                <p className="text-xs text-gray-500 mt-1">Current: RWF{parseFloat(editingStock.sell_price || 0).toFixed(2)}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateStock}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                >
                  Update Stock
                </button>
                <button
                  onClick={() => {
                    setEditingStock(null);
                    setEditQuantity('');
                    setEditBuyPrice('');
                    setEditSellPrice('');
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EIFStock;

