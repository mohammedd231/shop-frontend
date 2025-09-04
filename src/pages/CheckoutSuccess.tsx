import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Download } from 'lucide-react';

const CheckoutSuccess: React.FC = () => {
  const orderId = `ORD-${Date.now().toString().slice(-6)}`;

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="text-center">
        <div className="bg-green-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-8">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Confirmed!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for your purchase. Your order has been successfully placed.
        </p>

        <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
          </div>
          
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-semibold text-gray-900">{orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Estimated Delivery:</span>
              <span className="font-semibold text-gray-900">3-5 business days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tracking:</span>
              <span className="font-semibold text-blue-600">Available soon</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <button className="w-full flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
              <Download className="h-4 w-4" />
              <span>Download Receipt</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            <Package className="h-5 w-5" />
            <span>View Orders</span>
          </Link>
          
          <Link
            to="/"
            className="inline-flex items-center space-x-2 border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            <span>Continue Shopping</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="mt-12 bg-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">What's Next?</h3>
          <ul className="text-gray-600 space-y-2">
            <li>• You'll receive an email confirmation shortly</li>
            <li>• We'll send tracking information once your order ships</li>
            <li>• Delivery usually takes 3-5 business days</li>
            <li>• Questions? Contact our support team anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;