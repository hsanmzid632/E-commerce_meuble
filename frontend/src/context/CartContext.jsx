// src/context/CartContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
const CartContext = createContext(null);
function readStoredCart() {
  try {
    const saved = localStorage.getItem("cart");
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(readStoredCart);
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      const maxStock = product.stock ?? existing?.stock ?? 99;
      if (existing) {
        const newQty = Math.min(existing.qty + 1, maxStock);
        return prev.map((p) =>
          p.id === product.id ? { ...p, qty: newQty } : p,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          title: product.title,
          price: Number(product.price),
          image_url: product.image_url,
          stock: product.stock ?? 99,
          qty: 1,
        },
      ];
    });
  };
  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((p) => p.id !== id));
  };
  const updateQty = (id, qty) => {
    setCart((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              qty: Math.max(1, Math.min(Number(qty) || 1, p.stock ?? 99)),
            }
          : p,
      ),
    );
  };
  const clearCart = () => setCart([]);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.qty * item.price, 0);
  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQty,
        clearCart,
      }}
    >
      {" "}
      {children}{" "}
    </CartContext.Provider>
  );
}
export function useCart() {
  return useContext(CartContext);
}
