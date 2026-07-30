
const Placeholder = ({ title }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="text-6xl mb-6">🚧</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            {title || 'Coming Soon!'}
          </h1>
          <p className="text-gray-600 text-lg">
            This feature is currently under development and will be available soon!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Placeholder;
