import React, { useContext, useEffect, useState } from "react";
import { View, ScrollView, Image, Pressable } from "react-native";
import { Icon } from "@rneui/base";
import { CartContext } from "../lib/cartContext";
import { CheckBox } from "@rneui/themed";
import Text from "../components/ui/Text";
import { PremiumContext } from "../lib/premiumContext";

export default function ProductDisplay({
  selectedStoreProduct,
  matchingCartItem,
  handleLowestSubtotal,
  lowestPrice,
}) {
  const { cart, removeFromCart, modifyCartItemQuantity } =
    useContext(CartContext);
  const [checkedItems, setCheckedItems] = useState({}); // to keep track of checked items\
  const [productIndividualPrice, setProductIndividualPrice] = useState(0);
  const [render, setRender] = useState(0);
  const { premium } = useContext(PremiumContext);
  const toggleItem = (id) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (!selectedStoreProduct || !cart) {
    console.log("CART DISPLAY");
    return null;
  }

  const priceMatching = (cartItem) => {
    const product = selectedStoreProduct.find(
      (product) => product.basket_buddy_id === cartItem.basket_buddy_id
    );

    if (product.individual_price <= cartItem.individual_price) {
      return null;
    } else {
      return product.individual_price;
    }
  };

  useEffect(() => {
    // Calculate the lowest subtotal here
    let newSubtotal = 0;
    cart.forEach((item) => {
      const product = selectedStoreProduct.find(
        (product) => product.basket_buddy_id === item.product.basket_buddy_id
      );

      const price =
        lowestPrice.basket_buddy_id === product.basket_buddy_id
          ? lowestPrice.individual_price
          : product.individual_price;

      newSubtotal +=
        parseFloat(price.replace("$", "").trim()) * parseFloat(item.quantity);
    });
    if (render <= 1) {
      console.log("RENDER");
      console.log(newSubtotal);
      handleLowestSubtotal(newSubtotal);
      setRender((prev) => prev + 1);
    }
  }, [cart, selectedStoreProduct, lowestPrice]);

  function convertPriceToNumber(priceString, quantity) {
    if (!priceString) return null;
    let convertedPrice =
      parseFloat(priceString.replace("$", "").trim()) * quantity;

    return convertedPrice;
  }

  return (
    <View className="h-auto bg-white flex flex-col ">
      <ScrollView className="flex flex-col grow  ">
        <View
          key={matchingCartItem.product.basket_buddy_id}
          className={`flex flex-row items-center justify-between  w-full`} // Add opacity if the item is checked
          style={{
            opacity: checkedItems[matchingCartItem.product.basket_buddy_id]
              ? 0.5
              : 1,
          }}
        >
          <CheckBox
            checkedColor="grey"
            checked={
              checkedItems[matchingCartItem.product.basket_buddy_id] || false
            }
            onPress={() => toggleItem(matchingCartItem.product.basket_buddy_id)}
          />

          {matchingCartItem.product.image_url ? (
            <Image
              source={{ uri: matchingCartItem.product.image_url }}
              className="aspect-square w-16 h-16 rounded mr-3"
            />
          ) : (
            <></>
          )}
          <View className={`w-1/3  mr-auto`}>
            <Text className="text-md font-bold text-ellipsis overflow-hidden w-full">
              {matchingCartItem.product.name}
            </Text>
            {premium === true ? (
              <View className="flex flex-row  items-center">
                {lowestPrice.basket_buddy_id ==
                matchingCartItem.product.basket_buddy_id ? (
                  <>
                    <>
                      <Text
                        fontType={"Nunito-ExtraBold"}
                        className="text-[#6ECB33] text-sm"
                      >
                        {lowestPrice.individual_price}
                      </Text>
                      <Text
                        fontType={"Nunito-ExtraBold"}
                        className={`text-[#8E212180] truncate text-xs pl-1 line-through text-ellipsis overflow-hidden `}
                      >
                        {matchingCartItem.product ? (
                          <Text>{priceMatching(matchingCartItem.product)}</Text>
                        ) : (
                          "Unavailable"
                        )}
                      </Text>
                    </>
                  </>
                ) : (
                  <Text
                    fontType={"Nunito-ExtraBold"}
                    className="text-[#6ECB33] text-sm"
                  >
                    {product ? product.individual_price : "Unavailable"}
                  </Text>
                )}
              </View>
            ) : null}
          </View>
          <View className="flex flex-row  w-1/4 justify-between">
            <Text fontType={"Nunito-ExtraBold"}>
              {matchingCartItem.quantity}
            </Text>
            {premium === true ? (
              <Text fontType={"Nunito-ExtraBold"} className="text-gray-500">
                $
                {convertPriceToNumber(
                  lowestPrice.individual_price,
                  matchingCartItem.quantity
                )}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
