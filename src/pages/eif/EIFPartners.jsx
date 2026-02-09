import { useEffect, useState } from 'react';
import { eifGetPartners, eifCreatePartner, eifUpdatePartner, eifDeletePartner } from '../../services/eifService';
import { toast } from 'react-toastify';
import Pagination from '../../components/Pagination';

const EIFPartners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [formData, setFormData] = useState({ name: '', type: 'SUPPLIER' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await eifGetPartners();
      if (res.success) setPartners(res.data || []);
    } catch (error) {
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        await eifUpdatePartner(editingPartner.id, formData);
        toast.success('Partner updated');
      } else {
        await eifCreatePartner(formData);
        toast.success('Partner created');
      }
      setShowModal(false);
      setEditingPartner(null);
      setFormData({ name: '', type: 'SUPPLIER' });
      setCurrentPage(1);
      fetchData();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this partner?')) return;
    try {
      await eifDeletePartner(id);
      toast.success('Partner deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Partners</h1>
        <button onClick={() => { setEditingPartner(null); setFormData({ name: '', type: 'SUPPLIER' }); setShowModal(true); }} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Add Partner</button>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(() => {
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const currentPartners = partners.slice(startIndex, endIndex);
              
              if (currentPartners.length === 0) {
                return (
                  <tr>
                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                      No partners found
                    </td>
                  </tr>
                );
              }
              
              return currentPartners.map(p => (
                <tr key={p.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.name}</td>
                  <td className="px-6 py-4 text-sm"><span className={`px-2 py-1 rounded text-xs ${p.type === 'SUPPLIER' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{p.type}</span></td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => { setEditingPartner(p); setFormData({ name: p.name, type: p.type }); setShowModal(true); }} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(partners.length / itemsPerPage)}
          itemsPerPage={itemsPerPage}
          totalItems={partners.length}
          onPageChange={setCurrentPage}
          itemName="partners"
        />
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">{editingPartner ? 'Edit' : 'Add'} Partner</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                  <option value="SUPPLIER">Supplier</option>
                  <option value="CUSTOMER">Customer</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700">{editingPartner ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EIFPartners;

