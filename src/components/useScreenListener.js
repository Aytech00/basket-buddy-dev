import { useEffect, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import CartPageContext from "../lib/cartPageContext";

export default function useScreenListener(page, home) {
  const { setCartPage, cartPage } = useContext(CartPageContext);

  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      // The screen is focused
      // Call any action
      if (cartPage === true) {
        setCartPage(false);
        navigation.navigate(page);
      }
    });

    if (cartPage === true && page === "Home" && home === true) {
      setCartPage(false);
      navigation.navigate(page);
    }

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return unsubscribe;
  }, [navigation]);
}
