import React, { useContext, useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  Pressable,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { Button, Icon } from "@rneui/base";
import { CartContext } from "../lib/cartContext";
import { supabase } from "../lib/supabase";
import UserContext from "../lib/userContext";
import { useNavigation } from "@react-navigation/native";
import MainHeaderContext from "../lib/MainHeaderContext";
import CartPageContext from "../lib/cartPageContext";
import Text from "../components/ui/Text";

const height =
  Platform.OS === "android"
    ? Dimensions.get("window").height - 145
    : Dimensions.get("screen").height - 195;

export default function CartPage() {
  const { cart, clearCart, removeFromCart, modifyCartItemQuantity } =
    useContext(CartContext);
  const navigation = useNavigation();
  const { setShowHeader } = useContext(MainHeaderContext);
  const { session, setHighestPrice } = useContext(UserContext);
  const [subtotal, setSubtotal] = useState({ min: 0, max: 0 });
  const { setCartPage } = useContext(CartPageContext);

  function getCartPriceRange(similarProducts, quantity) {
    let minPrice = Infinity; // Initialize to positive infinity
    let maxPrice = -Infinity; // Initialize to negative infinity
    let doritos = false;
    similarProducts.forEach((product) => {
      const price = parseFloat(product.individual_price.replace("$", ""));
      // Update min and max prices

      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    });

    // Replace infinities with null
    minPrice = minPrice === Infinity ? null : minPrice * quantity;
    maxPrice = maxPrice === -Infinity ? null : maxPrice * quantity;

    return { minPrice, maxPrice };
  }

  useEffect(() => {
    const fetchSimilarProducts = async (name, quantity, basket_buddy_id) => {
      let { data: product, error } = await supabase
        .from("Product")
        .select("*")
        .eq("basket_buddy_id", basket_buddy_id);

      if (error) {
        console.error("Error fetching cart:", error);
        return null;
      }

      if (product) {
        const { minPrice, maxPrice } = getCartPriceRange(product, quantity);
        return { min: minPrice, max: maxPrice };
      }
    };

    const fetchAllSimilarProducts = async () => {
      const promises = cart.map((item) =>
        fetchSimilarProducts(
          item.product.name,
          item.quantity,
          item.product.basket_buddy_id
        )
      );
      const priceRanges = await Promise.all(promises);

      // Calculate the minimum and maximum of all price ranges
      let totalMin = priceRanges.reduce(
        (total, range) => (range.min !== null ? total + range.min : total),
        0
      );
      let totalMax = priceRanges.reduce(
        (total, range) => (range.max !== null ? total + range.max : total),
        0
      );

      setSubtotal({ min: totalMin.toFixed(2), max: totalMax.toFixed(2) });
    };
    fetchAllSimilarProducts();
  }, [cart]);

  useEffect(() => {
    subtotal.max && setHighestPrice(subtotal.max);
  }, [subtotal]);

  //function that saves the current cart and sends it to supabase
  const saveCart = async () => {
    if (cart.length == 0) {
      return Alert.alert("Please add items to the cart");
    }

    const cartName = await handleCartName();

    let user_id = session.user.id;

    let productIdArray = [];
    cart.map((productId, index) => {
      for (let i = 0; i < cart[index].quantity; i++) {
        productIdArray.push(cart[index].product.basket_buddy_id);
      }
    });
    const { data, error } = await supabase
      .from("Cart")
      .insert([
        {
          user_id: user_id,
          name: cartName,
          products_array: productIdArray,
        },
      ])
      .select();

    if (data) {
      Alert.alert("Data Received", `Received data`, [
        { text: "OK", onPress: () => console.log("OK Pressed") },
      ]);
    }

    if (error) console.log(error);
  };

  const handleCartName = () => {
    return new Promise((resolve, reject) => {
      Alert.prompt(
        "Enter a name for the cart",
        "Please enter a name:",
        (text) => {
          resolve(text);
        },
        "plain-text",
        ""
      );
    });
  };

  const storesNearPage = async () => {
    let user_id = session.user.id;

    let productIdArray = [];
    cart.map((productId, index) => {
      for (let i = 0; i < cart[index].quantity; i++) {
        productIdArray.push(cart[index].product.basket_buddy_id);
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
      setCartPage(false);
      navigation.navigate("Stores Near You", {
        cartID: data[0].id,
      });
    }
  };

  return (
    // <View className="bg-white h-[75vh] ">
    <View
      className={`bg-white ${Platform.OS === "ios" ? "pb-10" : ""}`}
      style={{ height }}
    >
      <View className="h-100 bg-white flex flex-col mb-28">
        <View
          style={{ backgroundColor: "#333333" }}
          className=" flex flex-row justify-between items-center p-4 shadow-lg"
        >
          <Text
            fontType={"Nunito-ExtraBold"}
            className="text-3xl font-bold text-white grow mr-3"
          >
            Your Cart
          </Text>

          <Button
            onPress={saveCart}
            title="+ Save Cart"
            color="#fff"
            titleStyle={{
              color: "#333",
              fontWeight: "bold",
              fontSize: 14,
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

        <ScrollView className="flex flex-col py-4 grow ">
          {cart.length > 0 ? (
            cart.map((item) => (
              <View
                key={item.product.id}
                className="mb-3 px-1.5 flex flex-row items-center justify-between"
              >
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
                  {/*FIX PRICE */}
                  <Text className="text-gray-400 text-sm font-bold text-ellipsis overflow-hidden w-full">
                    {item.price
                      ? `$${item.price.min} - $${item.price.max}`
                      : "Price Not Available"}
                  </Text>
                </View>

                {/* Quantity Selector */}
                <View className="flex flex-row items-center mx-auto">
                  <Pressable
                    onPress={() => {
                      if (item.quantity == 1)
                        removeFromCart(item.product.basket_buddy_id);

                      if (item.quantity > 1)
                        modifyCartItemQuantity(
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
                      modifyCartItemQuantity(
                        item.product.basket_buddy_id,
                        item.quantity + 1
                      );
                    }}
                    className="aspect-square h-6 w-6 rounded border-2 border-[#333] pt-[4px]"
                  >
                    <Icon name="plus" type="font-awesome" size={12} />
                  </Pressable>
                </View>
              </View>
            ))
          ) : (
            <View className="text-center w-full flex flex-col items-center">
              <Text className="text-center text-lg mt-10">
                Your cart is empty.
              </Text>
              <Button
                raised
                title="Close"
                onPress={() => {
                  setCartPage(false);
                }}
                color="#fff"
                titleStyle={{
                  color: "#333",
                }}
                containerStyle={{
                  marginTop: 10,

                  width: "70%",
                }}
              />
            </View>
          )}

          {/* Subtotal */}
          {cart.length > 0 ? (
            <View className="mx-3 my-4 py-4 border-t border-gray-300">
              <View className="flex flex-row justify-between items-center">
                <Text className="text-base font-bold">Subtotal</Text>
                <Text className="text-base">
                  {subtotal ? `$${subtotal.min} - $${subtotal.max}` : null}
                </Text>
              </View>

              <Button
                title="Calculate Best Deals"
                onPress={() => {
                  storesNearPage();
                }}
                color="#313131"
                containerStyle={{
                  marginTop: 20,
                }}
              />

              <Button
                raised
                title="Continue Shopping"
                onPress={() => {
                  setCartPage(false);
                }}
                color="#fff"
                titleStyle={{
                  color: "#333",
                }}
                containerStyle={{
                  marginTop: 10,
                }}
              />

              <Pressable onPress={clearCart}>
                <Text className="text-center text-md text-gray-400 mt-8 underline">
                  Clear Cart
                </Text>
              </Pressable>
            </View>
          ) : (
            ""
          )}
        </ScrollView>
      </View>
    </View>
  );
}
