
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const getMenuItems = (isCompanyAdmin, hasModuleAccess) => {
  const baseItems = [
    { path: '/projects', label: 'Dashboard', icon: '🏠', resource: 'dashboard' },
    { path: '/projects/projects', label: 'Projects', icon: '📊', resource: 'projects' },
    { path: '/projects/tasks', label: 'Project Tasks', icon: '✅', resource: 'project_tasks' },
    { path: '/projects/workers', label: 'Project Workers', icon: '👷', resource: 'project_workers' },
    { path: '/projects/materials', label: 'Project Materials', icon: '🛠️', resource: 'project_materials' },
    { path: '/projects/expenses', label: 'Project Expenses', icon: '💰', resource: 'expenses' },
    { path: '/projects/reports', label: 'Reports', icon: '📈', resource: 'reports' },
    { path: '/projects/ai', label: 'AI Assistant', icon: '🤖', resource: 'ai_conversations' },
  ];
  
  // Add company-wide worker management for all business types
  const workerItems = [
    { path: '/company/workers', label: 'Workers', icon: '👷', resource: 'workers' },
  ];
  
  // Add admin-only menu items
  if (isCompanyAdmin) {
    baseItems.push({ path: '/company', label: 'Company Dashboard', icon: '🏠', resource: 'dashboard' });
    baseItems.push({ path: '/company/users', label: 'Users', icon: '👥', resource: 'users' });
  }
  
  // Combine all items
  const allItems = [...baseItems, ...workerItems];
  
  // Filter menu items based on module access
  const filteredItems = allItems.filter(item => hasModuleAccess(item.resource));
  // Add My Profile (always accessible)
  return [...filteredItems, { path: '/profile', label: 'My Profile', icon: '👤' }];
};

const ProjectsDashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, formatCurrency, hasModuleAccess } = useAuth();
  const isCompanyAdmin = user?.role?.name === 'Company Admin' || user?.is_super_admin;
  const menuItems = getMenuItems(isCompanyAdmin, hasModuleAccess);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      const allProjects = response.data.data;
      const companyProjects = allProjects.filter(p => Number(p.company_id) === Number(user?.company_id));
      setProjects(companyProjects);
    } catch (error) {
      // Don't show toast for 403 (permission denied) errors
      if (error.response?.status !== 403) {
        toast.error('Failed to load projects');
      }
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Projects Dashboard</h1>
        <p className="text-gray-600">Manage your projects, tasks, and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">{projects.length}</div>
          <div className="text-gray-600">Total Projects</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-yellow-600">
            {projects.filter(p => p.status === 'Pending').length}
          </div>
          <div className="text-gray-600">Pending</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-blue-600">
            {projects.filter(p => p.status === 'In Progress').length}
          </div>
          <div className="text-gray-600">In Progress</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="text-3xl font-bold text-green-600">
            {projects.filter(p => p.status === 'Completed').length}
          </div>
          <div className="text-gray-600">Completed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Projects</h2>
          {loading ? (
            <div className="animate-pulse">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📊</div>
              <p>No projects yet. Create your first project!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.map((project) => (
                <div 
                  key={project.id} 
                  className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition"
                  onClick={() => navigate(`/projects/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{project.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                  {project.budget && (
                    <div className="text-lg font-bold text-blue-600">
                      Budget: {formatCurrency(project.budget)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Reports</h2>
          <div className="space-y-3">
            <div 
              className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition"
              onClick={() => navigate('/projects/reports')}
            >
              <div className="font-semibold">Project Progress Report</div>
              <div className="text-sm text-gray-500">Track project completion</div>
            </div>
            <div 
              className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition"
              onClick={() => navigate('/projects/reports')}
            >
              <div className="font-semibold">Budget vs Actual Cost</div>
              <div className="text-sm text-gray-500">Compare planned vs actual expenses</div>
            </div>
            <div 
              className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition"
              onClick={() => navigate('/projects/attendance')}
            >
              <div className="font-semibold">Attendance Report</div>
              <div className="text-sm text-gray-500">Employee attendance summary</div>
            </div>
            <div 
              className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 transition"
              onClick={() => navigate('/projects/expenses')}
            >
              <div className="font-semibold">Material Cost Report</div>
              <div className="text-sm text-gray-500">Track material expenses</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">AI Assistant</h2>
        <div 
          className="border rounded-lg p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
          onClick={() => navigate('/projects/ai')}
        >
          <p className="text-gray-600 mb-2">Ask questions about your projects, get insights, or generate reports!</p>
          <input
            type="text"
            placeholder="e.g., Show me the progress of all projects..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            onClick={(e) => { e.stopPropagation(); navigate('/projects/ai'); }}
          />
        </div>
      </div>

      <ToastContainer />
    </DashboardLayout>
  );
};

export default ProjectsDashboard;

