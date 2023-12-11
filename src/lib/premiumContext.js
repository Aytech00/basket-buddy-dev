import React, { createContext, useState, useEffect } from "react";
import { supabase } from "./supabase";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";
export const PremiumContext = createContext();

export const PremiumProvider = ({ children }) => {
  const [premium, setPremium] = useState(false);
  const [offerings, setOfferings] = useState(null);

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.monthly)
          setOfferings(offerings);
      } catch (e) {
        console.log(e);
      }
    };

    const init = async () => {
      console.log("RUNNING");
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

      if (Platform.OS === "ios") {
        console.log("IOS");
        chases.configure({
          apiKey: "appl_BbfbiNOWyjJeXyMiYMlLlxONvvY",
        });
        getPackages();
      } else if (Platform.OS === "android") {
        console.log("IN THE DROID");
        Purchases.configure({ apiKey: "goog_ybqOmDciIMheZkNmOtjeQllGkkE" });
      }

      await loadOfferings();
    };

    init();
  }, []); // Empty dependency array ensures this useEffect runs only once, similar to componentDidMount

  // useEffect(() => {
  //   const customerInfo = async () => {
  //     try {
  //       const customerInfo = await Purchases.getCustomerInfo();
  //       console.log("CUSTOMER INFO");
  //       console.log(customerInfo.entitlements.active["basket buddy premium"]);
  //       // Check if the 'basket buddy premium' entitlement is active.
  //       if (customerInfo.entitlements.active["basket buddy premium"]) {
  //         console.log("Subscription is active");
  //         setPremium(true);
  //       } else {
  //         console.log("No active subscription");
  //         setPremium(false);
  //       }
  //     } catch (e) {
  //       // Error fetching customer info
  //       console.log("Error fetching customer info:", e);
  //     }
  //   };

  //   customerInfo();
  // }, []);

  return (
    <PremiumContext.Provider
      value={{ premium, setPremium, offerings, setOfferings }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export default PremiumContext;
