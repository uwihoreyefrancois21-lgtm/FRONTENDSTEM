# API Setup Guide for SPEMS Frontend

## Backend API Requirements

The frontend expects a backend API running with the following endpoints:

### Base URL
Set in `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
```

### API Endpoints Required

#### 1. Authentication (`/api/auth/*`)

```
POST /api/auth/register
- Body: { username, email, password, phone }
- Returns: { success, message, data: { user } }

POST /api/auth/login
- Body: { email, password }
- Returns: { success, message, data: { user, token } }

GET /api/auth/me
- Headers: Authorization: Bearer {token}
- Returns: { success, message, data: { user } }

POST /api/auth/approve-user/:userId
- Headers: Authorization: Bearer {admin_token}
- Returns: { success, message, data: { user } }

POST /api/auth/reject-user/:userId
- Headers: Authorization: Bearer {admin_token}
- Returns: { success, message }
```

#### 2. Projects (`/api/projects/*`)

```
GET /api/projects
- Returns: { success, message, data: { projects: [...] } }

GET /api/projects/:id
- Returns: { success, message, data: { project } }

POST /api/projects
- Body: { project_name, description, start_date, end_date }
- Returns: { success, message, data: { project } }

PUT /api/projects/:id
- Body: { project_name, description, start_date, end_date }
- Returns: { success, message, data: { project } }

DELETE /api/projects/:id
- Returns: { success, message }
```

#### 3. Tasks (`/api/tasks/*`)

```
GET /api/tasks?project_id=1
- Returns: { success, message, data: { tasks: [...] } }

GET /api/tasks/:id
- Returns: { success, message, data: { task } }

POST /api/tasks
- Body: { project_id, task_name, description, worker_name, worker_phone, cost, task_date }
- Returns: { success, message, data: { task } }

PUT /api/tasks/:id
- Body: { task_name, description, worker_name, worker_phone, cost, task_date }
- Returns: { success, message, data: { task } }

DELETE /api/tasks/:id
- Returns: { success, message }
```

#### 4. Transactions (`/api/transactions/*`)

```
GET /api/transactions?project_id=1
- Returns: { success, message, data: { transactions: [...] } }

GET /api/transactions/:id
- Returns: { success, message, data: { transaction } }

POST /api/transactions
- Body: { project_id, task_id, type, amount, description, transaction_date }
- Returns: { success, message, data: { transaction } }

PUT /api/transactions/:id
- Body: { type, amount, description, transaction_date }
- Returns: { success, message, data: { transaction } }

DELETE /api/transactions/:id
- Returns: { success, message }
```

#### 5. Reports (`/api/reports/*`)

```
GET /api/reports/dashboard
- Returns: { success, message, data: { stats: {...}, projects: [...] } }

GET /api/reports/project/:id
- Returns: { success, message, data: { project, tasks, transactions, income, expense } }

GET /api/reports/financial-summary
- Returns: { success, message, data: { summary: [...] } }
```

#### 6. Users (`/api/users/*`) - Admin Only

```
GET /api/users
- Returns: { success, message, data: { users: [...] } }

GET /api/users/:id
- Returns: { success, message, data: { user } }

PUT /api/users/:id
- Body: { username, email, role }
- Returns: { success, message, data: { user } }

DELETE /api/users/:id
- Returns: { success, message }
```

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```

## Authentication

All protected endpoints require a JWT token in the header:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Database Schema

The backend should implement these tables:

### Users Table
```sql
id (SERIAL PRIMARY KEY)
username (VARCHAR)
email (VARCHAR UNIQUE)
password (VARCHAR - hashed)
phone (VARCHAR)
role (VARCHAR - 'admin' or 'staff')
approve_user (BOOLEAN)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Projects Table
```sql
id (SERIAL PRIMARY KEY)
user_id (INT REFERENCES users)
project_name (VARCHAR)
description (TEXT)
start_date (DATE)
end_date (DATE)
total_income (DECIMAL)
total_expense (DECIMAL)
balance (DECIMAL - GENERATED AS total_income - total_expense)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Tasks Table
```sql
id (SERIAL PRIMARY KEY)
project_id (INT REFERENCES projects)
task_name (VARCHAR)
description (TEXT)
worker_name (VARCHAR)
worker_phone (VARCHAR)
cost (DECIMAL)
task_date (DATE)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

### Transactions Table
```sql
id (SERIAL PRIMARY KEY)
project_id (INT REFERENCES projects)
task_id (INT REFERENCES tasks - nullable)
type (VARCHAR - 'income' or 'expense')
amount (DECIMAL)
description (TEXT)
transaction_date (DATE)
created_at (TIMESTAMP)
updated_at (TIMESTAMP)
```

## CORS Configuration

The backend must allow CORS for the frontend:

```javascript
// Example (Express.js)
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Testing

Use the frontend with a backend that implements these endpoints exactly as specified above.

---

**Backend developers:** Implement these endpoints and the frontend will work seamlessly!

