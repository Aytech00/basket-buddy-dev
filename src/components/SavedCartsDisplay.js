import React, { useState, useEffect } from "react";
import { ScrollView, View, Image, Text, TouchableOpacity } from "react-native";
import Chevron from "../components/ui/Chevron";

import { useIsFocused } from "@react-navigation/native";
import { Icon } from "@rneui/base";
import { supabase } from "../lib/supabase";
import CartGrid from "../components/ui/cartGrid";
import { AvatarLayout } from "./SkeletonLoader";

export default function SavedCartsDisplay({
  fetchUserData,
  navigation,
  recentCarts,
}) {
  const [savedCarts, setSavedCarts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [viewMore, setViewMore] = useState(true);
  const [cartAmount, setCartAmount] = useState(2);
  const ITEMS_PER_PAGE = 4;
  const MAX_CARTS = 6;
  const isFocused = useIsFocused();

  const removeDuplicates = (originalArray, prop) => {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  };

  const loadMore = () => {
    // if (cartAmount < MAX_CARTS) {
    //   setCartAmount((val) => (val += 2));
    // } else if (cartAmount === MAX_CARTS) {
    //   setCartAmount(2);
    // }

    setCartAmount((prevAmount) => {
      if (viewMore) {
        if (prevAmount < MAX_CARTS) {
          return prevAmount + 2;
        }
        return 2; // Reset to 2 when the max is reached
      } else {
        return 2;
      }
    });
  };

  useEffect(() => {
    fetchMoreData();
    // setTimeout(() => {
    //   setLoading(false);
    // }, 3000);
  }, [refresh]);

  useEffect(() => {
    // if (cartAmount >= MAX_CARTS) {
    //   setViewMore(false);
    // } else if (cartAmount <= MAX_CARTS) {
    //   setViewMore(true);
    // }

    if (cartAmount >= MAX_CARTS || cartAmount >= savedCarts.length) {
      setViewMore(false);
    } else if (cartAmount <= MAX_CARTS) {
      setViewMore(true);
    }
  }, [cartAmount, savedCarts]);

  const fetchMoreData = async () => {
    try {
      setLoading(true);
      const newData = await fetchUserData(page, ITEMS_PER_PAGE);
      // console.log("Fetched Data: ", newData);
      const combinedData = [...newData];
      const uniqueData = removeDuplicates(combinedData, "id");
      setSavedCarts(uniqueData);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error in fetching more data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRow = async (cartID) => {
    try {
      const { data, error } = await supabase
        .from("Cart")
        .delete()
        .eq("id", cartID);

      if (error) {
        console.error("Error deleting row:", error.message);
      } else {
        refreshData();
      }
    } catch (error) {
      console.error("Error deleting row:", error.message);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchMoreData();
    }
  }, [isFocused]);

  useEffect(() => {
    console.log("Component did mount or update");
    fetchMoreData();
  }, []);

  const refreshData = () => {
    setRefresh(!refresh);
  };

  if (loading)
    return (
      <View style={{ gap: 10 }}>
        <AvatarLayout />
        <AvatarLayout />
      </View>
    );

  return (
    <ScrollView className="bg-white pt-5">
      <View className="mx-2">
        <View>
          {loading ? (
            <Text>Loading...</Text>
          ) : savedCarts.length === 0 ? (
            <Text
              fontType={"Nunito-ExtraBold"}
              className="text-center font-bold  text-base text-[#D5D5D5]"
            >
              Empty Cart
            </Text>
          ) : (
            savedCarts.slice(0, cartAmount).map((cart) => (
              <View
                key={cart.id}
                onPress={() => {
                  navigation.navigate("New Saved Cart", {
                    cartID: cart.id,
                    refreshData,
                    recentCarts,
                  });
                }}
              >
                <View className="flex flex-row w-100 my-3 h-auto">
                  {/* Product Images */}

                  <CartGrid cart={cart} refreshData={refreshData} />
                </View>
              </View>
            ))
          )}
          {/* {savedCarts.length >= MAX_CARTS && (
            <Chevron fetchData={loadMore} viewMore={viewMore} />
          )} */}
          {savedCarts.length !== 0 ? (
            savedCarts.length > 2 ? (
              <Chevron fetchData={loadMore} viewMore={viewMore} />
            ) : (
              <></>
            )
          ) : (
            <></>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
