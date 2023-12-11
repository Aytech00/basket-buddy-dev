import { createContext, useContext, useState } from "react";

const SearchContext = createContext();

export const useSearchContext = () => {
  return useContext(SearchContext);
};

export const SearchProvider = ({ children }) => {
  const [isSearchFocused, setSearchFocus] = useState(false);

  return (
    <SearchContext.Provider value={{ isSearchFocused, setSearchFocus }}>
      {children}
    </SearchContext.Provider>
  );
};
