import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type CartItem = {
  key: string;
  restaurantId: string;
  restaurantName: string;
  itemId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (payload: {
    restaurantId: string;
    restaurantName: string;
    itemId: number;
    name: string;
    price: number;
    imageUrl: string | null;
  }) => void;
  incrementItem: (key: string) => void;
  decrementItem: (key: string) => void;
  removeItem: (key: string) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "foodDiscovery.cart.items";

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loadStoredCart = async () => {
      try {
        const raw = await AsyncStorage.getItem(CART_STORAGE_KEY);
        if (!raw) {
          setHydrated(true);
          return;
        }

        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setItems(parsed as CartItem[]);
        }
      } catch (err) {
        console.warn("Failed to load cart from storage:", err);
      } finally {
        setHydrated(true);
      }
    };

    loadStoredCart();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const persistCart = async () => {
      try {
        await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (err) {
        console.warn("Failed to persist cart:", err);
      }
    };

    persistCart();
  }, [items, hydrated]);

  const addItem: CartContextValue["addItem"] = (payload) => {
    const key = `${payload.restaurantId}:${payload.itemId}`;
    setItems((prev) => {
      const existing = prev.find((item) => item.key === key);
      if (existing) {
        return prev.map((item) =>
          item.key === key ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...prev,
        {
          key,
          restaurantId: payload.restaurantId,
          restaurantName: payload.restaurantName,
          itemId: payload.itemId,
          name: payload.name,
          price: payload.price,
          imageUrl: payload.imageUrl,
          quantity: 1,
        },
      ];
    });
  };

  const incrementItem = (key: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.key === key ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decrementItem = (key: string) => {
    setItems((prev) =>
      prev.flatMap((item) => {
        if (item.key !== key) return [item];
        if (item.quantity <= 1) return [];
        return [{ ...item, quantity: item.quantity - 1 }];
      })
    );
  };

  const removeItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      addItem,
      incrementItem,
      decrementItem,
      removeItem,
      clearCart,
      itemCount,
      subtotal,
    }),
    [items, itemCount, subtotal]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
