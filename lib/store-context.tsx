'use client';

import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import {
  type Product,
  type CartItem,
  type User,
  type Order,
  type Review,
  type Address,
  initialProducts,
  initialReviews,
  initialOrders,
  calculateTotalWeight,
  calculateSubtotal,
  calculateDeliveryCharge,
  generateOrderId,
} from './data';

// State Types
interface StoreState {
  products: Product[];
  cart: CartItem[];
  user: User | null;
  orders: Order[];
  reviews: Review[];
  wishlist: string[];
  isCartOpen: boolean;
  theme: 'light' | 'dark';
}

// Action Types
type StoreAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: { productId: string; selectedWeight: string } }
  | { type: 'UPDATE_CART_QUANTITY'; payload: { productId: string; selectedWeight: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER'; payload: Order }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'ADD_REVIEW'; payload: Review }
  | { type: 'UPDATE_REVIEW'; payload: Review }
  | { type: 'SET_REVIEWS'; payload: Review[] }
  | { type: 'TOGGLE_WISHLIST'; payload: string }
  | { type: 'SET_CART_OPEN'; payload: boolean }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'ADD_ADDRESS'; payload: Address }
  | { type: 'UPDATE_ADDRESS'; payload: Address }
  | { type: 'DELETE_ADDRESS'; payload: string }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_PRODUCT'; payload: Product };

// Initial State
const initialState: StoreState = {
  products: initialProducts,
  cart: [],
  user: null,
  orders: initialOrders,
  reviews: initialReviews,
  wishlist: [],
  isCartOpen: false,
  theme: 'light',
};

// Reducer
function storeReducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };

    case 'ADD_TO_CART': {
      const existingIndex = state.cart.findIndex(
        (item) => item.productId === action.payload.productId && item.selectedWeight === action.payload.selectedWeight
      );
      if (existingIndex >= 0) {
        const newCart = [...state.cart];
        newCart[existingIndex].quantity += action.payload.quantity;
        return { ...state, cart: newCart };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    }

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(
          (item) => !(item.productId === action.payload.productId && item.selectedWeight === action.payload.selectedWeight)
        ),
      };

    case 'UPDATE_CART_QUANTITY': {
      const newCart = state.cart.map((item) =>
        item.productId === action.payload.productId && item.selectedWeight === action.payload.selectedWeight
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return { ...state, cart: newCart.filter((item) => item.quantity > 0) };
    }

    case 'CLEAR_CART':
      return { ...state, cart: [] };

    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };

    case 'UPDATE_ORDER':
      return {
        ...state,
        orders: state.orders.map((order) => (order.id === action.payload.id ? action.payload : order)),
      };

    case 'SET_ORDERS':
      return { ...state, orders: action.payload };

    case 'ADD_REVIEW':
      return { ...state, reviews: [action.payload, ...state.reviews] };

    case 'UPDATE_REVIEW':
      return {
        ...state,
        reviews: state.reviews.map((review) => (review.id === action.payload.id ? action.payload : review)),
      };

    case 'SET_REVIEWS':
      return { ...state, reviews: action.payload };

    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.payload)
          ? state.wishlist.filter((id) => id !== action.payload)
          : [...state.wishlist, action.payload],
      };

    case 'SET_CART_OPEN':
      return { ...state, isCartOpen: action.payload };

    case 'SET_THEME':
      return { ...state, theme: action.payload };

    case 'ADD_ADDRESS':
      if (state.user) {
        const addresses = action.payload.isDefault
          ? state.user.addresses.map((a) => ({ ...a, isDefault: false }))
          : state.user.addresses;
        return {
          ...state,
          user: { ...state.user, addresses: [...addresses, action.payload] },
        };
      }
      return state;

    case 'UPDATE_ADDRESS':
      if (state.user) {
        let addresses = state.user.addresses.map((a) => (a.id === action.payload.id ? action.payload : a));
        if (action.payload.isDefault) {
          addresses = addresses.map((a) => (a.id === action.payload.id ? a : { ...a, isDefault: false }));
        }
        return { ...state, user: { ...state.user, addresses } };
      }
      return state;

    case 'DELETE_ADDRESS':
      if (state.user) {
        return {
          ...state,
          user: { ...state.user, addresses: state.user.addresses.filter((a) => a.id !== action.payload) },
        };
      }
      return state;

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map((p) => (p.id === action.payload.id ? action.payload : p)),
      };

    case 'DELETE_PRODUCT':
      return { ...state, products: state.products.filter((p) => p.id !== action.payload) };

    default:
      return state;
  }
}

