import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WhatsAppButton from '../components/WhatsAppButton';

const FeatureCard = ({ icon, title, description }) => (
  <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
    <div className="text-primary-600 text-4xl mb-5">{icon}</div>
    <h3 className="text-xl font-bold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{description}</p>
  </div>
);

const PricingCard = ({ plan, price, features, popular = false }) => (
  <div className={`bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
    popular ? 'border-blue-500 transform scale-105' : 'border-gray-200'
  } transition-all duration-300`}>
    {popular && (
      <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
        MOST POPULAR
      </div>
    )}
    <div className="p-8 text-center">
      <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan}</h3>
      <div className="mb-6">
        <span className="text-4xl font-extrabold text-gray-900">${price}</span>
        {price !== 'Custom' && <span className="text-gray-600">/month</span>}
      </div>
      <p className="text-gray-600 mb-8">Everything you need to manage your projects effectively</p>
      <ul className="space-y-3 text-left mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg className="h-5 w-5 text-blue-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>
      <Link
        to="/register"
        className={`w-full ${
          popular ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 hover:bg-gray-900'
        } text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block`}
      >
        Get Started
      </Link>
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
      title: 'Task Managment',
      description: 'Manage your Task, assign tasks, and track worker and payments.'
    },
    {
      icon: '📈',
      title: 'Analytics & Reports',
      description: 'Generate comprehensive reports to analyze project performance and make data-driven decisions.'
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
        <section className="relative overflow-hidden min-h-[600px] md:min-h-[840px] flex items-center">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/spemimage.jpg"
              alt="Project Management"
              className="w-full h-full object-cover min-h-[600px] md:min-h-[700px]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MDAgNDAwIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMjU2M0VGOyIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiA3QzNGQkY7IiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkeT0iLjNlbSIgZmlsbD0id2hpdGUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCIgZm9udC1zaXplPSIyNHB4IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TUEVNIFByb2plY3QgTWFuYWdlbWVudDwvdGV4dD48L3N2Zz4=';
                e.target.className = 'w-full h-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center';
                e.target.alt = 'Placeholder banner';
              }}
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          
          {/* Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-center text-white max-w-4xl mx-auto">
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
                  description: 'Sign up for  account  and  Sign inand set up your profile in minutes.'
                },
                {
                  number: '2',
                  title: 'Add Your Projects',
                  description: 'Create projects, add assign task, and set up your budget.'
                },
                {
                  number: '3',
                  title: 'Track & Analyze',
                  description: 'Monitor progress, track income , expenses, and analyze your project performance.'
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                One plan with everything you need for just $10/month
              </p>
            </div>
            
            <div className="max-w-md mx-auto">
              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-blue-500">
                <div className="p-8 text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium Plan</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-extrabold text-gray-900">$10</span>
                    <span className="text-gray-600">/month</span>
                  </div>
                  <p className="text-gray-600 mb-8">Everything you need to manage your projects effectively</p>
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
                      Task Managment
                    </li>
                  </ul>
                  <Link
                    to={user ? "/dashboard" : "/register"}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 inline-block"
                  >
                    {user ? 'Go to Dashboard' : 'Get Started Now'}
                  </Link>
                </div>
              </div>
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
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">SPEMS</h3>
              <p className="text-gray-400">Smart Project Earnings Management System</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-yellow-500 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-yellow-500 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-yellow-500 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
                </a>
                <a href="https://whatsapp.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-yellow-500 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-yellow-500 transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
                </a>
              </div>
      
              {/* Contact Information */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:info@neg.co.rw" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    info@neg.co.rw
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+250795813936" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    +250 795 813 936
                  </a>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+250785590999" className="text-gray-300 hover:text-yellow-400 transition-colors">
                    +250 785 590 999
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} SPEMS. All rights reserved.</p>
          </div>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  );
};

export default Home;