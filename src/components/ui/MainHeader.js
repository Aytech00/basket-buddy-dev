import React, { useState, useContext } from "react";
import { View, Text, Pressable } from "react-native";
import { SearchBar } from "@rneui/base";
import { Icon } from "@rneui/themed";
import SearchResults from "../searchResults";
import { CartContext } from "../../lib/cartContext";
import CartPage from "../../pages/cart";
import MainHeaderContext from "../../lib/MainHeaderContext";
import CartPageContext from "../../lib/cartPageContext";
import { Platform } from "react-native";
import { useSearchContext } from "../../lib/SearchBarContext";
import UserContext from "../../lib/userContext";

export default function MainHeader() {
  // cart page toggle
  const { showHeader, setShowHeader } = useContext(MainHeaderContext);
  const { cartPage, setCartPage } = useContext(UserContext);
  const { search, setSearch, searchRef, setSearchFocus } =
    useContext(UserContext);

  const updateSearch = (search) => {
    if (cartPage) {
      setCartPage(false);
    }

    setSearch(search.replace(/[\u2018\u2019]/g, "'"));
  };

  const { cart } = useContext(CartContext);

  if (!showHeader) {
    return null; // If showHeader is false, don't render the MainHeader component
  }
  return (
    <>
      <View
        style={{ backgroundColor: "transparent" }}
        className={`${
          Platform.OS === "ios" ? "pt-3 px-1  mt-10 h-33" : ""
        }   flex flex-row items-center px-1 py-3 `}
      >
        <SearchBar
          ref={searchRef}
          value={search}
          onChangeText={updateSearch}
          onFocus={() => {
            setSearchFocus(true);
            // Keyboard.show();
          }}
          onBlur={() => setSearchFocus(false)}
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

        <Pressable
          onPress={() => setCartPage(!cartPage)}
          className="w-[16%] ml-auto"
        >
          <Icon
            name="basket-outline"
            type="ionicon"
            color="#fff"
            size={30}
            // iconStyle={{ Error or something?
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

      {search != "" ? <SearchResults searchTerm={search} /> : ""}
    </>
  );
}
