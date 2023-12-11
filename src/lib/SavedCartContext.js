import React, { createContext, useState } from "react";

const SavedCartContext = createContext([]);

function SavedCartProvider({ children }) {
  const [savedCart, setsavedCart] = useState([]);

  function addToSavedCart(product, quantity, price) {
    setsavedCart((prevSavedCart) => {
      const existingItemIndex = prevSavedCart.findIndex(
        (item) => item.product.basket_buddy_id === product.basket_buddy_id
      );
      if (existingItemIndex >= 0) {
        const updatedSavedCart = [...prevSavedCart];
        updatedSavedCart[existingItemIndex].quantity += quantity;
        return updatedSavedCart;
      } else {
        return [...prevSavedCart, { product, quantity, price }];
      }
    });
  }

  function removeFromsavedCart(productId) {
    const itemIndex = savedCart.findIndex(
      (item) => item.product.basket_buddy_id === productId
    );

    if (itemIndex >= 0) {
      const updatedsavedCart = [...savedCart];
      updatedsavedCart.splice(itemIndex, 1);
      setsavedCart(updatedsavedCart);
    }
  }

  function modifysavedCartItemQuantity(productId, newQuantity) {
    const existingItem = savedCart.find(
      (item) => item.product.basket_buddy_id === productId
    );

    if (existingItem) {
      const updatedsavedCart = [...savedCart];
      const itemIndex = savedCart.findIndex(
        (item) => item.product.basket_buddy_id === productId
      );
      updatedsavedCart[itemIndex].quantity = newQuantity;
      setsavedCart(updatedsavedCart);
    }
  }

  function clearsavedCart() {
    setsavedCart([]);
  }

  return (
    <SavedCartContext.Provider
      value={{
        savedCart,
        addToSavedCart,
        removeFromsavedCart,
        modifysavedCartItemQuantity,
        clearsavedCart,
      }}
    >
      {children}
    </SavedCartContext.Provider>
  );
}

export { SavedCartProvider, SavedCartContext };
