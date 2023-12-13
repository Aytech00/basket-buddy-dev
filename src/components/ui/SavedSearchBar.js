import React, { useState, useContext } from "react";
import { View, Text, Pressable, ImageBackground } from "react-native";
import { SearchBar, Button } from "@rneui/themed";
import { Icon } from "@rneui/themed";
import SearchResults from "../searchResults";
import { SavedCartContext } from "../../lib/SavedCartContext";
export default function search({ handleClose }) {
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

  const { savedCart } = useContext(SavedCartContext);

  return (
    <>
      <ImageBackground
        source={require("../../../assets/images/header.png")}
        className="h-2/5"
      >
        <View>
          <View
            style={{ backgroundColor: "transparent" }}
            className={`${
              Platform.OS === "ios" ? "pt-3 x-1 py-3  mt-10 h-33" : ""
            }   flex flex-row items-center px-1 py-3 `}
          >
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

            <Pressable
              onPress={() => handleClose()}
              className="w-[16%] ml-auto"
            >
              <Icon
                name="arrow-back-circle-outline"
                type="ionicon"
                color="#fff"
                size={35}
              />
              {savedCart.length > 0 ? (
                <View className="absolute w-4 h-4 top-0 right-0 -translate-y-1 -translate-x-2 bg-[#FF485A] rounded-full">
                  <Text className="font-bold text-xs text-center color-white">
                    {savedCart.length}
                  </Text>
                </View>
              ) : (
                ""
              )}
            </Pressable>
          </View>

          {search != "" ? (
            <SearchResults searchTerm={search} type={true} newSaved={true} />
          ) : (
            ""
          )}
        </View>
      </ImageBackground>
    </>
  );
}
