'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '@/Shared/types';
import { useToast } from '@/Frontend/components/ui/Toast';

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const toast = useToast();

  // Load from local storage on mount and sync with server
  useEffect(() => {
    const storedCart = localStorage.getItem('nora_cart');
    let initialItems: CartItem[] = [];
    if (storedCart) {
      try {
        initialItems = JSON.parse(storedCart);
        setItems(initialItems);
      } catch (e) {
        console.error('Failed to parse cart from local storage', e);
      }
    }
    
    // Sync with server to clean invalid items and get DB cart if logged in
    fetch('/api/cart/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: initialItems })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setItems(data.items);
          if (data.removedItems && data.removedItems.length > 0) {
            setTimeout(() => {
              toast.error(`Sản phẩm không hợp lệ đã bị xóa: ${data.removedItems.join(', ')}`);
            }, 1000);
          }
        }
      })
      .catch(console.error)
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  // Save to local storage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('nora_cart', JSON.stringify(items));
      // Optionally sync to server on every change if logged in
      fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      }).catch(console.error);
    }
  }, [items, isLoaded]);

  const addItem = (newItem: CartItem) => {
    const existingItemIndex = items.findIndex(
      (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
    );

    if (existingItemIndex !== -1) {
      // Item exists, update quantity
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      
      const newQuantity = existingItem.quantity + newItem.quantity;
      
      // Don't exceed max stock
      if (newQuantity > existingItem.maxStock) {
        toast.error(`Chỉ còn ${existingItem.maxStock} sản phẩm trong kho`);
        updatedItems[existingItemIndex] = { ...existingItem, quantity: existingItem.maxStock };
      } else {
        updatedItems[existingItemIndex] = { ...existingItem, quantity: newQuantity };
        toast.success('Đã thêm vào giỏ hàng');
      }
      
      setItems(updatedItems);
    } else {
      // New item
      const finalItem = { ...newItem };
      if (finalItem.quantity > finalItem.maxStock) {
        toast.error(`Chỉ còn ${finalItem.maxStock} sản phẩm trong kho`);
        finalItem.quantity = finalItem.maxStock;
      } else {
        toast.success('Đã thêm vào giỏ hàng');
      }
      setItems([...items, finalItem]);
    }
  };

  const removeItem = (productId: string, variantId?: string) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const updateQuantity = (productId: string, variantId: string | undefined, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    const updatedItems = items.map((item) => {
      if (item.productId === productId && item.variantId === variantId) {
        const validQuantity = Math.min(quantity, item.maxStock);
        if (quantity > item.maxStock) {
          toast.warning(`Chỉ còn ${item.maxStock} sản phẩm trong kho`);
        }
        return { ...item, quantity: validQuantity };
      }
      return item;
    });
    
    setItems(updatedItems);
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
