import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

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

const CART_STORAGE_KEY = '@rastreagro:cart';

export function CartProvider({ children }: CartProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Carrega carrinho do usuário quando faz login ou muda de usuário
  useEffect(() => {
    async function loadCart() {
      if (!isAuthenticated || !user?.id) {
        // Se não está autenticado, limpa o carrinho
        setItems([]);
        setIsInitialized(true);
        return;
      }

      // Não carrega se estiver salvando
      if (isSaving) return;

      try {
        const storageKey = `${CART_STORAGE_KEY}_${user.id}`;
        const storedCart = await AsyncStorage.getItem(storageKey);
        if (storedCart) {
          const parsedCart = JSON.parse(storedCart);
          setItems(parsedCart);
          console.log(`🛒 Carrinho carregado para usuário ${user.id}:`, parsedCart.length, 'itens');
        } else {
          setItems([]);
          console.log(`🛒 Carrinho vazio para usuário ${user.id}`);
        }
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
        setItems([]);
      } finally {
        setIsInitialized(true);
      }
    }

    loadCart();
  }, [user?.id, isAuthenticated]);

  // Salva carrinho no AsyncStorage sempre que mudar (com debounce)
  useEffect(() => {
    if (!isInitialized || !isAuthenticated || !user?.id || isSaving) return;

    const timeoutId = setTimeout(async () => {
      setIsSaving(true);
      try {
        const storageKey = `${CART_STORAGE_KEY}_${user.id}`;
        await AsyncStorage.setItem(storageKey, JSON.stringify(items));
        console.log(`🛒 Carrinho salvo para usuário ${user.id}:`, items.length, 'itens');
      } catch (error) {
        console.error('Erro ao salvar carrinho:', error);
      } finally {
        setIsSaving(false);
      }
    }, 300); // Debounce de 300ms

    return () => clearTimeout(timeoutId);
  }, [items, user?.id, isAuthenticated, isInitialized]);

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
    console.log('🛒 removeItem chamado com ID:', itemId);
    setItems(currentItems => {
      const filtered = currentItems.filter(item => item.id !== itemId);
      console.log('🛒 Itens antes:', currentItems.length, 'Itens depois:', filtered.length);
      console.log('🛒 IDs removidos:', itemId);
      console.log('🛒 IDs restantes:', filtered.map(i => i.id));
      return filtered;
    });
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
    console.log('🛒 clearCart chamado');
    setItems([]);
    console.log('🛒 Carrinho limpo - estado atualizado');
  }

  // Limpa carrinho quando usuário faz logout
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setItems([]);
      setIsInitialized(false);
    }
  }, [isAuthenticated, user]);

  // Sempre renderiza, mas com carrinho vazio até inicializar
  // Isso evita tela em branco durante o carregamento
  return (
    <CartContext.Provider
      value={{
        items: isInitialized ? items : [],
        itemCount: isInitialized ? itemCount : 0,
        subtotal: isInitialized ? subtotal : 0,
        shippingCost: isInitialized ? shippingCost : 0,
        total: isInitialized ? total : 0,
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
