import React, { useState, useEffect } from 'react';
import { Search, Package, MapPin, Calendar, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { ordersAPI } from '../../api/api';
import { Order } from '../../types';
import { products as mockProducts } from '../../data/mockData';
import { productsAPI } from '../../api/products';
import { isAdmin } from '../../utils/auth';

const OrdersAdmin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setError(null);
        const ordersData = await ordersAPI.getAll();
        setOrders(ordersData);
      } catch (error) {
        console.error('Failed to load orders:', error);
        setError('Failed to load orders from API');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleImportSampleProducts = async () => {
    if (!isAdmin()) {
      setImportStatus({
        show: true,
        message: 'Admin access required to import products',
        type: 'error'
      });
      return;
    }

    setImporting(true);
    setImportStatus({
      show: true,
      message: 'Starting import of sample products...',
      type: 'info'
    });

    try {
      const results = await productsAPI.bulkCreateProducts(mockProducts);
      
      let message = `Import complete! Created: ${results.created}, Skipped: ${results.skipped}`;
      if (results.errors.length > 0) {
        message += `. Errors: ${results.errors.length}`;
      }

      setImportStatus({
        show: true,
        message,
        type: results.errors.length > 0 ? 'error' : 'success'
      });
    } catch (error) {
      console.error('Import failed:', error);
      setImportStatus({
        show: true,
        message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}. Make sure you're logged in as Admin and the API is running.`,
        type: 'error'
      });
    } finally {
      setImporting(false);
      // Auto-hide status after 5 seconds
      setTimeout(() => {
        setImportStatus(prev => ({ ...prev, show: false }));
      }, 5000);
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await ordersAPI.updateStatus(orderId, newStatus);
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus as Order['status'] } : order
      ));
    } catch (error) {
      console.error('Failed to update order status:', error);
      setError('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const statusOptions = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        {isAdmin() && (
          <button
            onClick={handleImportSampleProducts}
            disabled={importing}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Importing...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <span>Import Sample Products</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Import Status */}
      {importStatus.show && (
        <div className={`mb-6 p-4 rounded-lg border flex items-start space-x-3 ${
          importStatus.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          importStatus.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          {importStatus.type === 'success' && <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
          {importStatus.type === 'error' && <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />}
          {importStatus.type === 'info' && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mt-0.5 flex-shrink-0"></div>}
          <div>
            <p className="font-medium">{importStatus.message}</p>
          </div>
          <button
            onClick={() => setImportStatus(prev => ({ ...prev, show: false }))}
            className="ml-auto text-current hover:opacity-70"
          >
            ×
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-8">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
        >
          <option value="all">All Statuses</option>
          {statusOptions.map(status => (
            <option key={status} value={status.toLowerCase()}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Orders */}
      <div className="space-y-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Order Header */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <Package className="h-8 w-8 text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Order #{order.id}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <span>User ID: {order.userId}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(order.status)}`}
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <span className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Order Details */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {order.items.map(item => (
                      <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">Qty: {item.quantity} × ${item.product.price.toFixed(2)}</p>
                        </div>
                        <span className="font-semibold text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress && (
                  <div>
                    <div className="flex items-center space-x-2 mb-4">
                      <MapPin className="h-5 w-5 text-gray-600" />
                      <h4 className="font-semibold text-gray-900">Shipping Address</h4>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-gray-900 space-y-1">
                        <p>{order.shippingAddress.street}</p>
                        <p>
                          {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}
                        </p>
                        <p>{order.shippingAddress.country}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && !loading && (
        <div className="text-center py-16">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h2>
          <p className="text-gray-600">
            {orders.length === 0 
              ? 'No orders available yet' 
              : 'No orders match your current filters'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersAdmin;