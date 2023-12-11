import React from "react";

import { TouchableOpacity } from "react-native";

export default function AddButton({
  cartID,
  navigation,
  refreshData,
  recentCarts,
}) {
  return (
    <TouchableOpacity
      onPress={() => {
        navigation.navigate("New Saved Cart", {
          cartID: cartID,
          refreshData,
          recentCarts,
        });
      }}
    />
  );
}
