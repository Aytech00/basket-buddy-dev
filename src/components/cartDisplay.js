import React, { useContext } from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { Icon } from "@rneui/themed";
import { CartContext } from "../lib/cartContext";
import { PremiumContext } from "../lib/premiumContext";

export default function CartPage({ hide, storesNearYouPage }) {
  const { cart, removeFromCart, modifyCartItemQuantity } =
    useContext(CartContext);
  const { premium } = useContext(PremiumContext);

  return (
    <View className="h-auto bg-white flex flex-col mb-4">
      {/* <View className="h-auto bg-white flex flex-col mb-12"> */}
      <ScrollView className="flex flex-col py-4 grow px-5 ">
        {cart.map((item) => {
          return (
            <View
              key={item.basket_buddy_id}
              className="mb-3 px-1.5 flex flex-row items-center justify-between "
            >
              {item.product.image_url ? (
                <Image
                  source={{ uri: item.product.image_url }}
                  className="aspect-square w-16 h-16 rounded mr-3"
                />
              ) : (
                <></>
              )}

              <View className="w-1/2 mr-auto">
                <Text className="text-md font-bold text-ellipsis overflow-hidden w-full">
                  {item.product.name}
                </Text>
                <Text
                  className={`text-gray-400 text-sm font-bold text-ellipsis overflow-hidden w-full `}
                >
                  {storesNearYouPage ? (
                    `$${item?.price?.min} - $${item?.price?.max}`
                  ) : (
                    <>
                      {premium
                        ? item.product.individual_price
                        : `$${item?.price?.min} - $${item?.price?.max}`}
                    </>
                  )}
                </Text>
              </View>

              {hide === undefined ? (
                <View className="flex flex-row items-center mx-auto mb-2">
                  <Pressable
                    onPress={() => {
                      if (item.quantity == 1) {
                        removeFromCart(item.product.basket_buddy_id);
                      }

                      if (item.quantity > 1) {
                        modifyCartItemQuantity(
                          item.product.basket_buddy_id,
                          item.quantity - 1
                        );
                      }
                    }}
                    className="aspect-square h-6 w-6 rounded border-2 border-[#333] pt-[4.5px]"
                  >
                    {item.quantity === 1 ? (
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
              ) : (
                <Text className="text-center text-md mx-2 -translate-y-px">
                  {item.quantity}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
