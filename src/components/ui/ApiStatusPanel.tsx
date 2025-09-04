import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';

const ApiStatusPanel: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const hasJwtToken = !!localStorage.getItem('jwt');

  useEffect(() => {
    // Listen for API errors
    const handleError = (event: CustomEvent) => {
      setLastError(event.detail.message);
    };

    window.addEventListener('api-error', handleError as EventListener);
    return () => window.removeEventListener('api-error', handleError as EventListener);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        title="Show API Status"
      >
        <Wifi className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">API Status</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">Base URL:</span>
          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
            {apiBaseUrl}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-gray-600">JWT Token:</span>
          <div className="flex items-center space-x-1">
            {hasJwtToken ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Present</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-red-500" />
                <span className="text-red-600">Missing</span>
              </>
            )}
          </div>
        </div>
        
        {lastError && (
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-600 font-medium">Last Error:</p>
                <p className="text-red-500 text-xs mt-1">{lastError}</p>
              </div>
            </div>
          </div>
        )}
        
        <button
          onClick={() => setLastError(null)}
          className="w-full text-xs text-gray-500 hover:text-gray-700 mt-2"
        >
          Clear Error
        </button>
      </div>
    </div>
  );
};

export default ApiStatusPanel;