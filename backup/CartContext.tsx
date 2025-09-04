import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product } from '../types';
import { cartAPI, extractErrorMessage, isConcurrencyError } from '../api/api';
import { useAuth } from './AuthContext';

interface CartState {
  items: CartItem[];
  total: number;
  count: number;
  loading: boolean;
  error?: string;
}

interface CartContextType extends CartState {
  refreshCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cartState, setCartState] = useState<CartState>({
    items: [],
    total: 0,
    count: 0,
    loading: false,
    error: undefined
  });

  const refreshCart = async (): Promise<void> => {
  if (!isAuthenticated) {
    setCartState({
      items: [],
      total: 0,
      count: 0,
      loading: false,
      error: undefined
    });
    return;
  }

  try {
    setCartState(prev => ({ ...prev, loading: true, error: undefined }));

    // Add cache buster to prevent stale data
    const cacheBuster = `?t=${Date.now()}`;
    const data = await cartAPI.get(cacheBuster); // expect { userId, items:[], total }

    const rawItems = Array.isArray(data?.items) ? data.items : [];

    const normalizedItems: CartItem[] = rawItems.map((item: any) => {
      // Safely coerce to numbers (backend decimals may arrive as strings)
      const priceNum = Number(
        item?.price ?? item?.product?.price ?? item?.unitPrice ?? 0
      );
      const qtyNum = Number(item?.quantity ?? 1);
      const lineTotalNum = Number(item?.lineTotal ?? (priceNum * qtyNum));

      // Prefer snapshot name from API; fall back to nested product/title
      const nameVal =
        item?.name ??
        item?.product?.name ??
        item?.title ??
        item?.product?.title ??
        "Unknown Product";

      const imageVal = item?.imageUrl ?? item?.product?.imageUrl ?? "";

      const product: Product = {
        id: String(item?.productId ?? item?.id ?? ""),
        name: nameVal,                     // primary
        // Provide aliases to satisfy any UI that reads these fields:
        // @ts-ignore – extend product object for compatibility
        title: nameVal,                    // alias for legacy UI
        description: item?.description ?? item?.product?.description ?? "",
        price: priceNum,                   // primary
        // @ts-ignore – alias for legacy UI
        unitPrice: priceNum,               // alias some UIs expect
        imageUrl: imageVal,
        category: item?.category ?? item?.product?.category ?? "",
        stock: Number(item?.stock ?? item?.product?.stock ?? 0),
      };

      return {
        product,
        quantity: qtyNum,
        // Some UIs might read lineTotal from item; include it on CartItem if your type supports it
        // @ts-ignore – in case CartItem doesn't define it, it's harmless for rendering
        lineTotal: lineTotalNum,
      };
    });

    const total =
      typeof data?.total === "number"
        ? data.total
        : normalizedItems.reduce(
            (sum, ci) => sum + Number(ci.product.price) * Number(ci.quantity),
            0
          );

    const count = normalizedItems.reduce((s, ci) => s + Number(ci.quantity), 0);

    setCartState({
      items: normalizedItems,
      count,
      total,
      loading: false,
      error: undefined
    });
  } catch (error) {
    const errorMessage = extractErrorMessage(error);
    setCartState(prev => ({
      ...prev,
      loading: false,
      error: errorMessage
    }));
  }
};

  const addToCart = async (productId: string, quantity: number = 1): Promise<void> => {
    const stringProductId = String(productId);
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    
    try {
      // Call the API
      await cartAPI.addItem(stringProductId, safeQuantity);
      
      // Refresh cart state after successful add
      await refreshCart();
      
    } catch (error) {
      // Handle concurrency errors gracefully
      if (isConcurrencyError(error)) {
        await refreshCart();
        return; // Treat as success
      }
      
      // For other errors, set error state and rethrow
      const errorMessage = extractErrorMessage(error);
      setCartState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      await cartAPI.removeItem(productId);
      await refreshCart();
    } catch (error) {
      console.error('🛒 Failed to remove from cart:', error);
      const errorMessage = extractErrorMessage(error);
      setCartState(prev => ({ ...prev, error: errorMessage }));
      // Don't throw - just refresh cart to sync state
      await refreshCart();
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    
    try {
      await cartAPI.removeItem(productId);
      await cartAPI.addItem(productId, quantity);
      await refreshCart();
    } catch (error) {
      console.error('🛒 Failed to update quantity:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    try {
      await cartAPI.clear();
      await refreshCart();
    } catch (error) {
      console.error('🛒 Failed to clear cart:', error);
      throw error;
    }
  };

  // Legacy methods for backward compatibility
  const getTotalPrice = () => cartState.total;
  const getTotalItems = () => cartState.count;

  // Initial cart load
  useEffect(() => {
    if (!authLoading) {
      refreshCart();
    }
  }, [isAuthenticated, authLoading]);

  return (
    <CartContext.Provider value={{
      ...cartState,
      refreshCart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      getTotalItems,
    }}>
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