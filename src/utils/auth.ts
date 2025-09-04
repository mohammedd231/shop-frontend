// Authentication utility functions

/**
 * Check if user is logged in by verifying JWT token in localStorage
 * Only checks localStorage keys: jwt, access_token, token
 * Does NOT use VITE_JWT for guard logic
 */
export const isLoggedIn = (): boolean => {
  const jwt = localStorage.getItem('jwt');
  const accessToken = localStorage.getItem('access_token');
  const token = localStorage.getItem('token');
  
  return !!(jwt || accessToken || token);
};

/**
 * Check if user has admin role
 * Parses JWT token to extract role information
 */
export const isAdmin = (): boolean => {
  const jwt = localStorage.getItem('jwt');
  
  if (!jwt) {
    console.log('🔍 Debug - No JWT found in localStorage');
    return false;
  }

  try {
    // Parse JWT payload (base64 decode the middle part)
    const payload = JSON.parse(atob(jwt.split('.')[1]));
    console.log('🔍 Debug - JWT payload:', payload);
    
    // Check for admin role in various possible fields
    const isAdminUser = payload.role === 'admin' || 
                       payload.roles?.includes('admin') ||
                       (Array.isArray(payload.roles) && payload.roles.some((r: string) => r.toLowerCase() === 'admin'));
    
    console.log('🔍 Debug - Is admin?', isAdminUser);
    console.log('🔍 Debug - Role field:', payload.role);
    console.log('🔍 Debug - Roles array:', payload.roles);
    
    return isAdminUser;
  } catch (error) {
    console.error('Failed to parse JWT:', error);
    return false;
  }
};