
import { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const AI = () => {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I help you today? I can assist with project insights, inventory forecasting, financial analysis, and more!', sender: 'ai' }
  ]);

  const menuItems = [
    { path: '/projects', label: 'Dashboard', icon: '🏠' },
    { path: '/projects/projects', label: 'Projects', icon: '📊' },
    { path: '/projects/workers', label: 'Project Workers', icon: '👷' },
    { path: '/projects/expenses', label: 'Project Expenses', icon: '💰' },
    { path: '/projects/tasks', label: 'Tasks', icon: '✅' },
    { path: '/projects/reports', label: 'Reports', icon: '📈' },
    { path: '/projects/ai', label: 'AI Assistant', icon: '🤖' },
  ];

  const handleSendMessage = () => {
    if (inputText.trim() === '') return;
    setMessages([...messages, { id: Date.now(), text: inputText, sender: 'user' }]);
    setInputText('');
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: 'Thanks for your message! I am processing your request...', sender: 'ai' }]);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  return (
    <DashboardLayout menuItems={menuItems}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">AI Assistant</h1>
        <p className="text-gray-600">Get AI-powered insights, forecasting, and analysis</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm h-[600px] flex flex-col">
            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] p-4 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                    {msg.sender === 'ai' && (
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mr-2 text-sm">AI</div>
                        <span className="font-semibold text-sm">AI Assistant</span>
                      </div>
                    )}
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question..."
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                >
                  <span>Send</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-blue-50 transition">
                Generate Financial Report
              </button>
              <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-blue-50 transition">
                Inventory Forecast
              </button>
              <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-blue-50 transition">
                Project Analysis
              </button>
              <button className="w-full text-left px-4 py-3 border rounded-lg hover:bg-blue-50 transition">
                Fraud Detection Check
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Insights</h3>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg bg-yellow-50">
                <p className="text-sm font-semibold text-yellow-800">Stock Alert</p>
                <p className="text-xs text-yellow-700">Product X running low on stock</p>
              </div>
              <div className="p-3 border rounded-lg bg-blue-50">
                <p className="text-sm font-semibold text-blue-800">Project Update</p>
                <p className="text-xs text-blue-700">Project Y is 75% complete</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AI;

