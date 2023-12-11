import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import Map from "../components/map";
import { supabase } from "../lib/supabase";
import PriceMatching from "../components/PriceMatching";
import MainHeaderContext from "../lib/MainHeaderContext";
import { CartContext } from "../lib/cartContext";
import RenderStores from "../components/RenderStores";

export default function StoresNearYou({ route }) {
  const bottomSheetPriceMatchingRef = useRef(null);
  bottomSheetPriceMatchingRef?.current?.present &&
    bottomSheetPriceMatchingRef?.current?.present();
  const snapPoints = useMemo(() => ["30%", "75%"], []);

  const [cartId, setCartId] = useState(route.params.cartID);
  const [stores, setStores] = useState([]);
  const [brands, setBrands] = useState([]);
  const [userLocation, setUserLocation] = useState(undefined);
  const [specificLocations, setSpecificLocations] = useState([]);
  const [distances, setDistances] = useState([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [selectedGrocery, setSelectedGrocery] = useState(null);
  const { cart } = useContext(CartContext);
  const [foundProducts, setFoundProducts] = useState([]);
  const { setShowHeader } = useContext(MainHeaderContext);
  const [subtotalsHighest, setSubtotalsHighest] = useState();
  const [subtotalsLowest, setSubtotalsLowest] = useState();
  const [userID, setUserID] = useState();
  const [filteredStores, setFilteredStores] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [highestStore, setHighestStore] = useState(0);
  const [freeSavings, setFreeSavings] = useState(0);
  const [premiumSavings, setPremiumSavings] = useState(0);

  const filteredStoresHandler = (stores) => {
    // Only update if filteredStores is null
    setFilteredStores(stores);
    setIsLoading(false);
  };

  const highestPricedStoreHandler = (val) => {
    setHighestStore(val);
  };

  const highestPrice = () => {
    return highestStore;
  };

  useEffect(() => {
    const getUserSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw new Error(error.message);
        if (data) setUserID(data.session.user.id);
      } catch (error) {
        console.log(error);
      }
    };

    getUserSession();
  }, []);

  useEffect(() => {
    setCartId(route.params.cartID);
    retrieveStores();
    return () => {
      setShowHeader(true);
    };
  }, []);

  const handleUserLocation = (location) => {
    setUserLocation(location);
  };

  const handleSubtotalHighest = (value) => {
    let highestValue = Math.max(...value);
    setSubtotalsHighest(highestValue);
  };

  const handleSpecificLocation = (coordinates) => {
    const { latitude, longitude, key, brandID } = coordinates;
    setSpecificLocations((oldArray) => [
      ...oldArray,
      { latitude, longitude, key, brandID },
    ]);
  };

  const calculateDistances = () => {
    const R = 6371; // Radius of the Earth in kilometers
    const lat1 = parseFloat(userLocation.latitude);
    const lon1 = parseFloat(userLocation.longitude);

    const calculatedDistances = specificLocations.map((location) => {
      const lat2 = parseFloat(location.latitude);
      const lon2 = parseFloat(location.longitude);

      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);

      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return { key: location.key, brandID: location.brandID, distance }; // Store distance along with store key/brandID
    });

    setDistances(calculatedDistances);
  };

  useEffect(() => {
    if (userLocation !== undefined && specificLocations.length > 0) {
      console.log("User location and specific locations are available");
      calculateDistances();
    } else {
      console.log(
        "Either user location or specific locations are not available"
      );
    }
  }, [userLocation, specificLocations]);

  useEffect(() => {
    const fetchProductPrices = async () => {
      const basketBuddyIDs = cart.map((item) => item.product.basket_buddy_id);

      // Query the database with these IDs
      try {
        const { data: products, error } = await supabase
          .from("Product")
          .select(`*`)
          .in("basket_buddy_id", basketBuddyIDs);

        if (error) throw new Error(error.message);
        if (products) setFoundProducts(products);
      } catch (error) {
        console.log(error);
      }
    };

    if (stores.length > 0 && brands.length > 0) {
      fetchProductPrices();
    }
  }, [stores, brands]);

  const handleSelectedStore = ({
    store,
    foundBrand,
    subtotal,
    productsInStore,
  }) => {
    setSelectedGrocery({ store, foundBrand, subtotal, productsInStore });
  };

  //   /*create a function that retrieves stores  */
  const retrieveStores = async () => {
    try {
      const { data: retrievedStores, error } = await supabase
        .from("Store")
        .select("*");

      if (error) throw new Error(error.message);

      if (retrievedStores) {
        setStores(retrievedStores);

        try {
          const { data: retrievedBrands, error } = await supabase
            .from("Brand")
            .select("*");

          if (error) throw new Error(error.message);
          if (retrievedBrands) setBrands(retrievedBrands);
        } catch (error) {
          console.log(error);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // renders
  return (
    <View
      className={`flex-1 ${
        showBottomSheet ? "bg-black bg-opacity-50" : "bg-white"
      }`}
    >
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Map
          stores={filteredStores}
          brands={brands}
          handleUserLocation={handleUserLocation}
          handleSpecificLocation={handleSpecificLocation}
        />
      )}

      <BottomSheetModalProvider>
        <View style={styles.container}>
          <BottomSheetModal
            ref={bottomSheetPriceMatchingRef}
            index={0}
            snapPoints={snapPoints}
            enablePanDownToClose={false}
          >
            <BottomSheetScrollView
            // contentContainerStyle={styles.contentContainer}
            >
              <RenderStores
                freeSavings={freeSavings}
                premiumSavings={premiumSavings}
                stores={stores}
                brands={brands}
                distances={distances}
                cartId={cartId}
                setCartId={setCartId}
                setShowBottomSheet={setShowBottomSheet}
                foundProducts={foundProducts}
                handleSelectedStore={handleSelectedStore}
                handleSubtotalHighest={handleSubtotalHighest}
                filteredStoresHandler={filteredStoresHandler}
                highestPricedStoreHandler={highestPricedStoreHandler}
              />
            </BottomSheetScrollView>
          </BottomSheetModal>
        </View>
      </BottomSheetModalProvider>

      {showBottomSheet && (
        <PriceMatching
          subtotal={subtotalsHighest}
          selectedGrocery={selectedGrocery}
          hightestSubtotal={highestPrice}
          foundProducts={foundProducts}
          cartId={cartId}
          ref={bottomSheetPriceMatchingRef}
          snapPoints={["80%"]}
          onClose={() => setShowBottomSheet(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  // contentContainer: {
  //   flex: 1,
  //   alignItems: "center",
  // },
});
