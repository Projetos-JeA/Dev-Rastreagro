import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
  freeShipping: boolean;
}

interface CartContextData {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  shippingCost: number;
  total: number;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [items, setItems] = useState<CartItem[]>([]);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const shippingCost = items.every(item => item.freeShipping) ? 0 : 3500;

  const total = subtotal + shippingCost;

  function addItem(newItem: Omit<CartItem, 'quantity'>) {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === newItem.id);

      if (existingItem) {
        return currentItems.map(item =>
          item.id === newItem.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
      }

      return [...currentItems, { ...newItem, quantity: 1 }];
    });
  }

  function removeItem(itemId: string) {
    setItems(currentItems => currentItems.filter(item => item.id !== itemId));
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(currentItems =>
      currentItems.map(item =>
        item.id === itemId
          ? { ...item, quantity: Math.min(quantity, item.stock) }
          : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        shippingCost,
        total,
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

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
