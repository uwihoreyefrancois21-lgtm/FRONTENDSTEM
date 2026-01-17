import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import { projectService } from '../services';
import { formatCurrency } from '../utils/format';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;
  const [editingProject, setEditingProject] = useState(null);
  const [formData, setFormData] = useState({
    project_name: '',
    description: '',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      if (response?.success) {
        const list = response.data?.projects || [];
        setProjects(list);
        setFilteredProjects(list);
        return;
      }

      // If API wrapper changes or backend returns unexpected shape
      const msg = response?.message || 'Failed to fetch projects';
      throw new Error(msg);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to fetch projects');
      setProjects([]);
      setFilteredProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter projects based on search query
    if (searchQuery.trim() === '') {
      setFilteredProjects(projects);
    } else {
      const filtered = projects.filter(project =>
        project.project_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, projects]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className={`px-3 py-1 rounded ${1 === currentPage ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          1
        </button>
      );
      if (startPage > 2) {
        pages.push(<span key="start-ellipsis" className="px-2">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1 rounded ${i === currentPage ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(<span key="end-ellipsis" className="px-2">...</span>);
      }
      pages.push(
        <button
          key={totalPages}
          onClick={() => goToPage(totalPages)}
          className={`px-3 py-1 rounded ${totalPages === currentPage ? 'bg-primary-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
        >
          {totalPages}
        </button>
      );
    }

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
          <span className="font-medium">
            {Math.min(endIndex, filteredProjects.length)}
          </span>{' '}
          of <span className="font-medium">{filteredProjects.length}</span> results
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          {pages}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 rounded bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        const resp = await projectService.update(editingProject.id, formData);
        if (!resp?.success) throw new Error(resp?.message || 'Failed to update project');
        toast.success('Project updated successfully');
      } else {
        const resp = await projectService.create(formData);
        if (!resp?.success) throw new Error(resp?.message || 'Failed to create project');
        toast.success('Project created successfully');
      }
      setShowModal(false);
      setEditingProject(null);
      setFormData({ project_name: '', description: '', start_date: '', end_date: '' });
      fetchProjects();
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save project');
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      project_name: project.project_name,
      description: project.description || '',
      start_date: project.start_date || '',
      end_date: project.end_date || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        const resp = await projectService.delete(id);
        if (!resp?.success) throw new Error(resp?.message || 'Failed to delete project');
        toast.success('Project deleted successfully');
        fetchProjects();
      } catch (error) {
        console.error('Failed to delete project:', error);
        toast.error(error.response?.data?.message || error.message || 'Failed to delete project');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-2">Create and manage your own projects, tasks, and transactions</p>
          </div>
          <button
            onClick={() => {
              setEditingProject(null);
              setFormData({ project_name: '', description: '', start_date: '', end_date: '' });
              setShowModal(true);
            }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium shadow-md mt-4 md:mt-0 w-full md:w-auto"
          >
            + Add Project
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> These are your personal projects. Only you can view and manage them.
            {user?.role === 'admin' && ' As an admin, you also have access to the Admin Panel to manage system users.'}
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Results count */}
        <p className="text-sm text-gray-600 mb-4">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredProjects.length)} of {filteredProjects.length} projects
        </p>
      </div>

      {currentProjects.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <p className="text-gray-600 text-lg">
            {searchQuery ? 'No projects found matching your search.' : 'No projects yet. Create your first project!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {currentProjects.map((project) => (
            <div key={project.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{project.project_name}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Income:</span>
                  <span className="text-sm font-semibold text-green-600">
                    RWF {formatCurrency(project.total_income)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Expense:</span>
                  <span className="text-sm font-semibold text-red-600">
                    RWF {formatCurrency(project.total_expense)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-sm font-semibold text-gray-900">Balance:</span>
                  <span className={`text-sm font-bold ${
                    (parseFloat(project.balance) || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    RWF {formatCurrency(project.balance)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col space-y-2 mt-4">
                <div className="flex space-x-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-3 rounded-lg text-xs font-medium"
                    title="View Details"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => handleEdit(project)}
                    className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-3 rounded-lg text-xs font-medium"
                    title="Edit Project"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(project.id)}
                    className="bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-xs font-medium"
                    title="Delete Project"
                  >
                    Delete
                  </button>
                </div>
                <Link
                  to={`/projects/${project.id}#tasks`}
                  className="block bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg text-xs font-medium"
                  title="Manage Tasks"
                >
                  + Add Task
                </Link>
                <Link
                  to={`/projects/${project.id}#transactions`}
                  className="block bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg text-xs font-medium"
                  title="Add Transaction"
                >
                  + Add Transaction
                </Link>
              </div>
            </div>
          ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.project_name}
                  onChange={(e) => setFormData({ ...formData, project_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProject(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  {editingProject ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;

