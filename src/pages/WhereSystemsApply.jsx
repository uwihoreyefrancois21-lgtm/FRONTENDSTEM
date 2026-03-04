import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const SectionCard = ({ icon, title, items }) => (
  <div className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 md:p-8 transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center gap-3 mb-4">
      <div className="text-3xl">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900">{title}</h3>
    </div>
    <ul className="space-y-2 text-gray-700">
      {items.map((item, index) => (
        <li key={index} className="flex items-start gap-2 text-sm md:text-base">
          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  </div>
);

const WhereSystemsApply = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Navigation (same as Home) */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
                GlobalTrade Hub
              </span>
              <span className="ml-2 text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded-full font-medium">
                
              </span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Home
              </Link>
              <a href="/#features" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Features
              </a>
              <a href="/#how-it-works" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                How It Works
              </a>
              <a href="/#pricing" className="text-gray-700 hover:text-primary-600 font-medium transition-colors">
                Pricing
              </a>
              <Link 
                to="/where-systems-apply" 
                className="text-gray-900 font-semibold border-b-2 border-primary-600 pb-1 transition-colors"
              >
                Where Our Systems Apply
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link 
                    to="/auth" 
                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/auth" 
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

      <main className="py-10 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 md:space-y-16">
          {/* Intro */}
          <section className="text-center space-y-4">
            <p className="inline-flex items-center px-4 py-1 rounded-full bg-primary-50 text-primary-700 text-xs md:text-sm font-semibold tracking-wide uppercase">
              Where Our Systems Apply
            </p>
            <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight">
              Designed for real businesses, projects and organizations
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm md:text-base">
              SPEMS and the Import &amp; Export Financial System are built to fit different sectors – from
              construction and education to international trade and NGOs – helping you manage projects and
              money with clarity and transparency.
            </p>
          </section>

          {/* Systems Sections in two columns */}
          <section className="grid gap-8 lg:gap-10 lg:grid-cols-2">
            {/* SPEMS Section */}
            <div className="bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-primary-600 px-6 md:px-10 py-6 md:py-8 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  1️⃣ Smart Project Earnings Management System (SPEMS)
                </h2>
                <p className="text-sm md:text-base text-blue-100 max-w-3xl">
                  Follow every project from budget to final profit. SPEMS helps you track income, expenses, tasks
                  and workers while keeping all records organized.
                </p>
              </div>
              <div className="p-6 md:p-10 space-y-10">
                <div className="grid gap-6 md:gap-8 md:grid-cols-2">
                  <SectionCard
                    icon="🏗"
                    title="Construction & Engineering"
                    items={[
                      'Building projects',
                      'Road construction',
                      'Electrical & plumbing works'
                    ]}
                  />
                  <SectionCard
                    icon="💻"
                    title="IT & Technology"
                    items={[
                      'Software development projects',
                      'Website & mobile app projects',
                      'System installation projects'
                    ]}
                  />
                  <SectionCard
                    icon="🎓"
                    title="Education & Training"
                    items={[
                      'Training programs',
                      'Workshops & seminars',
                      'Research projects'
                    ]}
                  />
                  <SectionCard
                    icon="🏥"
                    title="Healthcare"
                    items={[
                      'Medical outreach programs',
                      'Clinic setup projects',
                      'Health campaigns'
                    ]}
                  />
                  <SectionCard
                    icon="🌾"
                    title="Agriculture"
                    items={[
                      'Farming projects',
                      'Livestock projects',
                      'Agricultural development programs'
                    ]}
                  />
                  <SectionCard
                    icon="🏢"
                    title="Business & Corporate"
                    items={[
                      'Company expansion projects',
                      'Product launch projects',
                      'Business operations tracking'
                    ]}
                  />
                  <SectionCard
                    icon="🎭"
                    title="Events & Media"
                    items={[
                      'Event management',
                      'Marketing campaigns',
                      'Film and media production'
                    ]}
                  />
                  <SectionCard
                    icon="🏛"
                    title="Government & NGO Projects"
                    items={[
                      'Community development projects',
                      'Donor-funded projects',
                      'Poverty reduction programs',
                      'Youth empowerment programs',
                      'Gender equality initiatives'
                    ]}
                  />
                </div>

                <div className="hidden bg-blue-50 border border-blue-100 rounded-2xl px-4 md:px-6 py-4 flex flex-col md:flex-row items-start md:items-center gap-3">
                  <div className="flex-shrink-0 rounded-full bg-blue-600 text-white w-10 h-10 flex items-center justify-center text-xl">
                    ✅
                  </div>
                  <p className="text-sm md:text-base text-blue-900">
                    <span className="font-semibold">SPEMS ensures full transparency in fund management</span> –
                    every income and expense is recorded so you clearly see how money is used on each project.
                  </p>
                </div>
              </div>
            </div>

            {/* Import & Export System Section */}
            <div className="bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-fuchsia-600 px-6 md:px-10 py-6 md:py-8 text-white">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">
                  🌎 2️⃣ Import &amp; Export Financial System
                </h2>
                <p className="text-sm md:text-base text-purple-100 max-w-3xl">
                  Built for international trade and logistics – follow shipment costs, partners, payments and
                  profit per shipment in one organized financial system.
                </p>
              </div>
              <div className="p-6 md:p-10 space-y-10">
                <div className="grid gap-6 md:gap-8 md:grid-cols-2">
                  <SectionCard
                    icon="🚢"
                    title="International Trading Companies"
                    items={[
                      'Importers',
                      'Exporters',
                      'Trading companies'
                    ]}
                  />
                  <SectionCard
                    icon="🌾"
                    title="Agriculture Exporters"
                    items={[
                      'Coffee exporters',
                      'Tea exporters',
                      'Fresh produce exporters'
                    ]}
                  />
                  <SectionCard
                    icon="🏭"
                    title="Manufacturing"
                    items={[
                      'Raw material importers',
                      'Machinery importers',
                      'Product exporters'
                    ]}
                  />
                  <SectionCard
                    icon="🛒"
                    title="Retail & Wholesale"
                    items={[
                      'Supermarkets',
                      'Electronics importers',
                      'Clothing & textile businesses'
                    ]}
                  />
                  <SectionCard
                    icon="🚗"
                    title="Automotive"
                    items={[
                      'Car importers',
                      'Spare parts dealers'
                    ]}
                  />
                  <SectionCard
                    icon="💊"
                    title="Pharmaceutical"
                    items={[
                      'Medicine importers',
                      'Medical equipment suppliers'
                    ]}
                  />
                  <SectionCard
                    icon="⚡"
                    title="Energy & Industrial Supplies"
                    items={[
                      'Solar equipment importers',
                      'Fuel importers',
                      'Industrial product suppliers'
                    ]}
                  />
                </div>

                <div className="hidden bg-purple-50 border border-purple-100 rounded-2xl px-4 md:px-6 py-4 flex flex-col md:flex-row items-start md:items-center gap-3">
                  <div className="flex-shrink-0 rounded-full bg-purple-600 text-white w-10 h-10 flex items-center justify-center text-xl">
                    📊
                  </div>
                  <p className="text-sm md:text-base text-purple-900">
                    The Import &amp; Export Financial System helps you manage{' '}
                    <span className="font-semibold">
                      shipment costs, customs &amp; supplier &amp; buyer transactions and profit per shipment
                    </span>{' '}
                    with clear financial reporting.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* System highlights in same row under both columns */}
          <section className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl px-4 md:px-6 py-4 flex items-start gap-3">
                <div className="flex-shrink-0 rounded-full bg-blue-600 text-white w-10 h-10 flex items-center justify-center text-xl">
                  ✅
                </div>
                <p className="text-sm md:text-base text-blue-900">
                  <span className="font-semibold">SPEMS ensures full transparency in fund management</span> –
                  every income and expense is recorded so you clearly see how money is used on each project.
                </p>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-2xl px-4 md:px-6 py-4 flex items-start gap-3">
                <div className="flex-shrink-0 rounded-full bg-purple-600 text-white w-10 h-10 flex items-center justify-center text-xl">
                  📊
                </div>
                <p className="text-sm md:text-base text-purple-900">
                  The Import &amp; Export Financial System helps you manage{' '}
                  <span className="font-semibold">
                    shipment costs, customs &amp; tax payments, supplier &amp; buyer transactions and profit per shipment
                  </span>{' '}
                  with clear financial reporting.
                </p>
              </div>
            </div>
            <div className="text-center">
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Go to Register
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Footer (same as Home) */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">GlobalTrade Hub</h3>
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
    </div>
  );
};

export default WhereSystemsApply;