// Context
interface StoreContextType {
  state: StoreState;
  dispatch: React.Dispatch<StoreAction>;
  // Helper functions
  addToCart: (product: Product, selectedWeight: string, quantity?: number) => void;
  removeFromCart: (productId: string, selectedWeight: string) => void;
  updateCartQuantity: (productId: string, selectedWeight: string, quantity: number) => void;
  getCartTotal: (paymentMethod: 'cod' | 'online') => { subtotal: number; deliveryCharge: number; total: number; totalWeight: number };
  getProduct: (id: string) => Product | undefined;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductReviews: (productId: string) => Review[];
  placeOrder: (paymentMethod: 'cod' | 'online', address: Address) => Promise<Order | null>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, phone: string, password: string) => Promise<boolean>;
  toggleTheme: () => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

const AUTH_TOKEN_KEY = 'kr_token';

function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const token = getAuthToken();
    const headers = new Headers(options?.headers || {});
    headers.set('Content-Type', 'application/json');
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      return null;
    }

    return response.json() as Promise<T>;
  } catch {
    return null;
  }
}

const fallbackDemoUsers: Array<User & { password: string }> = [
  {
    id: 'admin_local',
    name: 'Admin User',
    email: 'admin@kitchenrahasya.com',
    phone: '9999999999',
    role: 'admin',
    isBlocked: false,
    addresses: [],
    createdAt: new Date().toISOString(),
    password: 'admin123',
  },
  {
    id: 'demo_local',
    name: 'Demo Customer',
    email: 'demo@example.com',
    phone: '9876543210',
    role: 'customer',
    isBlocked: false,
    addresses: [],
    createdAt: new Date().toISOString(),
    password: 'demo123',
  },
];

