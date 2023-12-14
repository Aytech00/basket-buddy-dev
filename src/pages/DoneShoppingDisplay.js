import React, { useEffect, useContext, useState } from "react";
import { Button, Input, CheckBox, Icon } from "@rneui/base";
import { supabase } from "../lib/supabase";
import {
  View,
  Image,
  Text,
  ScrollView,
  Pressable,
  Alert,
  StyleSheet,
} from "react-native";
import DeleteButton from "../components/DeleteButton";
import { useNavigation } from "@react-navigation/native";
import MainHeaderContext from "../lib/MainHeaderContext";
import SavedSearchBar from "../components/ui/SavedSearchBar";
import { SavedCartContext } from "../lib/SavedCartContext";
import UserContext from "../lib/userContext";
import CartPageContext from "../lib/cartPageContext";
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
  const { setCartPage } = useContext(CartPageContext);

  const {
    savedCart,
    clearsavedCart,
    addToSavedCart,
    removeFromsavedCart,
    modifysavedCartItemQuantity,
  } = useContext(SavedCartContext);
  const [cartName, setCartName] = useState("");
  const [search, setSearch] = useState(false);
  const { user } = useContext(UserContext);
  //passed id when trying to modify a cart
  const [cartID, setCartID] = useState();
  //when add product is pressed it should bring up its own search bar

  const toggleCheckbox = (id, index) => {
    setChecked((prevState) => {
      const newState = { ...prevState, [id]: !prevState[id] };
      handleCheckedItems(index, newState[id]); // Pass the index and its new checked state
      return newState;
    });
  };

  const handleHeader = () => {
    setCartPage(false);
    clearsavedCart();
    navigation.navigate("Home");
    setShowHeader(true);
  };

  useEffect(() => {
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
      console.log("CART ");
      // console.log(cart);
      return cart;
    };

    /*FIX PRICE */
    const fetchProductPrice = async (productID) => {
      // TODO: filter results distance to grocery store
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

        addToSavedCart(key, value, price);
      }
    };

    const fetchProducts = (arrayOfIds) => {
      let fetchedProductsArray = [];
      arrayOfIds.map(async (productId) => {
        console.log("productId");
        // console.log(productId);
        const { data: product, error } = await supabase
          .from("Product")
          .select("*")
          .eq("id", productId)
          .single()
          .limit(1);

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
          // Perform further operations with cartData
          //need to fetch the id, if it encounters a product with the same id then increase its quantity
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
    const fetchSimilarProducts = async (name) => {
      let { data: product, error } = await supabase
        .from("Product")
        .select("*")
        .eq("name", name);

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
        const price = await fetchSimilarProducts(product.product.name);

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

  const saveChanges = async () => {
    if (savedCart.length == 0) {
      return Alert.alert("Please add items to the cart");
    } else if (cartName == "") {
      return Alert.alert("Please enter a name for the cart");
    }

    if (cartID) {
      const { data, error } = await supabase
        .from("Cart")
        .select("*")
        .eq("id", cartID)
        .limit(1);

      // Check if there was an error during the query
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

        // Update the cart row with the new product IDs
        const { data: updatedData, error: updateError } = await supabase
          .from("Cart")
          .update({
            name: cartName,
            products_array: productIdArray,
          })
          .eq("id", cartID);

        // Check if there was an error during the update
        if (updateError) {
          console.error("Error updating cart:", updateError);
          return false;
        }
        Alert.alert("Data Received", `Received data`, [
          { text: "OK", onPress: () => console.log("OK Pressed") },
        ]);
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

  const insertCart = async (products_array) => {
    const { data, error } = await supabase
      .from("Cart")
      .insert([
        {
          user_id: user.id,
          name: cartName,
          products_array: products_array,
        },
      ])
      .select();

    if (data) {
      Alert.alert("Data Received", `Received data`, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
      handleHeader();
    }

    if (error) console.log(error);
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
                          }  ${
                            item.product.weight
                              ? `- ${item.product.weight} `
                              : ""
                          }`
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

                    {/* if its in Done Shopping page*/}
                    {typeof id === "undefined" && savedCart.length > 0 && (
                      <DeleteButton
                        cartID={cartID}
                        handleHeader={handleHeader}
                      />
                    )}
                  </View>

                  <Button
                    title="Close"
                    onPress={() => {
                      handleHeader();
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
          <Button
            title="Close Search"
            onPress={handleClose}
            color="transparent"
            titleStyle={{
              color: "#333",
              fontWeight: "bold",
              fontSize: 14,
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
