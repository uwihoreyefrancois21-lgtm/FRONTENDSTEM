import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="text-primary-600 text-4xl mb-5">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const PricingCard = ({ plan, price, features, popular = false }) => (
  <div className={`relative bg-white rounded-2xl shadow-xl overflow-hidden ${popular ? 'ring-2 ring-primary-500' : 'border border-gray-200'}`}>
    {popular && (
      <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-4 py-1 transform translate-x-2 -translate-y-2 rounded-bl-lg">
        POPULAR
      </div>
    )}
    <div className="p-8">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan}</h3>
      <div className="mb-6">
        <span className="text-4xl font-extrabold text-gray-900">${price}</span>
        <span className="text-gray-600">/month</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>
      <button 
        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors duration-200 ${
          popular 
            ? 'bg-primary-600 hover:bg-primary-700 text-white' 
            : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
        }`}
      >
        Get Started
      </button>
    </div>
  </div>
);

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: '📊',
      title: 'Project Tracking',
      description: 'Monitor all your projects in one place with real-time updates and progress tracking.'
    },
    {
      icon: '💰',
      title: 'Financial Management',
      description: 'Track expenses, income, and overall project profitability with detailed financial reports.'
    },
    {
      icon: '👥',
      title: 'Team Collaboration',
      description: 'Manage your team, assign tasks, and track worker contributions and payments.'
    },
    {
      icon: '📈',
      title: 'Analytics & Reports',
      description: 'Generate comprehensive reports to analyze project performance and make data-driven decisions.'
    }
  ];

  const pricingPlans = [
    {
      plan: 'Starter',
      price: '10',
      features: [
        'Up to 5 active projects',
        'Basic financial tracking',
        'Email support',
        'Basic reports',
        '1 team member'
      ]
    },
    {
      plan: 'Professional',
      price: '25',
      popular: true,
      features: [
        'Unlimited projects',
        'Advanced financial tracking',
        'Priority support',
        'Advanced analytics',
        'Up to 5 team members',
        'API access'
      ]
    },
    {
      plan: 'Enterprise',
      price: 'Custom',
      features: [
        'Unlimited everything',
        'Dedicated account manager',
        '24/7 support',
        'Custom integrations',
        'Unlimited team members',
        'On-premise deployment'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                SPEMS
              </span>
              <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-medium">
                v1.0
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Pricing
              </a>
            </nav>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register" 
                    className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-r from-primary-600 to-blue-600 text-white py-20 md:py-32">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSg0NSkiPjxyZWN0IHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==')]"></div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
                Smart Project Earnings <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 to-yellow-400">
                  Management System
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto">
                Take control of your projects, track expenses, and maximize profits with our all-in-one project management solution.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link 
                  to={user ? "/dashboard" : "/register"} 
                  className="bg-white text-primary-700 hover:bg-gray-100 px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {user ? 'Go to Dashboard' : 'Start Free Trial'}
                </Link>
                <a 
                  href="#pricing" 
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:bg-opacity-10 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300"
                >
                  View Pricing
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage your projects and finances in one place
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <FeatureCard 
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                />
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get started in minutes and take control of your projects today
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  number: '1',
                  title: 'Create Your Account',
                  description: 'Sign up for a free account and set up your profile in minutes.'
                },
                {
                  number: '2',
                  title: 'Add Your Projects',
                  description: 'Create projects, add team members, and set up your budget.'
                },
                {
                  number: '3',
                  title: 'Track & Analyze',
                  description: 'Monitor progress, track expenses, and analyze your project performance.'
                }
              ].map((step, index) => (
                <div key={index} className="bg-white p-8 rounded-xl shadow-md text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-2xl font-bold mx-auto mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose the perfect plan for your business needs
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <PricingCard 
                  key={index}
                  plan={plan.plan}
                  price={plan.price}
                  features={plan.features}
                  popular={plan.popular}
                />
              ))}
            </div>
            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">Need a custom solution for your enterprise?</p>
              <a 
                href="#contact" 
                className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center"
              >
                Contact Sales
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-primary-600 to-blue-600 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that trust SPEMS to manage their projects and finances.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to={user ? "/dashboard" : "/register"} 
                className="bg-white text-primary-700 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {user ? 'Go to Dashboard' : 'Start Free Trial'}
              </Link>
              <a 
                href="#features" 
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:bg-opacity-10 px-8 py-3 rounded-lg font-bold text-lg transition-all duration-300"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Smart Project Earnings <span className="text-primary-600">Management</span> System
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Take control of your projects, track expenses, and maximize profits with our all-in-one project management solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
              >
                {user ? 'Go to Dashboard' : 'Start Free Trial'}
              </Link>
              <a
                href="#demo"
                className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-8 rounded-lg border border-gray-300 transition duration-200"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features for Your Projects</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to manage your projects and finances in one place
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon="📊"
                title="Project Tracking"
                description="Monitor all your projects in real-time with detailed progress and financial insights."
              />
              <FeatureCard 
                icon="💰"
                title="Expense Management"
                description="Easily record and categorize all project-related expenses for better financial control."
              />
              <FeatureCard 
                icon="👥"
                title="Team Collaboration"
                description="Manage team members, assign tasks, and track worker contributions."
              />
              <FeatureCard 
                icon="📈"
                title="Financial Reports"
                description="Generate comprehensive reports on project profitability and financial performance."
              />
              <FeatureCard 
                icon="📱"
                title="Mobile Friendly"
                description="Access your projects and data from anywhere, on any device."
              />
              <FeatureCard 
                icon="🔒"
                title="Secure & Private"
                description="Your data is encrypted and protected with enterprise-grade security."
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How SPEMS Works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started in minutes and transform how you manage your projects
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl text-primary-600 mx-auto mb-4">1</div>
                <h3 className="text-xl font-semibold mb-2">Create Your Account</h3>
                <p className="text-gray-600">Sign up and set up your organization in minutes.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl text-primary-600 mx-auto mb-4">2</div>
                <h3 className="text-xl font-semibold mb-2">Add Your Projects</h3>
                <p className="text-gray-600">Create projects and start adding tasks and team members.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-2xl text-primary-600 mx-auto mb-4">3</div>
                <h3 className="text-xl font-semibold mb-2">Track & Analyze</h3>
                <p className="text-gray-600">Monitor progress and make data-driven decisions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose the plan that fits your needs
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Starter Plan */}
              <div className="border-2 border-blue-500 rounded-lg p-6 text-center hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Starter</h3>
                  <div className="text-4xl font-bold text-gray-900 my-4">$0<span className="text-lg text-gray-500">/month</span></div>
                  <p className="text-gray-600 mb-6">Perfect for individuals getting started</p>
                  <ul className="space-y-3 text-left mb-8">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Up to 3 active projects
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Basic reports
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Email support
                  </li>
                </ul>
                </div>
                <Link
                  to="/register"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 inline-block"
                >
                  Start
                </Link>
              </div>

              {/* Professional Plan - Featured */}
              <div className="border-2 border-blue-500 rounded-lg p-6 text-center bg-white shadow-lg relative flex flex-col h-full">
                <div className="flex-grow">
                  <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-bl rounded-tr">MOST POPULAR</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Professional</h3>
                  <div className="text-4xl font-bold text-gray-900 my-4">$29<span className="text-lg text-gray-500">/month</span></div>
                  <p className="text-gray-600 mb-6">For growing teams and businesses</p>
                  <ul className="space-y-3 text-left mb-8">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Unlimited projects
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Advanced reporting
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Team collaboration
                  </li>
                </ul>
                </div>
                <Link
                  to="/register"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 inline-block"
                >
                  Start
                </Link>
              </div>

              {/* Enterprise Plan */}
              <div className="border-2 border-blue-500 rounded-lg p-6 text-center hover:shadow-md transition-shadow duration-300 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Enterprise</h3>
                  <div className="text-4xl font-bold text-gray-900 my-4">Custom</div>
                  <p className="text-gray-600 mb-6">For large organizations</p>
                  <ul className="space-y-3 text-left mb-8">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Unlimited everything
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Custom integrations
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Dedicated account manager
                  </li>
                </ul>
                </div>
                <Link
                  to="/contact"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition duration-200 inline-block"
                >
                  Start
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary-700 text-white py-20">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-6">Ready to take control of your projects?</h2>
            <p className="text-xl mb-8 opacity-90">Join thousands of professionals who trust SPEMS for their project management needs.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition duration-200"
              >
                Start Free Trial
              </Link>
              <a
                href="#demo"
                className="bg-transparent hover:bg-primary-800 text-white font-semibold py-3 px-8 border border-white rounded-lg transition duration-200"
              >
                Schedule a Demo
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">SPEMS</h3>
              <p className="text-sm">Smart Project Earnings Management System for modern businesses.</p>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">Updates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-sm font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="hover:text-white">GDPR</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">© 2024 SPEMS. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
