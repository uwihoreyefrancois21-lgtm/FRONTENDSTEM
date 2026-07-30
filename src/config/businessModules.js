export const PLAN_MODULES = {
  services: [
    'dashboard', 'users', 'roles', 'branches', 'employees', 'attendance', 'salaries',
    'expenses', 'expense_categories',
    'services', 'service_materials', 'sales', 'sale_items', 'sale_returns',
    'customers', 'payments', 'payment_methods',
    'ai_conversations', 'ai_messages', 'ai_requests', 'ai_insights', 'ai_reports',
    'reports', 'notifications', 'activity_logs',
    'attendance_devices', 'employee_biometrics', 'work_shifts', 'employee_shifts', 'attendance_logs',
    'products', 'categories', 'units',
    'workers', 'worker_attendance',
  ],
  projects: [
    'dashboard', 'users', 'roles', 'branches', 'employees', 'attendance', 'salaries',
    'expenses', 'expense_categories',
    'projects', 'project_tasks', 'project_workers', 'project_materials',
    'ai_conversations', 'ai_messages', 'ai_requests', 'ai_insights', 'ai_reports',
    'reports', 'notifications', 'activity_logs',
    'attendance_devices', 'employee_biometrics', 'work_shifts', 'employee_shifts', 'attendance_logs',
    'workers', 'worker_attendance',
  ],
  products: [
    'dashboard', 'users', 'roles', 'branches', 'employees', 'attendance', 'salaries',
    'expenses', 'expense_categories',
    'products', 'product_variants', 'categories', 'units', 'inventory', 'stock_movements',
    'purchases', 'purchase_items', 'suppliers',
    'sales', 'sale_items', 'sale_returns', 'customers', 'payments', 'payment_methods',
    'ai_conversations', 'ai_messages', 'ai_requests', 'ai_insights', 'ai_reports',
    'reports', 'notifications', 'activity_logs',
    'attendance_devices', 'employee_biometrics', 'work_shifts', 'employee_shifts', 'attendance_logs',
    'workers', 'worker_attendance',
  ],
  all: [
    'dashboard', 'users', 'roles', 'branches', 'employees', 'attendance', 'salaries',
    'expenses', 'expense_categories',
    'products', 'product_variants', 'categories', 'units', 'inventory', 'stock_movements',
    'purchases', 'purchase_items', 'suppliers',
    'sales', 'sale_items', 'sale_returns', 'customers', 'payments', 'payment_methods',
    'services', 'service_materials',
    'projects', 'project_tasks', 'project_workers', 'project_materials',
    'chart_of_accounts', 'journal_entries', 'journal_entry_items',
    'ai_conversations', 'ai_messages', 'ai_requests', 'ai_insights', 'ai_reports',
    'reports', 'notifications', 'activity_logs',
    'attendance_devices', 'employee_biometrics', 'work_shifts', 'employee_shifts', 'attendance_logs',
    'workers', 'worker_attendance',
  ],
};

export const BUSINESS_TYPE_ROLES = {
  services: [
    'Company Admin', 'Branch Manager', 'Accountant', 'Cashier', 'Sales Officer',
    'HR Manager', 'Receptionist', 'Viewer',
  ],
  projects: [
    'Company Admin', 'Branch Manager', 'Accountant', 'HR Manager', 'Supervisor', 'Viewer',
  ],
  products: [
    'Company Admin', 'Branch Manager', 'Accountant', 'Cashier', 'Sales Officer',
    'Storekeeper', 'Inventory Officer', 'HR Manager', 'Viewer',
  ],
  all: null,
};

const ALL_PERMISSION_CATEGORIES = [
  {
    name: 'Dashboard & Reports',
    permissions: ['dashboard', 'reports'],
  },
  {
    name: 'User Management',
    permissions: ['users', 'roles'],
  },
  {
    name: 'Services',
    permissions: ['services', 'service_materials'],
  },
  {
    name: 'Products & Inventory',
    permissions: ['products', 'product_variants', 'categories', 'units', 'inventory', 'stock_movements', 'suppliers'],
  },
  {
    name: 'Sales & POS',
    permissions: ['sales', 'sale_items', 'sale_returns', 'customers', 'payments', 'payment_methods'],
  },
  {
    name: 'Projects & Tasks',
    permissions: ['projects', 'project_tasks', 'project_workers', 'project_materials'],
  },
  {
    name: 'Employees & HR',
    permissions: ['employees', 'attendance', 'salaries', 'attendance_devices', 'employee_biometrics', 'work_shifts', 'employee_shifts', 'attendance_logs', 'workers', 'worker_attendance'],
  },
  {
    name: 'Accounting',
    permissions: ['expenses', 'expense_categories', 'journal_entries', 'journal_entry_items', 'chart_of_accounts'],
  },
  {
    name: 'AI',
    permissions: ['ai_conversations', 'ai_messages', 'ai_requests', 'ai_insights', 'ai_reports'],
  },
];

export const AVAILABLE_ACTIONS = ['read', 'create', 'update', 'delete'];

export function getAllowedModulesForBusinessType(businessType) {
  return PLAN_MODULES[businessType] || PLAN_MODULES.all;
}

export function getPermissionCategoriesForBusinessType(businessType) {
  const allowed = new Set(getAllowedModulesForBusinessType(businessType));
  return ALL_PERMISSION_CATEGORIES
    .map(category => ({
      ...category,
      permissions: category.permissions.filter(p => allowed.has(p)),
    }))
    .filter(category => category.permissions.length > 0);
}

export function getRolesForBusinessType(roles, businessType) {
  // Return all roles, don't filter by business type
  return roles;
}

export function initializePermissionsObject(categories = ALL_PERMISSION_CATEGORIES) {
  const initialPermissions = {};
  categories.forEach(category => {
    category.permissions.forEach(resource => {
      initialPermissions[resource] = { read: false, create: false, update: false, delete: false };
    });
  });
  return initialPermissions;
}

export function rolePermissionsToObject(rolePermissions, categories) {
  const merged = initializePermissionsObject(categories);
  if (!rolePermissions) return merged;

  Object.keys(rolePermissions).forEach(resource => {
    if (!merged[resource]) return;
    if (Array.isArray(rolePermissions[resource])) {
      AVAILABLE_ACTIONS.forEach(action => {
        merged[resource][action] = rolePermissions[resource].includes(action);
      });
    } else if (typeof rolePermissions[resource] === 'object') {
      merged[resource] = { ...merged[resource], ...rolePermissions[resource] };
    }
  });
  return merged;
}

export function permissionsObjectToArray(permissionsObject, visibleResources) {
  const result = {};
  visibleResources.forEach(resource => {
    const resourcePerm = permissionsObject[resource];
    if (!resourcePerm) {
      result[resource] = [];
      return;
    }
    result[resource] = AVAILABLE_ACTIONS.filter(action => resourcePerm[action]);
  });
  return result;
}

export function mergeRolePermissions(existingPermissions, updatedPermissions) {
  const existing = existingPermissions || {};
  return { ...existing, ...updatedPermissions };
}

export function getVisibleResources(categories) {
  return categories.flatMap(category => category.permissions);
}
