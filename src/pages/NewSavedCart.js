import React, { useEffect, useContext, useState } from "react";
import { Button, Input, CheckBox, Icon } from "@rneui/base";
import { supabase } from "../lib/supabase";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import DeleteButton from "../components/DeleteButton";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MainHeaderContext from "../lib/MainHeaderContext";
import SavedSearchBar from "../components/ui/SavedSearchBar";
import { SavedCartContext } from "../lib/SavedCartContext";
import uuid from "react-native-uuid";

export default function NewSavedCart({
  route,
  id,
  StoreNearYou,
  PriceMatching,
  handleCheckedItems,
}) {
  const input = React.createRef();
  const [onStoreNearYouPage, setOnStoreNearYouPage] = useState(StoreNearYou);
  const navigation = useNavigation();
  const { showHeader, setShowHeader } = useContext(MainHeaderContext);
  const [checked, setChecked] = useState({});
  const [productPrices, setProductPrices] = useState({});
  const [hideButton, setHideButton] = useState(false);
  const [userSession, setUserSession] = useState();
  const [recentCarts, setRecentCarts] = useState(false);
  const {
    savedCart,
    clearsavedCart,
    addToSavedCart,
    removeFromsavedCart,
    modifysavedCartItemQuantity,
  } = useContext(SavedCartContext);
  const [cartName, setCartName] = useState("");
  const [search, setSearch] = useState(false);
  //passed id when trying to modify a cart
  const [cartID, setCartID] = useState();

  const refreshData = () => {
    if (route.params.refreshData !== undefined) {
      const { refreshData } = route.params;
      refreshData();
    }
  };
  const handlePress = () => {
    setSearch(true);
  };

  useEffect(() => {
    const getUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) console.error(error);

      if (data) {
        setUserSession(data);
      }
    };

    getUser();
  }, []);

  const toggleCheckbox = (id, index) => {
    setChecked((prevState) => {
      const newState = { ...prevState, [id]: !prevState[id] };
      handleCheckedItems(index, newState[id]); // Pass the index and its new checked state
      return newState;
    });
  };

  const handleHeader = (back) => {
    if (back === true) {
      navigation.goBack();
    }
    clearsavedCart();
    setShowHeader(true);
    if (route.params.refreshData !== undefined) {
      const { refreshData } = route.params;
      refreshData();
    }
  };

  //FYI Products won't show without this function being defined
  const fetchProductPrice = async (productID) => {
    console.log("fetchProductPrice");
    // console.log(productID);
  };

  useEffect(() => {
    if (route.params.hasOwnProperty("newCart") === true) {
      setHideButton(true);
    }

    if (route.params.hasOwnProperty("recentCarts") === true) {
      setRecentCarts(true);
    }

    if (id !== undefined && route === undefined) {
      setCartID(id);
    } else if (route.params == undefined && id === undefined) {
      return;
    } else if (
      route.params !== undefined ||
      route.params.cartID !== undefined
    ) {
      setCartID(route.params.cartID);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Code to run when the screen comes into focus

      return () => {
        // Code to run when the screen goes out of focus
        handleHeader(false);
      };
    }, [])
  );

  useEffect(() => {
    const fetchCartById = async (cartID) => {
      let { data: cart, error } = await supabase
        .from("Cart")
        .select("*")
        .eq("id", cartID)
        .single();

      if (error) {
        console.error("Error fetching cart:", error);
        return null;
      }

      if (cart) {
        return cart;
      }
    };

    const updateDuplicateProducts = async (array) => {
      const duplicates = new Map();
      let quantity = 0;

      await Promise.all(
        array.map(async (product) => {
          const key = JSON.stringify(product);
          if (duplicates.has(key)) {
            duplicates.set(key, duplicates.get(key) + 1);
            quantity++;
          } else {
            duplicates.set(key, 1);
          }
        })
      );

      const duplicatesObject = new Map();
      duplicates.forEach((value, key) => {
        const productObj = JSON.parse(key);
        duplicatesObject.set(productObj, value);
      });

      for (const [key, value] of duplicatesObject) {
        let price = await fetchProductPrice(key.id);

        addToSavedCart(key[0], value, price);
      }
    };

    const fetchProducts = (arrayOfIds) => {
      let fetchedProductsArray = [];
      arrayOfIds.map(async (product_basket_buddy_id) => {
        const { data: product, error } = await supabase
          .from("Product")
          .select("*")
          .eq("basket_buddy_id", product_basket_buddy_id);

        if (error) {
          console.error("Error fetching product:", error);
          return null;
        }

        if (product) {
          fetchedProductsArray.push(product);
        }
        if (fetchedProductsArray.length == arrayOfIds.length) {
          updateDuplicateProducts(fetchedProductsArray);
        }
      });
    };

    if (cartID !== undefined) {
      fetchCartById(cartID)
        .then((cartData) => {
          fetchProducts(cartData.products_array);
          setCartName(cartData.name);
        })
        .catch((error) => {
          console.error("Error fetching cart:", error);
        });
    } else {
      return;
    }
  }, [cartID]);

  function getCartPriceRange(similarProducts) {
    let minPrice = Infinity; // Initialize to positive infinity
    let maxPrice = -Infinity; // Initialize to negative infinity

    similarProducts.forEach((product) => {
      const price = parseFloat(product.individual_price.replace("$", ""));

      // Update min and max prices
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    });

    // Replace infinities with null
    minPrice = minPrice === Infinity ? null : minPrice;
    maxPrice = maxPrice === -Infinity ? null : maxPrice;
    return { minPrice, maxPrice };
  }

  useEffect(() => {
    const fetchSimilarProducts = async (basket_buddy_id) => {
      let { data: product, error } = await supabase
        .from("Product")
        .select("*")
        .eq("basket_buddy_id", basket_buddy_id);

      if (error) {
        console.error("Error fetching cart:", error);
        return null;
      }
      if (product) {
        const { minPrice, maxPrice } = getCartPriceRange(product);
        return { min: minPrice, max: maxPrice };
      }
    };

    const updatePrices = async () => {
      let newPrices = {};

      for (let product of savedCart) {
        const price = await fetchSimilarProducts(
          product.product.basket_buddy_id
        );

        newPrices[product.product.id] = price; // Assume each product has a unique `id` field
      }

      setProductPrices(newPrices);
    };

    updatePrices();
  }, [savedCart]);

  const handleInputChange = (event) => {
    setCartName(event);
  };

  const handleClose = () => {
    setSearch(false);
  };

  useEffect(() => {
    setShowHeader(false);
  }, []);

  const insertCart = async (products_array) => {
    let userID = userSession.session.user.id;

    // First, check if a cart with the given name already exists for the user
    const { data: existingCart, error: existingCartError } = await supabase
      .from("Cart")
      .select("*")
      .eq("user_id", userID)
      .eq("name", cartName)
      .limit(1);

    if (existingCartError) {
      console.error("Error fetching existing cart:", existingCartError);
      return;
    }

    // If a cart with the name exists, update it
    if (existingCart && existingCart.length > 0) {
      const cartID = existingCart[0].id; // Assuming ID is the unique identifier

      const { data: updatedData, error: updateError } = await supabase
        .from("Cart")
        .update({
          products_array: products_array,
        })
        .eq("id", cartID);

      if (updateError) {
        console.error("Error updating cart:", updateError);
        return;
      }

      if (updatedData) {
        Alert.alert("Data Received", `Updated existing cart`, [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
        handleHeader(true);
      }
    } else {
      // If no existing cart with the name is found, insert a new one
      const { data, error } = await supabase
        .from("Cart")
        .insert([
          {
            user_id: userID,
            name: cartName,
            products_array: products_array,
          },
        ])
        .single()
        .select();

      if (data) {
        Alert.alert("Data Received", `Received data`, [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
        handleHeader(true);
      }

      if (error) {
        console.log(error);
      }
    }
  };

  const saveChanges = async () => {
    // Ensure there are items in the cart
    if (savedCart.length === 0) {
      return Alert.alert("Please add items to the cart");
    }

    // Check if 'recentCarts' property exists in route params
    if (route.params.hasOwnProperty("recentCarts")) {
      if (cartName === null || cartName === "") {
        return Alert.alert("Please enter a name for the cart");
      }

      // Create product ID array for new cart
      let productIdArray = [];

      savedCart.forEach((cartProduct) => {
        const productId = cartProduct.product.basket_buddy_id;
        const productQuantity = cartProduct.quantity;

        for (let i = 0; i < productQuantity; i++) {
          productIdArray.push(productId);
        }
      });
      // Add new cart to Supabase

      await insertCart(productIdArray);
      // if (data) {
      //   Alert.alert("Data Received", `Received data`, [
      //     { text: "OK", onPress: () => console.log("OK Pressed") },
      //   ]);
      // }
    }
    // Ensure a name has been set for the cart
    if (cartName === "") {
      return Alert.alert("Please enter a name for the cart");
    }

    // Your existing logic for adding items to the cart
    if (cartID) {
      const { data, error } = await supabase
        .from("Cart")
        .select("*")
        .eq("id", cartID)
        .limit(1);

      if (error) {
        console.error("Error fetching cart:", error);
        return false;
      }

      if (data) {
        let productIdArray = [];
        savedCart.forEach((cartProduct) => {
          const productId = cartProduct.product.basket_buddy_id;
          const productQuantity = cartProduct.quantity;

          for (let i = 0; i < productQuantity; i++) {
            productIdArray.push(productId);
          }
        });

        const { data: updatedData, error: updateError } = await supabase
          .from("Cart")
          .update({
            name: cartName,
            products_array: productIdArray,
          })
          .eq("id", cartID)
          .select();

        if (updateError) {
          console.error("Error updating cart:", updateError);
          return false;
        }
        if (updatedData) {
          handleHeader(true);
          Alert.alert("Data Received", `Received data`, [
            { text: "OK", onPress: () => console.log("OK Pressed") },
          ]);
        }
      }
    } else {
      let productIdArray = [];
      savedCart.map((productId, index) => {
        for (let i = 0; i < savedCart[index].quantity; i++) {
          productIdArray.push(savedCart[index].product.basket_buddy_id);
        }
      });
      insertCart(productIdArray);
    }
  };

  return (
    <>
      {!search ? (
        <View className={`${id ? "p-1" : "p-10"} bg-white flex-1 h-auto `}>
          {onStoreNearYouPage ? (
            <Text
              fontType={"Nunito-ExtraBold"}
              className="text-3xl font-bold text-center m-5"
            >
              {PriceMatching ? "Grocery List" : "Your Cart"}
            </Text>
          ) : (
            <Input
              ref={input}
              value={cartName}
              onChangeText={handleInputChange}
              placeholder="Name Your Cart..."
              rightIcon={{ type: "ion-icon", name: "edit" }}
              inputStyle={{
                fontSize: 22,
                textAlign: "center",
                fontWeight: "900",
                paddingLeft: 10,
              }}
              inputContainerStyle={{
                borderBottomWidth: 0,
                backgroundColor: "#ECECEC",
                paddingRight: 5,
              }}
              containerStyle={{
                backgroundColor: "transparent",
              }}
            />
          )}

          <ScrollView>
            {savedCart.length > 0 ? (
              savedCart.map((item, index) => (
                <View
                  key={uuid.v4()}
                  className="mb-3 px-1.5 flex flex-row items-center justify-between"
                >
                  {PriceMatching ? (
                    <>
                      <CheckBox
                        checked={checked[item.product.id] || false}
                        onValueChange={() => toggleCheckbox(item.id, index)}
                        onPress={() => toggleCheckbox(item.product.id, index)}
                        iconType="material-community"
                        checkedIcon="checkbox-marked"
                        uncheckedIcon={"checkbox-blank-outline"}
                        checkedColor="#CCCCCC"
                      />
                    </>
                  ) : null}
                  {item.product.image_url ? (
                    <Image
                      source={{ uri: item.product.image_url }}
                      className="aspect-square w-16 h-16 rounded mr-3"
                    />
                  ) : (
                    <></>
                  )}

                  {/* Product Name + Price */}
                  <View className="w-1/2 mr-auto">
                    <Text className="text-md font-bold text-ellipsis overflow-hidden w-full">
                      {item.product.name}
                    </Text>

                    <Text className="text-gray-400 text-md font-bold text-ellipsis overflow-hidden w-full">
                      {productPrices[item.product.id]
                        ? `$${productPrices[item.product.id].min} - $${
                            productPrices[item.product.id].max
                          }  - ${item.product.weight}`
                        : "Loading..."}
                    </Text>
                  </View>

                  {/* Quantity Selector */}
                  {PriceMatching ? (
                    <Text className="text-center text-md mx-2 -translate-y-px">
                      {item.quantity}
                    </Text>
                  ) : (
                    <View className="flex flex-row items-center mx-auto mb-2">
                      <Pressable
                        onPress={() => {
                          if (item.quantity == 1)
                            removeFromsavedCart(item.product.basket_buddy_id);

                          if (item.quantity > 1)
                            modifysavedCartItemQuantity(
                              item.product.basket_buddy_id,
                              item.quantity - 1
                            );
                        }}
                        className="aspect-square h-6 w-6 rounded border-2 border-[#333] pt-[4.5px]"
                      >
                        {item.quantity == 1 ? (
                          <Icon name="trash" type="font-awesome" size={12} />
                        ) : (
                          <Icon name="minus" type="font-awesome" size={12} />
                        )}
                      </Pressable>
                      <Text className="text-center text-md mx-2 -translate-y-px">
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => {
                          modifysavedCartItemQuantity(
                            item.product.basket_buddy_id,
                            item.quantity + 1
                          );
                        }}
                        className="aspect-square h-6 w-6 rounded border-2 border-[#333] pt-[4px]"
                      >
                        <Icon name="plus" type="font-awesome" size={12} />
                      </Pressable>
                    </View>
                  )}
                </View>
              ))
            ) : (
              <Text className="text-center text-lg my-20">
                Your cart is empty.
              </Text>
            )}

            {onStoreNearYouPage ? null : (
              <>
                <TouchableOpacity onPress={handlePress}>
                  <View className="flex flex-row items-center">
                    <View
                      className={
                        "bg-gray-300 ml-3 w-14 h-14 rounded flex items-center  justify-center"
                      }
                    >
                      <Text className={" text-gray-600 text-2xl font-bold"}>
                        +
                      </Text>
                    </View>

                    <Text className="text-gray-300 pl-10 text-md font-bold">
                      Add Product
                    </Text>
                  </View>
                </TouchableOpacity>

                <View className="flex flex-wrap w-full p-5  flex-col items-center">
                  <View className="flex flex-row  w-full items-center justify-between">
                    <Button
                      title="Save Changes"
                      style={[styles.card, styles.shadowProp]}
                      onPress={saveChanges}
                      titleStyle={{
                        color: "#333",
                        fontWeight: "bold",
                        fontSize: 12,
                      }}
                      buttonStyle={{
                        borderRadius: 5,
                        padding: 5,
                        backgroundColor: "white",
                        height: 25,
                      }}
                      containerStyle={{
                        width: 120,
                        borderRadius: 5,
                        marginLeft: "auto",
                        marginRight: "auto",
                        marginTop: 10,
                        marginBottom: 10,
                      }}
                    />

                    {hideButton === false &&
                      typeof id === "undefined" &&
                      savedCart.length > 0 &&
                      !route.params.recentCarts && (
                        // If it's in the Done Shopping page
                        <DeleteButton
                          cartID={cartID}
                          handleHeader={handleHeader}
                        />
                      )}
                  </View>

                  <Button
                    title="Close"
                    onPress={() => {
                      handleHeader(true);
                    }}
                    color="transparent"
                    titleStyle={{
                      color: "#333",
                      fontWeight: "bold",
                      fontSize: 13,
                      textDecorationLine: "underline",
                    }}
                    buttonStyle={{
                      borderRadius: 5,
                      padding: 5,
                    }}
                    containerStyle={{
                      width: 110,
                      borderRadius: 5,
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </View>
      ) : (
        <>
          <SavedSearchBar handleClose={handleClose} />
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 13,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 5,
    padding: 5,
    marginVertical: 10,
  },
  shadowProp: {
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 24,
  },
});
