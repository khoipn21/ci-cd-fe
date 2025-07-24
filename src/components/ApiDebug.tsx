import React, { useState } from 'react';
import api from '../utils/api';

const ApiDebug: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (title: string, data: any, error?: any) => {
    setResults(prev => [...prev, {
      timestamp: new Date().toISOString(),
      title,
      data,
      error,
      success: !error
    }]);
  };

  const testHealth = async () => {
    setLoading(true);
    try {
      const response = await api.get('/health');
      addResult('Health Check', response.data);
    } catch (error: any) {
      addResult('Health Check', null, error.response?.data || error.message);
    }
    setLoading(false);
  };

  const testLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: 'admin@webshop.com',
        password: 'admin123'
      });
      addResult('Login', response.data);
      // Store token
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    } catch (error: any) {
      addResult('Login', null, error.response?.data || error.message);
    }
    setLoading(false);
  };

  const testCart = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cart');
      addResult('Get Cart', response.data);
    } catch (error: any) {
      addResult('Get Cart', null, error.response?.data || error.message);
    }
    setLoading(false);
  };

  const testAddToCart = async () => {
    setLoading(true);
    try {
      const response = await api.post('/cart/add', {
        productId: '68823f1d089bb087185aa803',
        quantity: 1
      });
      addResult('Add to Cart', response.data);
    } catch (error: any) {
      addResult('Add to Cart', null, error.response?.data || error.message);
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const clearToken = () => {
    localStorage.removeItem('token');
    addResult('Clear Token', 'Token removed from localStorage');
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">API Debug Panel</h1>
      
      <div className="mb-6 space-x-2">
        <button
          onClick={testHealth}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          Test Health
        </button>
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          Test Login
        </button>
        <button
          onClick={testCart}
          disabled={loading}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Test Get Cart
        </button>
        <button
          onClick={testAddToCart}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          Test Add to Cart
        </button>
        <button
          onClick={clearToken}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Clear Token
        </button>
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Current Token:</h3>
          <p className="text-sm text-gray-600 break-all">
            {localStorage.getItem('token') || 'No token stored'}
          </p>
        </div>

        {results.map((result, index) => (
          <div
            key={index}
            className={`p-4 rounded shadow ${
              result.success ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{result.title}</h3>
              <span className="text-xs text-gray-500">{new Date(result.timestamp).toLocaleTimeString()}</span>
            </div>
            
            {result.success ? (
              <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            ) : (
              <div className="text-red-600">
                <p className="font-semibold">Error:</p>
                <pre className="text-sm bg-red-100 p-2 rounded overflow-auto">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiDebug;