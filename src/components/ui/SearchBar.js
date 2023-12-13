import React, { useState, useContext } from "react";
import { View, Text, Pressable } from "react-native";
import { SearchBar } from "@rneui/themed";
import { Icon } from "@rneui/themed";
import SearchResults from "../searchResults";
import { CartContext } from "../../lib/cartContext";
import CartPage from "../../pages/cart";

export default function search() {
  // cart page toggle
  const [cartPage, setCartPage] = useState(false);
  // search bar
  const [search, setSearch] = useState("");

  const updateSearch = (search) => {
    if (cartPage) {
      setCartPage(false);
    }

    setSearch(search);
  };

  const { cart } = useContext(CartContext);

  return (
    <>
      <View>
        <View className="bg-gray-800 flex flex-row items-center px-1 py-2">
          <SearchBar
            value={search}
            onChangeText={updateSearch}
            containerStyle={{
              width: "85%",
              backgroundColor: "#ffffff00",
              paddingHorizontal: 5,
              paddingVertical: 0,
              margin: 0,
              borderBottomWidth: 0,
              borderTopWidth: 0,
            }}
            inputContainerStyle={{
              backgroundColor: "white",
              borderRadius: 100,
              paddingHorizontal: 10,
              height: 45,
              borderWidth: 0,
            }}
            inputStyle={{
              fontSize: 15,
            }}
            leftIconContainerStyle={{ display: "none" }}
            rightIconContainerStyle={{ color: "black" }}
            lightTheme
            round
            placeholder="Search for groceries..."
          />
          <Pressable onPress={() => handleClose()} className="w-[16%] ml-auto">
            <Icon
              name="list-outline"
              type="ionicon"
              color="#fff"
              size={30}
              // iconStyle={{
              //   boxShadow: "0px 2px 2px 0px #00000040",
              // }}
            />

            <Icon
              name="basket-outline"
              type="ionicon"
              color="#fff"
              size={30}
              // iconStyle={{
              //   boxShadow: "0px 2px 2px 0px #00000040",
              // }}
            />
            {cart.length > 0 ? (
              <View className="absolute w-4 h-4 top-0 right-0 -translate-y-1 -translate-x-2 bg-[#FF485A] rounded-full">
                <Text className="font-bold text-xs text-center color-white">
                  {cart.length}
                </Text>
              </View>
            ) : (
              ""
            )}
          </Pressable>
        </View>

        {cartPage ? <CartPage /> : ""}

        {search != "" ? (
          <SearchResults searchTerm={search} type={false} newSaved={false} />
        ) : (
          ""
        )}
      </View>
    </>
  );
}
