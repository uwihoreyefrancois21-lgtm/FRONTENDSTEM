import { useEffect, useState } from 'react';
import { reportService } from '../services';

const Reports = () => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await reportService.getFinancialSummary();
      if (response.success) {
        setSummary(response.data.summary);
        const income = response.data.summary.reduce((sum, p) => sum + (p.total_income || 0), 0);
        const expense = response.data.summary.reduce((sum, p) => sum + (p.total_expense || 0), 0);
        setTotalIncome(income);
        setTotalExpense(expense);
        setTotalBalance(income - expense);
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-600 mt-2">Summary of all projects</p>
      </div>

      {/* Summary Cards */}
    {/*<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
          <p className="text-sm opacity-90">Total Income</p>
          <p className="text-3xl font-bold mt-2">
            RWF {totalIncome.toLocaleString('en-US')}
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-md p-6 text-white">
          <p className="text-sm opacity-90">Total Expense</p>
          <p className="text-3xl font-bold mt-2">
            RWF {totalExpense.toLocaleString('en-US')}
          </p>
        </div>

        <div className={`bg-gradient-to-br rounded-lg shadow-md p-6 text-white ${
          totalBalance >= 0 ? 'from-blue-500 to-blue-600' : 'from-orange-500 to-orange-600'
        }`}>
          <p className="text-sm opacity-90">Net Balance</p>
          <p className="text-3xl font-bold mt-2">
            RWF {totalBalance.toLocaleString('en-US')}
          </p>
        </div>
      </div>
*/}
      {/* Projects Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Financial Summary by Project</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project Name</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Income</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Expense</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {summary.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.project_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-green-600 font-semibold">
                    RWF {project.total_income?.toLocaleString('en-US') || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-red-600 font-semibold">
                    RWF {project.total_expense?.toLocaleString('en-US') || '0'}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-bold ${
                    (project.balance || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    RWF {project.balance?.toLocaleString('en-US') || '0'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (project.balance || 0) >= 0
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {(project.balance || 0) >= 0 ? 'Profit' : 'Loss'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

