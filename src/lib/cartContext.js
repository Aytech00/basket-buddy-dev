import React, { createContext, useState, useEffect } from "react";

const CartContext = createContext([]);

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  function addToCart(product, quantity, price) {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.basket_buddy_id === product.basket_buddy_id
      );

      if (existingItemIndex >= 0) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        return [...prevCart, { product, quantity, price }];
      }
    });
  }

  function removeFromCart(productId) {
    const itemIndex = cart.findIndex(
      (item) => item.product.basket_buddy_id === productId
    );

    if (itemIndex >= 0) {
      const updatedCart = [...cart];
      updatedCart.splice(itemIndex, 1);
      setCart(updatedCart);
    }
  }

  function modifyCartItemQuantity(productId, newQuantity) {
    const existingItem = cart.find(
      (item) => item.product.basket_buddy_id === productId
    );

    if (existingItem) {
      const updatedCart = [...cart];
      const itemIndex = cart.findIndex(
        (item) => item.product.basket_buddy_id === productId
      );
      updatedCart[itemIndex].quantity = newQuantity;
      setCart(updatedCart);
    }
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        modifyCartItemQuantity,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export { CartProvider, CartContext };
