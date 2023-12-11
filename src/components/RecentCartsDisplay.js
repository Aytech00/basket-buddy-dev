import React, { useState, useEffect } from "react";
import { ScrollView, View, Text } from "react-native";
import Chevron from "../components/ui/Chevron";
import CartGrid from "../components/ui/cartGrid";
import { AvatarLayout } from "./SkeletonLoader";

export default function RecentCartsDisplay({ fetchUserData, navigation }) {
  const [recentCarts, setRecentCarts] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [viewMore, setViewMore] = useState(true);
  const [cartAmount, setCartAmount] = useState(2);
  const ITEMS_PER_PAGE = 4;
  const MAX_CARTS = 6;
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

  useEffect(() => {
    fetchMoreData();
    // setTimeout(() => {
    //   setLoading(false);
    // }, 3000); // hide loading after 3 seconds
  }, [refresh]);

  const fetchMoreData = async () => {
    try {
      const newData = await fetchUserData(page, ITEMS_PER_PAGE);
      // console.log("newData", newData);
      const combinedData = [...newData];
      const uniqueData = removeDuplicates(combinedData, "id");
      setRecentCarts(uniqueData);
      setPage((prevPage) => prevPage + 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
    if (cartAmount >= MAX_CARTS || cartAmount >= recentCarts.length) {
      setViewMore(false);
    } else if (cartAmount <= MAX_CARTS) {
      setViewMore(true);
    }
  }, [cartAmount, recentCarts]);

  if (loading)
    return (
      <View style={{ gap: 10 }}>
        <AvatarLayout />
        <AvatarLayout />
      </View>
    );

  return (
    <ScrollView className="bg-white pt-5">
      <View className="mx-3">
        <View>
          {loading ? (
            <Text className="text-center">Loading...</Text>
          ) : recentCarts.length === 0 ? (
            <Text
              fontType={"Nunito-ExtraBold"}
              className="text-center font-bold  text-base text-[#D5D5D5]"
            >
              Empty Cart
            </Text>
          ) : (
            recentCarts.slice(0, cartAmount).map((cart, index) => (
              <View key={index} className="flex flex-row w-100 h-55 my-3">
                <CartGrid cart={cart} />
              </View>
            ))
          )}
          {/* {recentCarts.length > 0 && (
            <Chevron fetchData={loadMore} viewMore={viewMore} />
          )} */}
          {recentCarts.length !== 0 ? (
            recentCarts.length > 2 ? (
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
