import React, { createContext, useState } from "react";

const MainHeaderContext = createContext();

export const MainHeaderProvider = ({ children }) => {
  const [showHeader, setShowHeader] = useState(true);

  return (
    <MainHeaderContext.Provider value={{ showHeader, setShowHeader }}>
      {children}
    </MainHeaderContext.Provider>
  );
};

export default MainHeaderContext;