// Provider
export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    const init = async () => {
      const savedCart = localStorage.getItem('kr_cart');
      const savedUser = localStorage.getItem('kr_user');
      const savedTheme = localStorage.getItem('kr_theme') as 'light' | 'dark' | null;

      if (savedCart) {
        const cart = JSON.parse(savedCart);
        cart.forEach((item: CartItem) => dispatch({ type: 'ADD_TO_CART', payload: item }));
      }
      if (savedUser) {
        dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
      }
      if (savedTheme) {
        dispatch({ type: 'SET_THEME', payload: savedTheme });
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }

      const productResponse = await apiRequest<{ products: Product[] }>('/api/products');
      if (productResponse?.products?.length) {
        const mergedProducts = [...initialProducts, ...productResponse.products].reduce<Product[]>((acc, product) => {
          if (!acc.some((item) => item.id === product.id)) {
            acc.push(product);
          }
          return acc;
        }, []);
        dispatch({ type: 'SET_PRODUCTS', payload: mergedProducts });
      }

      const reviewsResponse = await apiRequest<{ reviews: Review[] }>('/api/reviews');
      if (reviewsResponse?.reviews) {
        dispatch({ type: 'SET_REVIEWS', payload: reviewsResponse.reviews });
      }

      const token = getAuthToken();
      if (token && savedUser) {
        const ordersResponse = await apiRequest<{ orders: Order[] }>('/api/orders');
        if (ordersResponse?.orders) {
          dispatch({ type: 'SET_ORDERS', payload: ordersResponse.orders });
        }
      }
    };

    void init();
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('kr_cart', JSON.stringify(state.cart));
  }, [state.cart]);

  // Save user to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem('kr_user', JSON.stringify(state.user));
    } else {
      localStorage.removeItem('kr_user');
    }
  }, [state.user]);

  // Save theme to localStorage
  useEffect(() => {
    localStorage.setItem('kr_theme', state.theme);
    document.documentElement.classList.toggle('dark', state.theme === 'dark');
  }, [state.theme]);

  // Helper functions
  const addToCart = (product: Product, selectedWeight: string, quantity = 1) => {
    const priceOption = product.priceOptions.find((opt) => opt.weight === selectedWeight);
    if (priceOption) {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          productId: product.id,
          selectedWeight,
          quantity,
          pricePerUnit: priceOption.price,
          weightInGrams: priceOption.weightInGrams,
        },
      });
      dispatch({ type: 'SET_CART_OPEN', payload: true });
    }
  };

  const removeFromCart = (productId: string, selectedWeight: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { productId, selectedWeight } });
  };

  const updateCartQuantity = (productId: string, selectedWeight: string, quantity: number) => {
    dispatch({ type: 'UPDATE_CART_QUANTITY', payload: { productId, selectedWeight, quantity } });
  };

  const getCartTotal = (paymentMethod: 'cod' | 'online') => {
    const subtotal = calculateSubtotal(state.cart);
    const totalWeight = calculateTotalWeight(state.cart);
    const deliveryCharge = state.cart.length > 0 ? calculateDeliveryCharge(totalWeight, paymentMethod) : 0;
    return { subtotal, deliveryCharge, total: subtotal + deliveryCharge, totalWeight };
  };

  const getProduct = (id: string) => state.products.find((p) => p.id === id);

  const getProductBySlug = (slug: string) => state.products.find((p) => p.slug === slug);

  const getProductReviews = (productId: string) =>
    state.reviews.filter((r) => r.productId === productId && r.status === 'approved');

  const placeOrder = async (paymentMethod: 'cod' | 'online', address: Address): Promise<Order | null> => {
    if (state.cart.length === 0) return null;

    const { subtotal, deliveryCharge, total } = getCartTotal(paymentMethod);

    const remoteResponse = await apiRequest<{ order: Order }>('/api/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: state.cart,
        paymentMethod,
        address,
      }),
    });

    if (remoteResponse?.order) {
      dispatch({ type: 'ADD_ORDER', payload: remoteResponse.order });
      dispatch({ type: 'CLEAR_CART' });
      return remoteResponse.order;
    }

    const order: Order = {
      id: `order_${Date.now()}`,
      orderId: generateOrderId(),
      userId: state.user?.id || 'guest',
      items: [...state.cart],
      subtotal,
      deliveryCharge,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      orderStatus: 'pending',
      shippingAddress: address,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_ORDER', payload: order });
    dispatch({ type: 'CLEAR_CART' });

    return order;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    const response = await apiRequest<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response?.user && response.token) {
      setAuthToken(response.token);
      dispatch({ type: 'SET_USER', payload: response.user });

      const ordersResponse = await apiRequest<{ orders: Order[] }>('/api/orders');
      if (ordersResponse?.orders) {
        dispatch({ type: 'SET_ORDERS', payload: ordersResponse.orders });
      }

      return true;
    }

    const fallbackUser = fallbackDemoUsers.find(
      (user) => user.email.toLowerCase() === email.toLowerCase() && user.password === password
    );

    if (!fallbackUser) {
      return false;
    }

    const { password: _password, ...safeUser } = fallbackUser;
    setAuthToken('local-demo-token');
    dispatch({ type: 'SET_USER', payload: safeUser });
    dispatch({ type: 'SET_ORDERS', payload: initialOrders.filter((order) => order.userId === safeUser.id) });
    return true;
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_ORDERS', payload: [] });
    localStorage.removeItem('kr_user');
    setAuthToken(null);
  };

  const register = async (name: string, email: string, phone: string, password: string): Promise<boolean> => {
    const response = await apiRequest<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, phone, password }),
    });

    if (!response?.user || !response.token) {
      return false;
    }

    setAuthToken(response.token);
    dispatch({ type: 'SET_USER', payload: response.user });
    dispatch({ type: 'SET_ORDERS', payload: [] });
    return true;
  };

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'light' ? 'dark' : 'light' });
  };

  return (
    <StoreContext.Provider
      value={{
        state,
        dispatch,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        getCartTotal,
        getProduct,
        getProductBySlug,
        getProductReviews,
        placeOrder,
        login,
        logout,
        register,
        toggleTheme,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}
