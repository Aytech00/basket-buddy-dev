import React from "react";

export default function AddButtonAnim() {
  return (
    <Button
      onPress={() => {
        if (!itemAdded) addItemToCart();
      }}
      title={itemAdded ? "Added" : "+ Add"}
      color={itemAdded ? "#6ECB33" : "#CECECE"}
      icon={
        itemAdded
          ? {
              name: "check",
              size: 16,
              color: "white",
            }
          : null
      }
      buttonStyle={{
        borderRadius: 5,
        paddingLeft: 3,
        paddingVertical: 3,
      }}
      titleStyle={{ fontSize: 14 }}
      containerStyle={{
        width: 90,
        borderRadius: 5,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    />
  );
}
