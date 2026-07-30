
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return { valid: re.test(email), message: 'Please enter a valid email address' };
};

export const validatePassword = (password) => {
  const valid = password && password.length >= 6;
  return { valid, message: 'Password must be at least 6 characters long' };
};

export const validateRequired = (value, fieldName) => {
  const valid = value && value.trim() !== '';
  return { valid, message: `${fieldName} is required` };
};

export const validatePhone = (phone) => {
  if (!phone) return { valid: true };
  const re = /^[+]?[0-9]{8,}$/;
  return { valid: re.test(phone), message: 'Please enter a valid phone number' };
};

export const validateConfirmPassword = (password, confirmPassword) => {
  const valid = password === confirmPassword;
  return { valid, message: 'Passwords do not match' };
};

export const getErrorMessage = (error) => {
  if (!error) return 'An unexpected error occurred';
  
  // Network error
  if (!error.response) {
    return error.message || 'Network error: Check your internet connection and try again';
  }
  
  // Server error with message
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Invalid credentials
  if (error.response?.status === 401) {
    return 'Invalid email or password';
  }
  
  // Default server error
  return `Error: ${error.response?.statusText || 'Something went wrong'}`;
};
