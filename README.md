# SPEMS - Smart Project Expense Management System

A comprehensive React frontend application for managing projects, tasks, expenses, and financial transactions.

## 🌟 Features

- **User Authentication**: Secure login and registration with admin approval system
- **Project Management**: Create, view, edit, and delete projects
- **Task Tracking**: Manage tasks with worker details and costs
- **Transaction Management**: Track income and expenses per project
- **Financial Reports**: View comprehensive financial summaries
- **Dashboard**: Real-time statistics and project overview
- **Admin Panel**: User management and approval system
- **Responsive Design**: Beautiful UI built with Tailwind CSS

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ installed
- Backend API running (see API documentation)

### Installation

1. Navigate to the project directory:
```bash
cd my-react-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the `my-react-app` directory:
```
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout.jsx          # Main layout with navigation
│   └── ProtectedRoute.jsx   # Route protection component
├── contexts/
│   └── AuthContext.jsx      # Authentication context
├── pages/
│   ├── Admin.jsx            # Admin panel for user management
│   ├── Dashboard.jsx        # Main dashboard with statistics
│   ├── Login.jsx            # Login page
│   ├── ProjectDetail.jsx    # Project details with tasks and transactions
│   ├── Projects.jsx          # Projects list and management
│   ├── Register.jsx         # Registration page
│   ├── Reports.jsx          # Financial reports
│   └── Transactions.jsx     # Transaction management
├── services/
│   ├── api.js               # Axios configuration
│   ├── authService.js       # Authentication API calls
│   ├── projectService.js     # Project API calls
│   ├── taskService.js        # Task API calls
│   ├── transactionService.js # Transaction API calls
│   ├── reportService.js     # Report API calls
│   ├── userService.js       # User API calls
│   └── index.js             # Service exports
├── App.jsx                   # Main app with routing
├── main.jsx                  # Entry point
└── index.css                 # Global styles with Tailwind
```

## 🔐 User Roles

### Staff
- View own projects
- Create and manage projects
- Add tasks and transactions
- View financial reports
- Manage own dashboard

### Admin
- All staff capabilities
- Approve/reject user registrations
- View all users
- Access to admin panel
- View all projects and transactions

## 📊 Pages Overview

### Dashboard
- Total projects, income, expenses, and balance
- Recent projects overview
- Quick statistics

### Projects
- List all projects with financial summary
- Create new projects
- Edit existing projects
- Delete projects

### Project Detail
- View project information
- See all tasks related to the project
- View all transactions for the project

### Transactions
- Add income and expense transactions
- Filter by project
- Delete transactions

### Reports
- Financial summary by project
- Total income, expense, and balance
- Project profitability analysis

### Admin Panel
- View all users
- Approve pending users
- Reject user approvals
- Filter by status

## 🎨 Technology Stack

- **React 19**: Modern UI framework
- **React Router DOM**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client
- **Context API**: State management
- **Vite**: Build tool

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `my-react-app` directory:

```env
VITE_API_URL=http://localhost:3000/api
```

### API Endpoints

The application expects the following API structure:
- `/api/auth/*` - Authentication endpoints
- `/api/projects/*` - Project endpoints
- `/api/tasks/*` - Task endpoints
- `/api/transactions/*` - Transaction endpoints
- `/api/reports/*` - Report endpoints
- `/api/users/*` - User management endpoints

## 🚢 Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📝 Usage

1. **Registration**: New users can register but need admin approval to login
2. **Login**: Use email and password to login (approved users only)
3. **Dashboard**: View overview of all projects and finances
4. **Projects**: Create and manage projects
5. **Transactions**: Add income and expenses
6. **Reports**: View financial summaries
7. **Admin**: Manage users (admin only)

## 🔒 Security Features

- JWT token-based authentication
- Protected routes
- Role-based access control
- Secure API communication
- Token expiration handling

## 💡 Key Features

- Automatic balance calculation
- Real-time financial tracking
- Project-based task management
- Comprehensive reporting
- Responsive design
- Professional UI/UX

## 📞 Support

For issues or questions, please contact the development team.

---

**Happy Managing! 🎉**
