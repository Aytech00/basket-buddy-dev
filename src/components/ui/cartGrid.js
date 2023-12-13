import React, { useEffect } from "react";
import SavedCartSubtotal from "../SavedCartSubtotal";
import { View, TouchableOpacity } from "react-native";
import Text from "./Text";
import AddButton from "../AddButton";
import Product from "../Product";
import { Icon } from "@rneui/themed";
import { supabase } from "../../lib/supabase";
import { useNavigation } from "@react-navigation/native";

export default function cartGrid({ cart, refreshData }) {
  const navigation = useNavigation();

  useEffect(() => {
    console.log("cart");
    // console.log(cart);
  }, []);

  const handleDeleteRow = async (cartID) => {
    try {
      const { data, error } = await supabase
        .from("Cart")
        .delete()
        .eq("id", cartID);

      if (error) {
        console.error("Error deleting row:", error.message);
      } else {
        refreshData(); // <-- This will trigger a re-fetch of the cart data
      }
    } catch (error) {
      console.error("Error deleting row:", error.message);
    }
  };

  //duplicate images
  const uniqueProductsArray = [...new Set(cart.products_array)];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "stretch",
        width: "100%",
        overflow: "hidden", // <-- Add this line
      }}
    >
      <TouchableOpacity
        style={{ flexDirection: "row", alignItems: "stretch" }}
        onPress={() => {
          navigation.navigate("New Saved Cart", {
            cartID: cart.id,
            fetchUserData: refreshData,
          });
        }}
        className=" w-2/3"
      >
        {/* Product Images */}
        <View className="flex flex-wrap flex-row border-2 border-black w-28 h-28 justify-center items-center relative">
          {uniqueProductsArray.slice(0, 4).map((id, index) => {
            let styleClass = "";
            const numImages = uniqueProductsArray.length;

            if (numImages === 1) {
              styleClass = "h-full w-full";
            } else if (numImages === 2) {
              styleClass =
                index === 0
                  ? "h-1/2 w-1/2 absolute top-0 left-0"
                  : "h-1/2 w-1/2 absolute bottom-0 right-0"; // Adjusting so one appears on the left and the other on the right
            } else if (numImages === 3) {
              styleClass = index === 0 ? "h-1/2 w-1/2" : "h-1/2 w-1/2"; // Adjusting so one appears on the top and others split the bottom row
            } else {
              styleClass = "h-1/2 w-1/2"; // 4 images, so they appear in a 2x2 grid
            }

            return (
              <View key={id + "-" + index} className={` ${styleClass}`}>
                <Product productId={id} />
              </View>
            );
          })}
        </View>

        {/* Product Details */}
        <View className={`pl-4 flex flex-col w-3/6 `}>
          <Text className="text-xl font-bold text-ellipsis overflow-hidden w-full ">
            {cart.name !== null
              ? cart.name
              : new Date(cart.created_date).toLocaleString("default", {
                  month: "short",
                  day: "numeric",
                  year: "2-digit",
                })}
          </Text>

          <View className="">
            <SavedCartSubtotal cartId={cart.id} />
          </View>

          <View className="flex-grow overflow-hidden">
            {/* Added flex-grow here */}
            {cart.products_array.slice(0, 2).map((id, index) => (
              <View key={id + "-" + index}>
                <Product productId={id} text={true} />
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
      {/* Add and Delete Buttons */}
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center", // <-- Modified this line
        }}
      >
        <AddButton cartProducts={cart.products_array} />
        {cart.name !== null ? (
          <TouchableOpacity
            onPress={() => {
              // Handle trash icon press here, e.g., delete the cart item
              handleDeleteRow(cart.id);
            }}
            style={{ padding: 10 }}
          >
            <Icon name="trash" type="font-awesome" color="grey" size={25} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
