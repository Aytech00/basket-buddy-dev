import React, { useState, useEffect, useRef, useContext } from "react";
import { ScrollView, View, Image, TouchableOpacity } from "react-native";
import Text from "../components/ui/Text";
import { Button, Icon } from "@rneui/base";
import * as Linking from "expo-linking";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import MainHeaderContext from "../lib/MainHeaderContext";
import { CartContext } from "../lib/cartContext";
import { PremiumContext } from "../lib/PremiumContext";
import { useNavigation } from "@react-navigation/native";
import ViewPrices from "../components/ViewPrices";
import CartDisplay from "../components/cartDisplay";
import SelectDropdown from "react-native-select-dropdown";
import WelcomeModal from "../components/WelcomeModal";

const RenderStores = ({
  stores,
  brands,
  distances,
  filteredStoresHandler,
  setShowBottomSheet,
  foundProducts,
  handleSelectedStore,
  handleSubtotalHighest,
  highestPricedStoreHandler,
  freeSavings,
  premiumSavings,
  cartId,
}) => {
  const [showViewPrices, setShowViewPrices] = useState(false);
  const viewPricesSheetRef = useRef(null);
  const snapPoints = ["70%"];
  const { cart } = useContext(CartContext);
  const { premium } = useContext(PremiumContext);
  const [sortOption, setSortOption] = useState("Cheapest");
  const [highestSubtotal, setHighestSubtotal] = useState(0);
  const { setShowHeader } = useContext(MainHeaderContext);
  const [modalVisible, setModalVisible] = useState(true);
  const [filteredAndSortedStores, setFilteredAndSortedStores] = useState([]);
  const [productPrices, setProductPrices] = useState([]);
  const [lowestStorePrice, setLowestStorePrice] = useState([]);
  const [lowestPricedItems, setLowestPriceItems] = useState();
  const [lowestProducts, setLowestProducts] = useState();
  const navigation = useNavigation();

  const closeModal = () => {
    setModalVisible(false);
  };

  const handleClose = () => {
    setShowViewPrices(false);
  };

  const data = ["Cheapest", "Closest"];

  const productQuantity = (product_basket_buddy_id) => {
    let quantity = 0; // Initialize to 0 or another suitable default value
    const filteredProducts = cart.filter(
      (item) => item.product.basket_buddy_id === product_basket_buddy_id
    );

    if (filteredProducts.length > 0 && filteredProducts[0].quantity) {
      quantity = filteredProducts[0].quantity;
    }

    return quantity;
  };

  const calculatePrices = (product) => {
    const product_amount = product.multi_amount;

    const individual_price = parseFloat(
      product.individual_price.replace("$", "")
    );
    let multi_under = product.multi_under
      ? parseFloat(product.multi_under.replace("$", ""))
      : individual_price;
    let multi_over = product.multi_over
      ? parseFloat(product.multi_over.replace("$", ""))
      : individual_price;
    let quantity = productQuantity(product.basket_buddy_id);
    if (product_amount == null) {
      return (price = individual_price * quantity);
    } else if (product_amount > 0) {
      if (quantity <= product_amount) {
        return (price = multi_under * quantity);
      } else if (quantity > product_amount) {
        return (price =
          multi_under * product.multi_amount +
          multi_over * (quantity - product.multi_amount));
      }
    }
  };

  const productsByStore = foundProducts.reduce((acc, product) => {
    if (!acc[product.store_id]) {
      acc[product.store_id] = [];
    }
    acc[product.store_id].push(product);
    return acc;
  }, {});

  const calculateTotalPriceForStore = (storeId) => {
    const productsInStore = productsByStore[storeId] || [];
    let total = 0;
    let newProductPrices = [];

    productsInStore.forEach((product) => {
      let quantity = productQuantity(product.basket_buddy_id);
      let price = calculatePrices(product) * quantity; // Calculate price factoring in quantity
      total += price;
      newProductPrices.push({ product, quantity, price }); // Include product, quantity, and price in the array
    });

    setProductPrices(newProductPrices); // Set the state outside of the loop
    return { total, productsInStore };
  };

  //filter out stores who don't have the same products
  const isStoreComplete = (storeId) => {
    const productsInStore = productsByStore[storeId] || [];
    const basketBuddyIds = foundProducts.map(
      (product) => product.basket_buddy_id
    );

    return basketBuddyIds.every((basketBuddyId) => {
      return productsInStore.some(
        (product) => product.basket_buddy_id === basketBuddyId
      );
    });
  };

  useEffect(() => {
    const completeStores = stores.filter((store) => isStoreComplete(store.id));

    const sortedStores = completeStores
      .filter((store) => isStoreComplete(store.id))
      .sort((a, b) => {
        const { total: totalA } = calculateTotalPriceForStore(a.id);
        const { total: totalB } = calculateTotalPriceForStore(b.id);
        const distanceA = distances.find(
          (item) => item.key === a.key || item.brandID === a.brand_id
        )?.distance;
        const distanceB = distances.find(
          (item) => item.key === b.key || item.brandID === b.brand_id
        )?.distance;

        // If totalA is 0 (unavailable), it should be sorted lower than any available store
        if (totalA === 0) return 1;

        // If totalB is 0 (unavailable), it should be sorted lower than any available store
        if (totalB === 0) return -1;

        if (sortOption === "Cheapest") {
          return totalA - totalB;
        } else if (sortOption === "Closest") {
          return distanceA - distanceB;
        }
      });
    setFilteredAndSortedStores(sortedStores);
  }, [stores, foundProducts, sortOption]);

  useEffect(() => {
    filteredStoresHandler(filteredAndSortedStores);
  }, [filteredAndSortedStores]);

  useEffect(() => {
    const newSubtotalsHighest = filteredAndSortedStores.map((store) =>
      calculateTotalPriceForStore(store.id)
    );

    // Find the highest subtotal
    const maxSubtotal = Math.max(
      ...newSubtotalsHighest.map((store) => store.total)
    );

    //the amount of brands = 5 for now
    if (newSubtotalsHighest.length >= 5) {
      handleSubtotalHighest(newSubtotalsHighest);
      setHighestSubtotal(maxSubtotal);
    }
  }, [stores, foundProducts, sortOption]);

  useEffect(() => {
    highestPricedStoreHandler(highestSubtotal);
  }, [highestSubtotal]);

  const subtotals = filteredAndSortedStores.map((store) => {
    const productsInStore = productsByStore[store.id] || [];

    return productsInStore.reduce((subtotal, product) => {
      return subtotal + calculatePrices(product);
    }, 0);
  });

  const lowestSubtotal = Math.min(...subtotals);

  useEffect(() => {
    setLowestStorePrice(lowestSubtotal);
  }, [lowestSubtotal]);

  useEffect(() => {
    let productsMIN = 0;
    cart.map((product) => {
      productsMIN += product.price?.min * product?.quantity;
    });
    // console.log(productsMIN);
    setLowestPriceItems(productsMIN);
  }, []);

  useEffect(() => {
    // console.log(lowestPricedItems);
  }, [lowestPricedItems]);

  // useEffect(() => {
  //   const lowestPricePerItem = [];
  //   let selectedGroceries = [];

  //   filteredAndSortedStores?.map((store, index) => {
  //     const subtotal = subtotals[index];
  //     const foundBrand = brands?.find((brand) => brand.id === store.brand_id);
  //     // console.log("foundBrand", store);

  //     selectedGroceries = [
  //       ...selectedGroceries,
  //       {
  //         store,
  //         foundBrand,
  //         subtotal,
  //         productsInStore: calculateTotalPriceForStore(store.id)
  //           ?.productsInStore,
  //       },
  //     ];
  //   });

  //   // Iterate over each item in the cart
  //   for (const cartItem of cart) {
  //     selectedGroceries?.map((grocery) => {
  //       // Ensure the selected grocery store and its products are available
  //       if (grocery && grocery?.productsInStore) {
  //         const productsInStore = grocery?.productsInStore;

  //         // Check if the product exists in the selected store
  //         const productInStore = productsInStore?.find(
  //           (product) =>
  //             product.basket_buddy_id === cartItem.product.basket_buddy_id
  //         );

  //         // If the product doesn't exist in the store, skip the rest of the loop
  //         if (productInStore) {
  //           // Find all products in props.foundProducts that match the cart item's name
  //           const matchingProducts = foundProducts.filter(
  //             (product) =>
  //               product.basket_buddy_id === cartItem.product.basket_buddy_id
  //           );

  //           // Find the product with the lowest price among the matching products
  //           let lowestPriceProduct = null;
  //           let lowestPrice = Infinity;
  //           for (const product of matchingProducts) {
  //             const price = parseFloat(
  //               product.individual_price.replace("$", "")
  //             );
  //             if (price < lowestPrice) {
  //               lowestPrice = price;
  //               lowestPriceProduct = product;
  //             }
  //           }
  //           // Add the lowest price product to the lowestPricePerItem array
  //           lowestPricePerItem.push(lowestPriceProduct);
  //         }
  //       }
  //     });
  //   }

  //   setLowestProducts(lowestPricePerItem);
  //   const productsByStore = lowestPricePerItem.reduce((acc, product) => {
  //     if (!acc[product.store_id]) {
  //       acc[product.store_id] = [];
  //     }
  //     acc[product.store_id].push(product);
  //     return acc;
  //   }, {});
  //   console.log("productsByStore", productsByStore);
  // }, [cart, foundProducts, filteredAndSortedStores]);

  // console.log("lowestProducts", lowestProducts);

  return (
    <ScrollView>
      {premium ? null : (
        <WelcomeModal
          visible={modalVisible}
          onClose={closeModal}
          productPrices={productPrices}
          highestPriceStore={highestSubtotal}
          freeSavings={freeSavings}
          premiumSavings={premiumSavings}
          lowestStorePrice={lowestStorePrice}
          lowestPricedProducts={lowestPricedItems}
        />
      )}
      <View className="p-5 w-full ">
        <Text
          fontType={"Nunito-ExtraBold"}
          className="text-3xl font-bold text-center m-5"
        >
          Stores Near You
        </Text>

        <Text fontType={"Nunito-Italic"} className="text-gray-500 text-center">
          Click on store to start price matching
        </Text>
      </View>

      <View className="flex flex-row justify-between items-center p-2 ">
        <Text>
          {
            filteredAndSortedStores.filter((store) => store.subtotal !== 0)
              .length
          }{" "}
          relevant results
        </Text>
        <View className="flex flex-row items-center ">
          <Text>Sorting by</Text>
          <SelectDropdown
            data={data}
            defaultValueByIndex={0}
            buttonStyle={{ backgroundColor: "#fff", width: 100, height: 20 }}
            buttonTextStyle={{
              fontSize: 14,
              color: "#000",
              fontFamily: "Nunito-ExtraBold",
            }}
            onSelect={(selectedItem, index) => {
              setSortOption(selectedItem);
            }}
            buttonTextAfterSelection={(selectedItem, index) => {
              // text represented after item is selected
              // if data array is an array of objects then return selectedItem.property to render after item is selected
              return selectedItem;
            }}
            rowTextForSelection={(item, index) => {
              // text represented for each item in dropdown
              // if data array is an array of objects then return item.property to represent item in dropdown
              return item;
            }}
          />
          <Icon name="chevron-down" type="entypo" size={12} />
        </View>
      </View>

      {/* Grocery store list */}
      <View className="">
        {filteredAndSortedStores.map((store, index) => {
          const subtotal = subtotals[index];
          const foundBrand = brands.find(
            (brand) => brand.id === store.brand_id
          );

          if (foundBrand) {
            return (
              <TouchableOpacity
                onPress={() => {
                  const { productsInStore } = calculateTotalPriceForStore(
                    store.id
                  );
                  handleSelectedStore({
                    store,
                    foundBrand,
                    subtotal,
                    productsInStore,
                  });
                  setShowBottomSheet(true);
                }}
                key={store.id}
              >
                {subtotal === 0 ? null : (
                  <View className={`flex flex-row m-2 `} key={store.id}>
                    <View className="w-1/4 h-100">
                      {foundBrand.image_url ? (
                        <Image
                          source={{ uri: foundBrand.image_url }}
                          className="aspect-square w-full h-auto rounded "
                          resizeMode="contain"
                        />
                      ) : (
                        <></>
                      )}
                    </View>

                    <View className=" w-2/4 pl-2">
                      <Text fontType="Nunito-ExtraBold">
                        {foundBrand.name} •{" "}
                        <Text className="text-xs">
                          <Text className="text-xs">
                            {(() => {
                              if (!distances)
                                return (
                                  <>
                                    <Text>Loading...</Text>
                                  </>
                                );

                              const distanceItem = distances.find(
                                (item) =>
                                  item.key === store.key ||
                                  item.brandID === store.brand_id
                              );

                              return distanceItem &&
                                distanceItem.distance !== undefined
                                ? distanceItem.distance.toFixed(2) + " km away"
                                : "Loading...";
                            })()}
                          </Text>
                        </Text>
                      </Text>
                      <Text fontType="Nunito">
                        {store.address}, {store.city}, {store.state}
                      </Text>
                      <Text
                        fontType="Nunito-ExtraBold"
                        className={`text-sm ${
                          subtotal == 0 ? `text-yellow-500` : `text-[#6ECB33]`
                        } `}
                      >
                        {subtotal === 0 ? (
                          <Text>Unavailable</Text>
                        ) : (
                          <Text>
                            $
                            {premium
                              ? lowestPricedItems?.toFixed(2)
                              : subtotal?.toFixed(2)}{" "}
                          </Text>
                        )}
                      </Text>
                    </View>

                    <View className="flex  justify-center text-center w-1/4 ">
                      <Button
                        onPress={() => {
                          Linking.openURL(
                            `https://www.google.com/maps/search/?api=1&query=${store.address}, ${store.city}, ${store.country}`
                          );
                        }}
                        color="#313131"
                        containerStyle={{
                          height: 25,
                          borderRadius: 2,
                          paddingLeft: 3,
                          paddingVertical: 3,
                          width: "100%",
                          backgroundColor: "black",
                          display: "flex",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          marginLeft: "auto",
                          marginRight: "auto",
                        }}
                      >
                        <Icon
                          color="#fff"
                          name="location-pin"
                          type="entypo"
                          size={12}
                        />
                        <Text
                          fontType={"Nunito-Bold"}
                          className="text-white text-xs h-5 ml-1 mt-1 "
                          style={{ marginLeft: "-1%" }}
                        >
                          Directions
                        </Text>
                      </Button>

                      {/* PREMIYUM */}
                      {/* {premium === true ? 
                    <View className={`mt-5 `}>
                      <TouchableOpacity disabled={subtotal == 0 ? true : false} onPress={() => {
                        setShowViewPrices(true)
                        setCurrentProducts({ ...productsInStore, store: selectedStore });
                      }} >
                        <Text fontType={"Nunito"} className={`underline text-gray-500 text-xs text-center `}> View Prices </Text>
                      </TouchableOpacity>
                    </View>
                    : null} */}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          } else {
            return null;
          }
        })}
      </View>

      <View className="my-10 ">
        <Text
          fontType={"Nunito-ExtraBold"}
          className="text-3xl font-bold text-center m-5"
        >
          Your Cart
        </Text>
        <CartDisplay storesNearYouPage={true} />
      </View>

      {showViewPrices && (
        <BottomSheet
          ref={viewPricesSheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          onClose={handleClose}
        >
          <BottomSheetView style={styles.contentContainer}>
            <ViewPrices />
          </BottomSheetView>
        </BottomSheet>
      )}
    </ScrollView>
  );
};

export default RenderStores;
