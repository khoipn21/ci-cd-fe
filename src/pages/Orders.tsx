import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    images: string[];
  };
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
}

const Orders: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [singleOrder, setSingleOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isOrderPlaced = location.state?.orderPlaced;

  useEffect(() => {
    if (!user) return;

    if (id) {
      fetchSingleOrder();
    } else {
      fetchOrders();
    }
  }, [user, id]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/my-orders');
      setOrders(response.data.orders);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setSingleOrder(response.data.order);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Order not found');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to view your orders.</p>
        <Link
          to="/login"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300"
        >
          Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link
          to="/orders"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  // Single Order View
  if (id && singleOrder) {
    return (
      <div className="max-w-4xl mx-auto">
        {isOrderPlaced && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Order placed successfully!</span>
            </div>
            <p className="mt-2">Thank you for your order. We'll process it shortly.</p>
          </div>
        )}

        <div className="mb-6">
          <Link
            to="/orders"
            className="text-blue-600 hover:text-blue-800 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Orders
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold">Order #{singleOrder.orderNumber}</h1>
            <p className="text-gray-600">Placed on {new Date(singleOrder.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Order Status */}
            <div>
              <h3 className="font-semibold mb-2">Order Status</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                singleOrder.status === 'delivered' ? 'bg-green-100 text-green-800' :
                singleOrder.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                singleOrder.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                singleOrder.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {singleOrder.status.charAt(0).toUpperCase() + singleOrder.status.slice(1)}
              </span>
            </div>

            {/* Payment Status */}
            <div>
              <h3 className="font-semibold mb-2">Payment Status</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                singleOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                singleOrder.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {singleOrder.paymentStatus.charAt(0).toUpperCase() + singleOrder.paymentStatus.slice(1)}
              </span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <div className="text-gray-700">
              <p>{singleOrder.shippingAddress.name}</p>
              <p>{singleOrder.shippingAddress.street}</p>
              <p>{singleOrder.shippingAddress.city}, {singleOrder.shippingAddress.state} {singleOrder.shippingAddress.zipCode}</p>
              <p>{singleOrder.shippingAddress.country}</p>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold mb-4">Order Items</h3>
            <div className="space-y-4">
              {singleOrder.items.map((item) => (
                <div key={item._id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded">
                  <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                    {item.product.images?.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-xl">📦</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.name}</h4>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-600">Price: ${item.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount:</span>
              <span className="text-2xl font-bold text-blue-600">${singleOrder.totalAmount.toFixed(2)}</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              Payment Method: {singleOrder.paymentMethod.replace('_', ' ').toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Orders List View
  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Orders Yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
          <Link
            to="/products"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition duration-300"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                  <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-600">${order.totalAmount.toFixed(2)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-4">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item._id} className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center overflow-hidden">
                    {item.product.images?.length > 0 ? (
                      <img
                        src={item.product.images[0]}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-xl">📦</div>
                    )}
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="text-gray-600">
                    +{order.items.length - 3} more items
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Link
                  to={`/orders/${order._id}`}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;