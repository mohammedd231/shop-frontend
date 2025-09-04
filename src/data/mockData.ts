export const products = [
  {
    id: "1",
    name: "Apple AirPods Pro",
    description: "Active Noise Cancellation, Transparency mode, and spatial audio. Up to 6 hours of listening time with ANC enabled.",
    price: 199.99,
    imageUrl: "https://images.pexels.com/photos/8534088/pexels-photo-8534088.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Electronics",
    stock: 50,
    featured: true
  },
  {
    id: "2", 
    name: "Sony WH-1000XM4 Headphones",
    description: "Industry-leading noise canceling with Dual Noise Sensor technology. Up to 30-hour battery life with quick charge.",
    price: 349.99,
    imageUrl: "https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Electronics",
    stock: 25,
    featured: true
  },
  {
    id: "3",
    name: "Organic Cotton T-Shirt",
    description: "Comfortable and sustainable organic cotton t-shirt available in multiple colors. Made from 100% certified organic cotton.",
    price: 29.99,
    imageUrl: "https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Clothing",
    stock: 100,
    featured: false
  },
  {
    id: "4",
    name: "Smart Fitness Watch",
    description: "Advanced fitness tracking with heart rate monitoring, GPS, and smartphone integration. Water-resistant design for all activities.",
    price: 299.99,
    imageUrl: "https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Electronics",
    stock: 25,
    featured: true
  },
  {
    id: "5",
    name: "Artisan Coffee Beans",
    description: "Single-origin coffee beans roasted to perfection. Rich, full-bodied flavor with notes of chocolate and caramel.",
    price: 24.99,
    imageUrl: "https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Food & Beverage",
    stock: 75,
    featured: false
  },
  {
    id: "6",
    name: "Minimalist Desk Lamp",
    description: "Modern LED desk lamp with adjustable brightness and color temperature. Perfect for home office or study space.",
    price: 89.99,
    imageUrl: "https://images.pexels.com/photos/1112598/pexels-photo-1112598.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Home & Garden",
    stock: 40,
    featured: false
  },
  {
    id: "7",
    name: "Premium Yoga Mat",
    description: "Non-slip yoga mat made from eco-friendly materials. Provides excellent grip and cushioning for all yoga practices.",
    price: 59.99,
    imageUrl: "https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Sports & Fitness",
    stock: 60,
    featured: true
  },
  {
    id: "8",
    name: "Ceramic Plant Pot Set",
    description: "Beautiful set of 3 ceramic plant pots in different sizes. Perfect for indoor plants and home decoration.",
    price: 45.99,
    imageUrl: "https://images.pexels.com/photos/1005058/pexels-photo-1005058.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Home & Garden",
    stock: 35,
    featured: false
  },
  {
    id: "9",
    name: "Leather Crossbody Bag",
    description: "Handcrafted genuine leather crossbody bag with multiple compartments. Stylish and functional for everyday use.",
    price: 129.99,
    imageUrl: "https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Fashion",
    stock: 20,
    featured: false
  },
  {
    id: "10",
    name: "Stainless Steel Water Bottle",
    description: "Insulated stainless steel water bottle that keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and eco-friendly.",
    price: 34.99,
    imageUrl: "https://images.pexels.com/photos/1000084/pexels-photo-1000084.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Sports & Fitness",
    stock: 80,
    featured: false
  },
  {
    id: "11",
    name: "Wireless Phone Charger",
    description: "Fast wireless charging pad compatible with all Qi-enabled devices. Sleek design with LED charging indicator.",
    price: 39.99,
    imageUrl: "https://images.pexels.com/photos/4526414/pexels-photo-4526414.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Electronics",
    stock: 45,
    featured: true
  },
  {
    id: "12",
    name: "MacBook Pro 14-inch",
    description: "Apple M2 Pro chip, 16GB RAM, 512GB SSD. Perfect for professionals and creatives with stunning Liquid Retina XDR display.",
    price: 1999.99,
    imageUrl: "https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg?auto=compress&cs=tinysrgb&w=500",
    category: "Electronics",
    stock: 15,
    featured: true
  }
];

// Legacy exports for compatibility
export const mockProducts = products;
export const mockOrders = [];

export const fetchProducts = async () => {
  throw new Error('Use productsAPI.getAll() instead');
};

export const fetchOrders = async () => {
  throw new Error('Use ordersAPI.getMy() or ordersAPI.getAll() instead');
};