import { api } from './api';

export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  price: number;
  stockQuantity: number;
  imageUrl?: string | null;
}

export const productsAPI = {
  getAll: async () => {
    const response = await api.get('/api/products');
    return response.data;
  },
  
  getById: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },
  
  create: async (product: CreateProductRequest) => {
    const response = await api.post('/api/products', product);
    return response.data;
  },
  
  update: async (id: string, product: CreateProductRequest) => {
    const response = await api.put(`/api/products/${id}`, product);
    return response.data;
  },
  
  delete: async (id: string) => {
    await api.delete(`/api/products/${id}`);
  },
  
  bulkCreateProducts: async (products: any[]) => {
    const response = await api.post('/api/admin-seed/import', products);
    return response.data;
  }
};

export const importSampleProductsFromMock = async () => {
  const { mockProducts } = await import("../data/mockData");
  const payload = mockProducts.map(p => ({
    name: p.name,
    description: p.description ?? "",
    category: p.category ?? "general",
    price: p.price,
    stockQuantity: p.stockQuantity ?? 10,
    imageUrl: p.imageUrl ?? p.image ?? null
  }));
  const res = await api.post("/api/admin-seed/import", payload);
  return res.data;
}