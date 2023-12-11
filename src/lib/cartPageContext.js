import React, { createContext, useEffect, useState } from "react";

const CartPageContext = createContext({
  cartPage: false,
  setCartPage: () => {},
});

export const CartPageProvider = ({ children }) => {
  const [cartPage, setCartPage] = useState(false);

  useEffect(() => {
    console.log(cartPage);
  }, [cartPage]);

  return (
    <CartPageContext.Provider value={{ cartPage, setCartPage }}>
      {children}
    </CartPageContext.Provider>
  );
};

export default CartPageContext;
