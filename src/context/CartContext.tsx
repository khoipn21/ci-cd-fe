import React, { createContext, useContext, useReducer, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from './AuthContext';

interface Product {
  _id: string;
  name: string;
  price: number;
  images: string[];
  brand: string;
  stock: number;
}

interface CartItem {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
}

interface CartState {
  items: CartItem[];
  totalAmount: number;
  loading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_CART'; payload: { items: CartItem[]; totalAmount: number } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  totalAmount: 0,
  loading: false,
  error: null,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_CART':
      return { 
        ...state, 
        items: action.payload.items, 
        totalAmount: action.payload.totalAmount,
        loading: false,
        error: null 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'CLEAR_CART':
      return { ...state, items: [], totalAmount: 0 };
    default:
      return state;
  }
};

interface CartContextType extends CartState {
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateCartItem: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  clearError: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, token } = useAuth();

  useEffect(() => {
    if (user && token) {
      fetchCart();
    } else {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [user, token]);

  const fetchCart = async () => {
    if (!token) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.get('/cart');
      dispatch({
        type: 'SET_CART',
        payload: {
          items: response.data.cart.items,
          totalAmount: response.data.cart.totalAmount,
        },
      });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.error || 'Failed to fetch cart',
      });
    }
  };

  const addToCart = async (productId: string, quantity = 1) => {
    if (!token) {
      dispatch({ type: 'SET_ERROR', payload: 'Please login to add items to cart' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.post('/cart/add', {
        productId,
        quantity,
      });
      dispatch({
        type: 'SET_CART',
        payload: {
          items: response.data.cart.items,
          totalAmount: response.data.cart.totalAmount,
        },
      });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.error || 'Failed to add item to cart',
      });
      throw error;
    }
  };

  const updateCartItem = async (productId: string, quantity: number) => {
    if (!token) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.put('/cart/update', {
        productId,
        quantity,
      });
      dispatch({
        type: 'SET_CART',
        payload: {
          items: response.data.cart.items,
          totalAmount: response.data.cart.totalAmount,
        },
      });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.error || 'Failed to update cart item',
      });
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    if (!token) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await api.delete(`/cart/remove/${productId}`);
      dispatch({
        type: 'SET_CART',
        payload: {
          items: response.data.cart.items,
          totalAmount: response.data.cart.totalAmount,
        },
      });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.error || 'Failed to remove item from cart',
      });
      throw error;
    }
  };

  const clearCart = async () => {
    if (!token) return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await api.delete('/cart/clear');
      dispatch({ type: 'CLEAR_CART' });
    } catch (error: any) {
      dispatch({
        type: 'SET_ERROR',
        payload: error.response?.data?.error || 'Failed to clear cart',
      });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        fetchCart,
        addToCart,
        updateCartItem,
        removeFromCart,
        clearCart,
        clearError,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};