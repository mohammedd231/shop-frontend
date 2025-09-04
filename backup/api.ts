import axios from "axios";

// Ensure no trailing slash
const baseURL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

export const api = axios.create({ baseURL });

// Error extraction helper
const extractErrorMessage = (error: any): string => {
  const status = error.response?.status || 'Unknown';
  let message = 'Request failed';
  
  try {
    const data = error.response?.data;
    if (typeof data === 'string') {
      message = data;
    } else if (data?.message) {
      message = data.message;
    } else if (data?.error) {
      message = data.error;
    } else if (error.message) {
      message = error.message;
    }
  } catch (e) {
    // Fallback to error message
    message = error.message || 'Request failed';
  }
  
  return `${status}: ${message}`;
};

// Check for concurrency exception in error response
const isConcurrencyError = (error: any): boolean => {
  const status = error.response?.status;
  if (status !== 500) return false;
  
  const data = error.response?.data;
  if (typeof data === 'string') {
    return data.includes('DbUpdateConcurrencyException');
  }
  if (data?.message) {
    return data.message.includes('DbUpdateConcurrencyException');
  }
  
  // Also treat 500 with empty message as potential concurrency issue
  return !data || data === '';
};

// Track pending add operations to prevent duplicate requests
const pendingAdds: Record<string, boolean> = {};

api.interceptors.request.use((config) => {
  console.debug('[API →]', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''), config.data);
  
  // Try multiple localStorage keys, then fallback to env (dev convenience only)
  const token = 
    localStorage.getItem("jwt") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    import.meta.env.VITE_JWT; // Dev fallback for Bolt preview convenience only - NOT for auth guard

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => {
    console.debug('[API ←]', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.debug('[API ERR]', error.response?.status, error.config?.url, error.message);
    
    // Skip logging for cart add concurrency errors that are being handled locally
    const isCartAddConcurrency = error.config?.url?.includes('/api/cart/items') && 
                                  error.config?.method?.toLowerCase() === 'post' && 
                                  isConcurrencyError(error);
    
    // Only log errors that aren't handled concurrency exceptions
    if (!isCartAddConcurrency && !isConcurrencyError(error)) {
      // One-time console logging for failed requests
      const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
      const url = error.config?.url || 'unknown';
      const status = error.response?.status || 'unknown';
      const message = extractErrorMessage(error);
      
      console.error(`API Error: ${method} ${url} - ${message}`);
    }
    
    // Skip global error event for cart add concurrency errors
    if (!isCartAddConcurrency) {
      const message = extractErrorMessage(error);
      window.dispatchEvent(new CustomEvent('api-error', {
        detail: { message }
      }));
    }
    
    if (error.response?.status === 401) {
      localStorage.removeItem("jwt");
      localStorage.removeItem("user");
      // Optional: redirect to login
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// API service functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/api/auth/register', { email, password, name });
    return response.data;
  }
};

export const productsAPI = {
  getAll: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },
  getById: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },
  create: async (product: any) => {
    const response = await api.post('/api/products', product);
    return response.data;
  },
  update: async (id: string, product: any) => {
    const response = await api.put(`/api/products/${id}`, product);
    return response.data;
  },
  delete: async (id: string) => {
    await api.delete(`/api/products/${id}`);
  }
};

export const cartAPI = {
  get: async (cacheBuster?: string) => {
    const url = cacheBuster ? `/api/cart${cacheBuster}` : '/api/cart';
    const response = await api.get(url, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    console.log('🛒 Raw cart API response:', response.data);
    
    // Normalize cart response
    const data = response.data || {};
    const normalizedCart = {
      userId: data.userId || null,
      items: Array.isArray(data.items) ? data.items : [],
      total: typeof data.total === 'number' ? data.total : 0
    };
    
    // Normalize each item
    normalizedCart.items = normalizedCart.items.map(item => ({
      id: item.productId || item.id,
      productId: item.productId || item.id,
      name: item.name || item.product?.name || 'Unknown Product',
      price: typeof item.price === 'number' ? item.price : (item.product?.price || 0),
      quantity: typeof item.quantity === 'number' ? item.quantity : 1,
      lineTotal: item.lineTotal || (item.price * item.quantity) || ((item.product?.price || 0) * (item.quantity || 1)),
      product: item.product || {
        id: item.productId || item.id || '',
        name: item.name || 'Unknown Product',
        price: typeof item.price === 'number' ? item.price : 0,
        description: item.description || '',
        imageUrl: item.imageUrl || '',
        category: item.category || '',
        stock: item.stock || 0
      }
    }));
    
    console.log('🛒 Normalized cart data:', normalizedCart);
    return normalizedCart;
  },
  addItem: async (productId: string, quantity: number = 1) => {
    const stringProductId = String(productId);
    // Force quantity to be at least 1
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    
    console.log('🛒 Adding item to cart:', { productId: stringProductId, quantity: safeQuantity });
    const response = await api.post('/api/cart/items', { productId: stringProductId, quantity: safeQuantity });
    console.log('🛒 Add item response:', response.data);
    return response.data;
  },
  removeItem: async (productId: string) => {
    await api.delete(`/api/cart/items/${productId}`);
  },
  clear: async () => {
    await api.post('/api/cart/clear');
  }
};

// Export error helper for use in components
export { extractErrorMessage, isConcurrencyError };
export const ordersAPI = {
  checkout: async (orderData: any) => {
    const response = await api.post('/api/orders/checkout', orderData);
    return response.data;
  },
  getMy: async () => {
    const response = await api.get('/api/orders/my');
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/api/orders');
    return response.data;
  },
  updateStatus: async (id: string, status: string) => {
    const response = await api.patch(`/api/orders/${id}/status`, { status });
    return response.data;
  }
};