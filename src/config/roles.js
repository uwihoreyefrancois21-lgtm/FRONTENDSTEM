
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  COMPANY_OWNER: 'company_owner',
  COMPANY_ADMIN: 'company_admin',
  MANAGER: 'manager',
  ACCOUNTANT: 'accountant',
  CASHIER: 'cashier',
  INVENTORY_OFFICER: 'inventory_officer',
  HR_OFFICER: 'hr_officer',
  PROJECT_MANAGER: 'project_manager',
  EMPLOYEE: 'employee',
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    dashboard: true,
    companies: ['create', 'read', 'update', 'delete'],
    subscriptionPlans: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    systemSettings: ['read', 'update'],
    auditLogs: ['read'],
  },
  [ROLES.COMPANY_OWNER]: {
    dashboard: true,
    branches: ['create', 'read', 'update', 'delete'],
    users: ['create', 'read', 'update', 'delete'],
    roles: ['create', 'read', 'update', 'delete'],
    products: ['create', 'read', 'update', 'delete'],
    customers: ['create', 'read', 'update', 'delete'],
    suppliers: ['create', 'read', 'update', 'delete'],
    sales: ['create', 'read', 'update', 'delete'],
    purchases: ['create', 'read', 'update', 'delete'],
    inventory: ['create', 'read', 'update', 'delete'],
    employees: ['create', 'read', 'update', 'delete'],
    attendance: ['create', 'read', 'update', 'delete'],
    payroll: ['create', 'read', 'update', 'delete'],
    accounting: ['create', 'read', 'update', 'delete'],
    projects: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
    subscription: ['read', 'update'],
  },
  [ROLES.COMPANY_ADMIN]: {
    dashboard: true,
    users: ['create', 'read', 'update'],
    products: ['create', 'read', 'update', 'delete'],
    customers: ['create', 'read', 'update', 'delete'],
    suppliers: ['create', 'read', 'update', 'delete'],
    sales: ['create', 'read', 'update', 'delete'],
    purchases: ['create', 'read', 'update', 'delete'],
    inventory: ['create', 'read', 'update', 'delete'],
    employees: ['create', 'read', 'update', 'delete'],
    projects: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
  },
  [ROLES.MANAGER]: {
    dashboard: true,
    sales: ['create', 'read', 'update'],
    purchases: ['create', 'read', 'update'],
    inventory: ['create', 'read', 'update'],
    employees: ['read'],
    projects: ['create', 'read', 'update'],
    reports: ['read'],
  },
  [ROLES.ACCOUNTANT]: {
    dashboard: true,
    expenses: ['create', 'read', 'update', 'delete'],
    payments: ['create', 'read', 'update', 'delete'],
    journalEntries: ['create', 'read', 'update', 'delete'],
    chartOfAccounts: ['create', 'read', 'update', 'delete'],
    payroll: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
  },
  [ROLES.CASHIER]: {
    dashboard: true,
    sales: ['create', 'read'],
    invoices: ['create', 'read'],
    payments: ['create', 'read'],
  },
  [ROLES.INVENTORY_OFFICER]: {
    dashboard: true,
    products: ['create', 'read', 'update', 'delete'],
    inventory: ['create', 'read', 'update', 'delete'],
    purchases: ['create', 'read', 'update'],
    reports: ['read'],
  },
  [ROLES.HR_OFFICER]: {
    dashboard: true,
    employees: ['create', 'read', 'update', 'delete'],
    attendance: ['create', 'read', 'update', 'delete'],
    payroll: ['create', 'read', 'update'],
    reports: ['read'],
  },
  [ROLES.PROJECT_MANAGER]: {
    dashboard: true,
    projects: ['create', 'read', 'update', 'delete'],
    projectWorkers: ['create', 'read', 'update', 'delete'],
    projectTasks: ['create', 'read', 'update', 'delete'],
    reports: ['read'],
  },
  [ROLES.EMPLOYEE]: {
    dashboard: true,
    attendance: ['read'],
    tasks: ['read', 'update'],
    payslips: ['read'],
    profile: ['read', 'update'],
  },
};

export const hasPermission = (userRole, resource, action = null) => {
  const permissions = ROLE_PERMISSIONS[userRole];
  if (!permissions) return false;
  if (!permissions[resource]) return false;
  if (action === null) return true;
  return permissions[resource].includes(action);
};

