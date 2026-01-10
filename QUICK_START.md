# Quick Start Guide - SPEMS Frontend

## 🚀 Installation & Setup

```bash
# 1. Navigate to project
cd my-react-app

# 2. Install dependencies
npm install

# 3. Set up environment variable
# Create .env file with:
VITE_API_URL=http://localhost:3000/api

# 4. Start the development server
npm run dev
```

## 🧪 Test the Application

1. **Start the backend API** (make sure it's running on port 3000)
2. Open browser to `http://localhost:5173`
3. You should see the login page

## 👤 First User

### For Admin User:
1. Register a new user through the registration page
2. In the database, manually set this user's role to 'admin' and approve_user to true
3. Login with these credentials
4. Access the Admin Panel to approve other users

### For Staff User:
1. Register a new user
2. Admin needs to approve from Admin Panel
3. After approval, login with these credentials

## 📋 Application Flow

1. **Login/Register** → Get authenticated
2. **Dashboard** → View statistics and overview
3. **Projects** → Manage your projects
4. **Transactions** → Add income/expenses
5. **Reports** → View financial summaries
6. **Admin Panel** → Manage users (admin only)

## 🔑 Key Features

- **JWT Authentication**: Secure token-based auth
- **Protected Routes**: Requires login
- **Role-Based Access**: Admin vs Staff
- **Real-time Stats**: Dashboard updates automatically
- **CRUD Operations**: Full Create, Read, Update, Delete
- **Financial Tracking**: Automatic balance calculation

## 🎨 UI Features

- Responsive design with Tailwind CSS
- Modern gradient backgrounds
- Intuitive navigation
- Color-coded financial data (green for income, red for expenses)
- Modal forms for data entry
- Loading states and animations

## 🐛 Troubleshooting

### API Connection Issues
- Check if backend is running
- Verify API URL in .env file
- Check console for errors

### Authentication Issues
- Clear localStorage and try again
- Check if user is approved (for staff)
- Verify token is valid

### Build Issues
- Run `npm install` again
- Clear node_modules and reinstall
- Check Node.js version (16+)

## 📦 Production Build

```bash
npm run build
```

Output will be in `dist/` folder.

---

**Ready to go! Start managing your projects! 🎉**

