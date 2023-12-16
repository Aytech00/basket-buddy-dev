import { View, StyleSheet, Image } from "react-native";
import React, { useEffect, useState, useContext, useCallback } from "react";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Button, Icon } from "@rneui/base";
import { CartContext } from "../lib/cartContext";
import { PremiumContext } from "../lib/PremiumContext";
import ProductDisplay from "../components/productsDisplay";
import Text from "../components/ui/Text";
import * as Linking from "expo-linking";
import { supabase } from "../lib/supabase";
import UserContext from "../lib/userContext";
import MainHeaderContext from "../lib/MainHeaderContext";
import { useNavigation } from "@react-navigation/native";
import { ScrollView } from "react-native-gesture-handler";

const PriceMatching = React.forwardRef((props, ref) => {
  const { snapPoints, onClose } = props;
  const [lowestProducts, setLowestProducts] = useState();
  const { session, highestPrice } = useContext(UserContext);
  const { setShowHeader } = useContext(MainHeaderContext);
  const [highestSubtotal, setHighestSubtotal] = useState(0);
  const [lowestSubtotal, setLowestSubtotal] = useState(0);
  const [highestStore, setHighestStore] = useState(props.hightestSubtotal);
  const navigation = useNavigation();
  const [store, setStore] = useState(props.selectedGrocery);
  const [savings, setSavings] = useState(0);
  const { cart } = useContext(CartContext);
  const { premium } = useContext(PremiumContext);
  const [subtotal, setSubtotal] = useState(0);
  const [lowestPrices, setLowestPrices] = useState(0);

  useEffect(() => {
    if (props.selectedGrocery !== undefined && props.selectedGrocery !== null) {
      setStore(props.selectedGrocery);
    }
  }, [props.selectedGrocery]);

  //CALCULATE SAVINGS!!!!
  useEffect(() => {
    if (store && highestSubtotal) {
      let permiumSavings;
      let freeSavings;

      let lowestSubtotal = 0;

      // Calculate the total price of the lowest-priced products
      for (const product of lowestProducts) {
        const price = parseFloat(product.individual_price.replace("$", ""));
        // console.log("Subtotal", lowestSubtotal);
        lowestSubtotal += price;
      }

      console.log(highestStore);
      setLowestPrices(lowestSubtotal);
      permiumSavings = highestStore - lowestSubtotal;
      freeSavings = highestStore - store.subtotal;

      console.log("highestStore", permiumSavings);
      if (premium) setSavings(permiumSavings.toFixed(2));
      else setSavings(freeSavings.toFixed(2));
    }
  }, [highestSubtotal, store, premium, lowestProducts]);

  useEffect(() => {
    // console.log("props.selectedGrocery", props.selectedGrocery.subtotal);
    // Calculate your subtotal here and assign it to newSubtotal
    setSubtotal(props.selectedGrocery.subtotal.toFixed(2));
  }, [props.selectedGrocery]); // Recalculate subtotal when selectedGrocery changes

  // Retrieve max product price
  useEffect(() => {
    let maxSubtotal = 0;
    if (props.foundProducts) {
      for (const product of props.foundProducts) {
        const price = parseFloat(product.individual_price.replace("$", ""));
        if (price > maxSubtotal) {
          maxSubtotal = price;
        }
      }
    }

    setHighestSubtotal(maxSubtotal);
  }, [props.foundProducts]);

  useEffect(() => {
    const lowestPricePerItem = [];

    // Iterate over each item in the cart
    for (const cartItem of cart) {
      // Ensure the selected grocery store and its products are available
      if (props.selectedGrocery && props.selectedGrocery.productsInStore) {
        const productsInStore = props.selectedGrocery.productsInStore;

        // Check if the product exists in the selected store
        const productInStore = productsInStore.find(
          (product) =>
            product.basket_buddy_id === cartItem.product.basket_buddy_id
        );

        // If the product doesn't exist in the store, skip the rest of the loop
        if (!productInStore) {
          continue;
        }

        // Find all products in props.foundProducts that match the cart item's name
        const matchingProducts = props.foundProducts.filter(
          (product) =>
            product.basket_buddy_id === cartItem.product.basket_buddy_id
        );

        // Find the product with the lowest price among the matching products
        let lowestPriceProduct = null;
        let lowestPrice = Infinity;

        for (const product of matchingProducts) {
          const price = parseFloat(product.individual_price.replace("$", ""));

          if (price < lowestPrice) {
            lowestPrice = price;
            lowestPriceProduct = product;
          }
        }

        // Add the lowest price product to the lowestPricePerItem array
        lowestPricePerItem.push(lowestPriceProduct);
      }
    }
    setLowestProducts(lowestPricePerItem);
  }, [cart, props.foundProducts, props.selectedGrocery]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleSaveWithNoName = async () => {
    let user_id = session.user.id;

    let productIdArray = [];
    cart.map((productId, index) => {
      for (let i = 0; i < cart[index].quantity; i++) {
        productIdArray.push(cart[index].product.id);
      }
    });
    const { data, error } = await supabase
      .from("Cart")
      .insert([
        {
          user_id: user_id,
          products_array: productIdArray,
        },
      ])
      .select();

    if (error) console.log(error);
    if (data) {
      setShowHeader(false);
      navigation.navigate("Done Shopping", {
        cartID: data[0].id,
        savings: savings,
      });
    }
  };

  const handleLowestSubtotal = useCallback((subtotal) => {
    setLowestSubtotal((prevTotalPrice) => {
      // console.log("subtotal in handler", subtotal);
      // Explicitly convert to number and return
      return Number(subtotal);
    });
  });

  const renderedProducts = new Set();

  return (
    <BottomSheet
      ref={ref}
      index={0}
      snapPoints={snapPoints}
      onClose={handleClose}
      enablePanDownToClose={true}
    >
      <BottomSheetView style={styles.contentContainer}>
        <ScrollView style={{ flex: 1, marginBottom: 100 }}>
          {premium === true ? (
            <>
              {/* PRICE MATCHING*/}
              <View className="w-3/4 flex justify-center mb-10  mx-auto">
                <Text
                  fontType={"Nunito-ExtraBold"}
                  className="text-3xl text-center mt-5"
                >
                  Price Matching...
                </Text>
                <Text
                  fontType={"Nunito-Italic"}
                  className="text-gray-500 text-center"
                >
                  {" "}
                  Go to the price match link & show the cashier. Enjoy your
                  savings!
                </Text>
              </View>

              <View className="h-auto w-screen p-3">
                {/* PRICE MATCHING*/}

                {lowestProducts !== undefined ? (
                  lowestProducts.map((product, index) => {
                    // Do not render the product if it's from the selected store
                    if (product.store_id === store.store.id) {
                      return null;
                    }

                    let matchingProduct;
                    if (store.productsInStore) {
                      matchingProduct = store.productsInStore.find(
                        (storeProduct) =>
                          storeProduct.basket_buddy_id ===
                          product.basket_buddy_id
                      );
                    }

                    if (
                      matchingProduct.individual_price ===
                      product.individual_price
                    ) {
                      return null;
                    }

                    return matchingProduct ? (
                      <View
                        key={index}
                        className="mb-3 px-1.5 flex flex-row items-center justify-between p-3"
                      >
                        {product.image_url ? (
                          <Image
                            source={{ uri: product.image_url }}
                            className="aspect-square w-16 h-16 rounded mr-3"
                          />
                        ) : (
                          <></>
                        )}

                        {/* Product Name + Price */}
                        <View className="w-2/5 mr-auto  tuncate ml-1">
                          <Text className="text-md font-bold truncate">
                            {product.name}
                          </Text>
                          <View className="flex flex-row items-center">
                            {/*FIX PRICE */}
                            <Text
                              fontType={"Nunito-ExtraBold"}
                              className="text-[#6ECB33] text-sm truncate"
                            >
                              {product.individual_price}
                            </Text>
                            <Text
                              fontType={"Nunito-ExtraBold"}
                              className="text-[#8E212180] text-xs pl-1 line-through"
                            >
                              {matchingProduct.individual_price}
                            </Text>
                          </View>
                        </View>

                        {/* Quantity Selector */}
                        <View className="flex flex-row items-center mx-auto mb-2 ">
                          <Button
                            onPress={() => {
                              Linking.openURL(product.product_link);
                            }}
                            color="#313131"
                            containerStyle={{
                              height: 25,
                              borderRadius: 2,
                              paddingLeft: 3,
                              paddingVertical: 3,
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
                              className="text-white text-xs h-5 ml-1 mt-1"
                              style={{ marginLeft: "-1%" }}
                            >
                              Price Matching
                            </Text>
                          </Button>
                        </View>
                      </View>
                    ) : null;
                  })
                ) : (
                  <Text>loading</Text>
                )}
              </View>
            </>
          ) : null}
          <View className="h-auto w-screen -1 p-3">
            <Text
              fontType={"Nunito-ExtraBold"}
              className="text-3xl text-center"
            >
              Grocery List
            </Text>

            {/* Check if lowestProducts is available */}
            {/* Iterate through each product in lowestProducts array */}
            {lowestProducts !== undefined ? (
              lowestProducts.map((product, index) => {
                {
                  /* Check if the product is already rendered or belongs to the current store */
                }

                {
                  /* Variable to store matching product from the current store */
                }
                let matchingProduct;
                {
                  /* Check if the current store has any products */
                }
                if (store.productsInStore) {
                  {
                    /* Find a matching product in the current store */
                  }
                  matchingProduct = store.productsInStore.find(
                    (storeProduct) =>
                      storeProduct.basket_buddy_id === product.basket_buddy_id
                  );
                }

                {
                  /* Log the matching product if found */
                }
                {
                  /* Check if a matching product was found */
                }

                if (matchingProduct) {
                  {
                    /* Add the basket_buddy_id to the renderedProducts Set to avoid duplicate renders */
                  }
                  renderedProducts.add(product.basket_buddy_id);
                  {
                    /* Render the product */
                  }

                  let matchingCartItem = cart.find(
                    (cartItem) =>
                      cartItem.product.basket_buddy_id ==
                      matchingProduct.basket_buddy_id
                  );

                  return (
                    <View
                      key={index}
                      className="flex flex-row items-center justify-between p-3"
                    >
                      {/* Product Name + Price */}
                      <ProductDisplay
                        selectedStoreProduct={
                          props.selectedGrocery.productsInStore
                        }
                        lowestPrice={product}
                        matchingCartItem={matchingCartItem}
                        handleLowestSubtotal={handleLowestSubtotal}
                      />
                    </View>
                  );
                } else {
                  {
                    /* Skip rendering this product */
                  }
                  return null;
                }
              })
            ) : (
              <Text>loading</Text>
            )}
          </View>

          <View className="flex items-center">
            <Button
              title="I'm Done Shopping"
              onPress={() => {
                handleSaveWithNoName();
              }}
              color="#313131"
              containerStyle={{
                marginBottom: 30,
                width: "90%",
              }}
            />
          </View>
        </ScrollView>
        <View className="bg-white  w-full h-15 absolute bottom-0">
          {store ? (
            <View className=" flex flex-row">
              <View className="w-1/4 p-1">
                {store.foundBrand.image_url ? (
                  <Image
                    source={{ uri: store.foundBrand.image_url }}
                    className="aspect-square w-full h-auto rounded "
                    resizeMode="contain"
                  />
                ) : (
                  <></>
                )}
              </View>

              <View className="w-2/4 ml-2 p-1">
                <Text fontType={"Nunito-ExtraBold"}>
                  {store.foundBrand.name}
                </Text>
                <Text fontType={"Nunito"}>
                  {store.store.address}, {store.store.city}, {store.store.state}
                </Text>
                <View className="flex  justify-center text-center w-3/5">
                  <Button
                    onPress={() => {
                      Linking.openURL(
                        `https://www.google.com/maps/search/?api=1&query=${store.store.address}, ${store.store.city}, ${store.store.state}`
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
                      Get Directions
                    </Text>
                  </Button>
                </View>
              </View>

              <View className="w-1/4 flex justify-center items-center">
                <Text fontType={"Nunito"}>Subtotal:</Text>
                <Text
                  fontType={"Nunito-ExtraBold"}
                  className="text-xl text-[#6ECB33] "
                >
                  {premium === true
                    ? // ? `$${lowestSubtotal.toFixed(2)}`
                      `$${lowestPrices.toFixed(2)}`
                    : // `$${lowestProducts
                      //   ?.map((product) => {
                      //     const item = cart?.find(
                      //       (cartItem) =>
                      //         cartItem.product.basket_buddy_id ==
                      //         product.basket_buddy_id
                      //     );

                      //     return (
                      //       parseFloat(
                      //         product.individual_price.replace("$", "").trim()
                      //       ) * item.quantity
                      //     );
                      //   })
                      //   ?.reduce((a, b) => a + b, 0)
                      //   ?.toFixed(2)}`
                      `$${subtotal}`}
                </Text>
              </View>
            </View>
          ) : (
            <Text>loading</Text>
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
    position: "absolute",
    width: "100%",
  },
  contentContainer: {
    flex: 1,
    alignItems: "center",
    zIndex: 1000,
  },
  centerButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default PriceMatching;
