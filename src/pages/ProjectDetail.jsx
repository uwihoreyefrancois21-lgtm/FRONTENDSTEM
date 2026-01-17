import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { projectService, taskService, transactionService } from '../services';
import { formatCurrency } from '../utils/format';
import { toast } from 'react-toastify';

const ProjectDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    task_name: '',
    description: '',
    worker_name: '',
    worker_phone: '',
    cost: '',
    task_date: new Date().toISOString().split('T')[0],
    type: 'expense',
  });
  const [taskMonthFilter, setTaskMonthFilter] = useState('');
  const [taskYearFilter, setTaskYearFilter] = useState(new Date().getFullYear().toString());
  const [transactionMonthFilter, setTransactionMonthFilter] = useState('');
  const [transactionYearFilter, setTransactionYearFilter] = useState(new Date().getFullYear().toString());
  const [transactionFormData, setTransactionFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0],
    task_id: '',
  });

  useEffect(() => {
    fetchProjectData();
    
    // Check if there's a hash in the URL
    if (location.hash) {
      const hash = location.hash.replace('#', '');
      if (hash === 'tasks' || hash === 'transactions') {
        setActiveTab(hash);
      }
    }
  }, [id, location.hash, taskMonthFilter, taskYearFilter, transactionMonthFilter, transactionYearFilter]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes, transactionsRes] = await Promise.all([
        projectService.getById(id),
        taskService.getAll(id, taskMonthFilter || null, taskYearFilter || null),
        transactionService.getAll(id, transactionMonthFilter || null, transactionYearFilter || null),
      ]);

      if (projectRes.success) setProject(projectRes.data.project);
      if (tasksRes.success) setTasks(tasksRes.data.tasks);
      if (transactionsRes.success) setTransactions(transactionsRes.data.transactions);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        const resp = await taskService.update(editingTask.id, { ...taskFormData, project_id: id });
        if (!resp?.success) throw new Error(resp?.message || 'Failed to update task');
        toast.success('Task updated successfully');
      } else {
        const resp = await taskService.create({ ...taskFormData, project_id: id });
        if (!resp?.success) throw new Error(resp?.message || 'Failed to create task');
        toast.success('Task created successfully');
      }
      setShowTaskModal(false);
      setEditingTask(null);
      setTaskFormData({
        task_name: '',
        description: '',
        worker_name: '',
        worker_phone: '',
        cost: '',
        task_date: new Date().toISOString().split('T')[0],
        type: 'expense',
      });
      await fetchProjectData();
    } catch (error) {
      console.error('Failed to save task:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to save task');
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, transactionFormData);
      } else {
        await transactionService.create({ ...transactionFormData, project_id: id });
      }
      setShowTransactionModal(false);
      setEditingTransaction(null);
      setTransactionFormData({
        type: 'expense',
        amount: '',
        description: '',
        transaction_date: new Date().toISOString().split('T')[0],
        task_id: '',
      });
      fetchProjectData();
    } catch (error) {
      console.error('Failed to save transaction:', error);
      alert('Failed to save transaction');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setTaskFormData({
      task_name: task.task_name,
      description: task.description || '',
      worker_name: task.worker_name || '',
      worker_phone: task.worker_phone || '',
      cost: task.cost || '',
      task_date: task.task_date || new Date().toISOString().split('T')[0],
      type: task.type || 'expense',
    });
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.delete(taskId);
        fetchProjectData();
      } catch (error) {
        console.error('Failed to delete task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const handleEditTransaction = (transaction) => {
    setEditingTransaction(transaction);
    setTransactionFormData({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description || '',
      transaction_date: transaction.transaction_date || new Date().toISOString().split('T')[0],
      task_id: transaction.task_id || '',
    });
    setShowTransactionModal(true);
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.delete(transactionId);
        fetchProjectData();
      } catch (error) {
        console.error('Failed to delete transaction:', error);
        alert('Failed to delete transaction');
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

  if (!project) {
    return <div className="text-center text-gray-600">Project not found</div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{project.project_name}</h1>
        <p className="text-gray-600 mt-2">{project.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Income</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            RWF {formatCurrency(project.total_income)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Total Expense</p>
          <p className="text-3xl font-bold text-red-600 mt-2">
            RWF {formatCurrency(project.total_expense)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-sm text-gray-600">Balance</p>
          <p className={`text-3xl font-bold mt-2 ${
            (parseFloat(project.balance) || 0) >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            RWF {formatCurrency(project.balance)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex justify-between items-center">
          <nav className="-mb-px flex space-x-8">
            {['overview', 'tasks', 'transactions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
              >
                {tab}
              </button>
            ))}
          </nav>
          {activeTab === 'tasks' && (
            <button
              onClick={() => {
                setEditingTask(null);
                setTaskFormData({
                  task_name: '',
                  description: '',
                  worker_name: '',
                  worker_phone: '',
                  cost: '',
                  task_date: new Date().toISOString().split('T')[0],
                  type: 'expense',
                });
                setShowTaskModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-colors"
            >
              + Add Task
            </button>
          )}
          {activeTab === 'transactions' && (
            <button
              onClick={() => {
                setEditingTransaction(null);
                setTransactionFormData({
                  type: 'expense',
                  amount: '',
                  description: '',
                  transaction_date: new Date().toISOString().split('T')[0],
                  task_id: '',
                });
                setShowTransactionModal(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-colors"
            >
              + Add Transaction
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Project Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="text-gray-900 font-medium">
                {project.start_date || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">End Date</p>
              <p className="text-gray-900 font-medium">
                {project.end_date || 'Not set'}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tasks</h2>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Month:</label>
                  <select
                    value={taskMonthFilter}
                    onChange={(e) => {
                      setTaskMonthFilter(e.target.value);
                      setLoading(true);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">All Months</option>
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
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Year:</label>
                  <input
                    type="number"
                    value={taskYearFilter}
                    onChange={(e) => {
                      setTaskYearFilter(e.target.value);
                      setLoading(true);
                    }}
                    min="2000"
                    max="2100"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm w-24"
                    placeholder="Year"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task Name</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Description</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Phone</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cost</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                      No tasks found for the selected month.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap font-medium text-gray-900">{task.task_name}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        {task.type ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            task.type === 'income' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            Not Set
                          </span>
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 max-w-xs truncate hidden md:table-cell">{task.description || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">{task.worker_name || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm hidden lg:table-cell">{task.worker_phone || '-'}</td>
                      <td className={`px-3 sm:px-6 py-4 whitespace-nowrap font-semibold ${
                        task.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        RWF {formatCurrency(task.cost)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{task.task_date || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="text-blue-600 hover:text-blue-900 font-medium text-xs sm:text-sm transition-colors"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-600 hover:text-red-900 font-medium text-xs sm:text-sm transition-colors"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Transactions</h2>
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Filter by Month:</label>
                  <select
                    value={transactionMonthFilter}
                    onChange={(e) => {
                      setTransactionMonthFilter(e.target.value);
                      setLoading(true);
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">All Months</option>
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
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Year:</label>
                  <input
                    type="number"
                    value={transactionYearFilter}
                    onChange={(e) => {
                      setTransactionYearFilter(e.target.value);
                      setLoading(true);
                    }}
                    min="2000"
                    max="2100"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm w-24"
                    placeholder="Year"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Description</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                      No transactions found for the selected month.
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </td>
                      <td className={`px-3 sm:px-6 py-4 whitespace-nowrap font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        RWF {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{transaction.description || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.transaction_date || '-'}</td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditTransaction(transaction)}
                            className="text-blue-600 hover:text-blue-900 font-medium text-xs sm:text-sm transition-colors"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          <button
                            onClick={() => handleDeleteTransaction(transaction.id)}
                            className="text-red-600 hover:text-red-900 font-medium text-xs sm:text-sm transition-colors"
                            title="Delete"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTask ? 'Edit Task' : 'Add Task'}
              </h2>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                  setTaskFormData({
                    task_name: '',
                    description: '',
                    worker_name: '',
                    worker_phone: '',
                    cost: '',
                    task_date: new Date().toISOString().split('T')[0],
                    type: 'expense',
                  });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Task Name *</label>
                <input
                  type="text"
                  required
                  value={taskFormData.task_name}
                  onChange={(e) => setTaskFormData({ ...taskFormData, task_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={taskFormData.description}
                  onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Worker Name</label>
                <input
                  type="text"
                  value={taskFormData.worker_name}
                  onChange={(e) => setTaskFormData({ ...taskFormData, worker_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Worker Phone</label>
                <input
                  type="tel"
                  value={taskFormData.worker_phone}
                  onChange={(e) => setTaskFormData({ ...taskFormData, worker_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  required
                  value={taskFormData.type}
                  onChange={(e) => setTaskFormData({ ...taskFormData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
                <p className="mt-1 text-xs text-gray-500">Select whether this task is an income or expense for the project</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost (RWF)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={taskFormData.cost}
                  onChange={(e) => setTaskFormData({ ...taskFormData, cost: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500">This amount will be added to project {taskFormData.type === 'income' ? 'income' : 'expense'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={taskFormData.task_date}
                  onChange={(e) => setTaskFormData({ ...taskFormData, task_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTaskModal(false);
                    setEditingTask(null);
                    setTaskFormData({
                      task_name: '',
                      description: '',
                      worker_name: '',
                      worker_phone: '',
                      cost: '',
                      task_date: new Date().toISOString().split('T')[0],
                    });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  {editingTask ? 'Update Task' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add/Edit Transaction Modal */}
      {showTransactionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
              </h2>
              <button
                onClick={() => {
                  setShowTransactionModal(false);
                  setEditingTransaction(null);
                  setTransactionFormData({
                    type: 'expense',
                    amount: '',
                    description: '',
                    transaction_date: new Date().toISOString().split('T')[0],
                    task_id: '',
                  });
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  required
                  value={transactionFormData.type}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={transactionFormData.amount}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, amount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={transactionFormData.description}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, description: e.target.value })}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={transactionFormData.transaction_date}
                  onChange={(e) => setTransactionFormData({ ...transactionFormData, transaction_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowTransactionModal(false);
                    setEditingTransaction(null);
                    setTransactionFormData({
                      type: 'expense',
                      amount: '',
                      description: '',
                      transaction_date: new Date().toISOString().split('T')[0],
                      task_id: '',
                    });
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium"
                >
                  {editingTransaction ? 'Update Transaction' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;

