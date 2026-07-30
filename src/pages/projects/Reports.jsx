
import DashboardLayout from '../../components/DashboardLayout';

const Reports = () => {
  const menuItems = [
    { path: '/projects', label: 'Dashboard', icon: '🏠' },
    { path: '/projects/projects', label: 'Projects', icon: '📊' },
    { path: '/projects/workers', label: 'Project Workers', icon: '👷' },
    { path: '/projects/expenses', label: 'Project Expenses', icon: '💰' },
    { path: '/projects/tasks', label: 'Tasks', icon: '✅' },
    { path: '/projects/reports', label: 'Reports', icon: '📈' },
    { path: '/projects/ai', label: 'AI Assistant', icon: '🤖' },
  ];

  const reports = [
    {
      title: 'Total Project Cost',
      desc: 'Calculate and analyze total project expenses',
      icon: '💰'
    },
    {
      title: 'Employee Cost',
      desc: 'Track salary and labor costs for employees',
      icon: '👷'
    },
    {
      title: 'Material Cost',
      desc: 'Manage and report on material expenses',
      icon: '🧱'
    },
    {
      title: 'Profit/Loss',
      desc: 'Analyze project profitability',
      icon: '📊'
    },
    {
      title: 'Attendance Report',
      desc: 'Employee attendance summary and statistics',
      icon: '📅'
    },
    {
      title: 'Budget vs Actual Cost',
      desc: 'Compare planned budget with actual expenses',
      icon: '📉'
    },
    {
      title: 'Project Progress Report',
      desc: 'Track completion status of all projects',
      icon: '🎯'
    },
    {
      title: 'Balance Sheet',
      desc: 'Financial statement of assets, liabilities, equity',
      icon: '📈'
    }
  ];

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
        <p className="text-gray-600">Generate and view all reports for your projects</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reports.map((report, idx) => (
          <div key={idx} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition cursor-pointer">
            <div className="text-4xl mb-4">{report.icon}</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{report.title}</h2>
            <p className="text-gray-600 text-sm">{report.desc}</p>
            <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
              Generate Report
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Reports;

