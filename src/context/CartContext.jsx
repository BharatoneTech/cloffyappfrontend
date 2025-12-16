// src/context/CartContext.jsx
import React, { createContext, useState, useMemo } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  // ADD TO CART
  const addToCart = (product) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);

      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id ? { ...i, qty: i.qty + 1 } : i
        );
      }

      return [
        ...prev,
        {
          product,
          qty: 1,
          final_price:
            product.final_price != null ? product.final_price : undefined,
        },
      ];
    });
  };

  // UPDATE QUANTITY (FIXED)
  const updateQuantity = (productId, qty) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.product.id === productId
            ? { ...i, qty }
            : i
        )
        .filter((i) => i.qty > 0) // REMOVE ITEM WHEN qty = 0
    );
  };

  // REMOVE COMPLETELY
  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const clearCart = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
