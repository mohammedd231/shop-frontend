import React, { useState, useEffect } from 'react';
import { Search, Filter, Sparkles, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard from '../components/ui/ProductCard';
import { productsAPI } from '../api/api';
import { Product } from '../types';

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setError(null);
        const productsData = await productsAPI.getAll();
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load products:', error);
        setError('Failed to load products from API');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const handleProductDeleted = () => {
    // Reload products after deletion
    const loadProducts = async () => {
      try {
        const productsData = await productsAPI.getAll();
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to reload products:', error);
      }
    };
    loadProducts();
  };
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];
  
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredProducts = products.filter(p => p.featured);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-3xl text-white p-8 md:p-12 mb-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center space-x-2 mb-4">
            <Sparkles className="h-6 w-6 text-yellow-300" />
            <span className="text-yellow-300 font-semibold">Premium Quality</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Discover Amazing Products
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
            Shop the latest trends with free shipping on orders over $100
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105">
            Shop Now
          </button>
        </div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full"></div>
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/5 rounded-full"></div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
        >
          <motion.div 
            className="flex items-center space-x-3 mb-8"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="h-6 w-6 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onProductDeleted={handleProductDeleted} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div 
          className="flex items-center justify-between mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-2xl font-bold text-gray-900">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
          </h2>
          <span className="text-gray-500 font-medium">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        </motion.div>
        
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} onProductDeleted={handleProductDeleted} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="bg-gray-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {products.length === 0 ? 'No products available' : 'No products found'}
            </h3>
            <p className="text-gray-600">
              {products.length === 0 
                ? 'Check your API connection or add some products' 
                : 'Try adjusting your search or filter criteria'
              }
            </p>
          </div>
        )}
      </motion.section>

      {/* Footer Section */}
      <footer className="bg-gray-50 mt-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">ShopFlow</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Sustainability</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Security</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Return Policy</a></li>
            </ul>
          </div>

          {/* Campaigns */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">• Campaigns</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Current Campaigns</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Shopping Credit</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Premium Membership</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Gift Ideas</a></li>
            </ul>
          </div>

          {/* Sales */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Sales</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Shop at ShopFlow</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Basic Concepts</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">ShopFlow Academy</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Help</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Frequently Asked Questions</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Live Help / Support</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">How to Get Help</a></li>
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Business Guide</a></li>
            </ul>
          </div>

          {/* Country Change & Social */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6">Country Change</h3>
            <ul className="space-y-3 mb-8">
              <li><a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">Country Selection</a></li>
            </ul>
            
            <h4 className="text-lg font-bold text-gray-900 mb-4">Social Media</h4>
            <div className="flex space-x-3">
              <a href="#" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                <span className="text-white text-sm font-bold">f</span>
              </a>
              <a href="#" className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors">
                <span className="text-white text-sm font-bold">ig</span>
              </a>
              <a href="#" className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                <span className="text-white text-sm font-bold">yt</span>
              </a>
              <a href="#" className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors">
                <span className="text-white text-sm font-bold">x</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8 border-t border-gray-200">
          {/* Security Certificates */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Security Certificates</h4>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Shield className="h-8 w-8 text-gray-600" />
              </div>
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-bold text-xs">SSL</span>
              </div>
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-600 font-bold text-xs">CERT</span>
              </div>
            </div>
          </div>

          {/* Secure Shopping */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Secure Shopping</h4>
            <div className="flex items-center space-x-4">
              <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm">
                troy
              </div>
              <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                <span className="text-gray-700 font-bold text-xs">MC</span>
              </div>
              <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded font-bold text-sm">
                VISA
              </div>
              <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded font-bold text-sm">
                AMEX
              </div>
            </div>
          </div>

          {/* Mobile Apps */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4">Mobile Apps</h4>
            <div className="flex flex-col space-y-3">
              <a href="#" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors">
                <span className="text-sm font-medium">📱 App Store</span>
              </a>
              <a href="#" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors">
                <span className="text-sm font-medium">🤖 Google Play</span>
              </a>
              <a href="#" className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-200 transition-colors">
                <span className="text-sm font-medium">📱 AppGallery</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
          <p>©2025 ShopFlow Group. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">User Agreement</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;