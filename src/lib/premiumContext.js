import React, { createContext, useState, useEffect } from "react";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";
const PremiumContext = createContext();

const ENTITLEMENT_ID = "basketBuddyPremium";

const PremiumProvider = ({ children }) => {
  const [premium, setPremium] = useState(false);
  const [offerings, setOfferings] = useState(null);

  const customerInfo = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();

      if (
        typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !== "undefined"
      )
        setPremium(true);
      else setPremium(false);
    } catch (e) {
      console.log("Error fetching customer info:", e);
    }
  };

  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings.current && offerings.current.monthly) {
          setOfferings(offerings);

          await customerInfo();
        }
      } catch (e) {
        console.log(e);
      }
    };

    const init = async () => {
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

      if (Platform.OS === "ios")
        Purchases.configure({
          apiKey: "appl_BbfbiNOWyjJeXyMiYMlLlxONvvY",
        });
      else if (Platform.OS === "android")
        Purchases.configure({ apiKey: "goog_ybqOmDciIMheZkNmOtjeQllGkkE" });

      await loadOfferings();
    };

    init();
  }, []); // Empty dependency array ensures this useEffect runs only once, similar to componentDidMount

  useEffect(() => {
    Purchases.addCustomerInfoUpdateListener(customerInfo);

    return () => {
      Purchases.removeCustomerInfoUpdateListener();
    };
  }, []);

  return (
    <PremiumContext.Provider
      value={{ premium, setPremium, offerings, setOfferings }}
    >
      {children}
    </PremiumContext.Provider>
  );
};

export { PremiumContext, PremiumProvider };
