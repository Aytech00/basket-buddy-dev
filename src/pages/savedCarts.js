import React, { useEffect, useState, useContext, useRef } from "react";
import { View, TouchableOpacity, Animated } from "react-native";
import { Button } from "@rneui/themed";
import UserContext from "../lib/userContext";
import { supabase } from "../lib/supabase";
import useScreenListener from "../components/useScreenListener";
import Text from "../components/ui/Text";
//this is for keys
import uuid from "react-native-uuid";
import AddButton from "../components/AddButton";
import Product from "../components/Product";
import SavedCartSubtotal from "../components/SavedCartSubtotal";
import Chevron from "../components/ui/Chevron";
import MainHeaderContext from "../lib/MainHeaderContext";
import CartPageContext from "../lib/cartPageContext";
import { Icon } from "@rneui/themed";
import CartGrid from "../components/ui/cartGrid";
import { AvatarLayout } from "../components/SkeletonLoader";

export default function SavedCartsPage({ navigation }) {
  const [page, setPage] = useState(1);
  const [userData, setUserData] = useState();
  const { session } = useContext(UserContext);
  const [userID] = useState(session.user.id);
  const [recentCarts, setRecentCarts] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const itemsPerPage = 4; // Set how many items you want per page
  const { showHeader, setShowHeader } = useContext(MainHeaderContext);
  const { setCartPage } = useContext(CartPageContext);
  const [viewMore, setViewMore] = useState(true);
  const [viewMoreSavedItem, setViewMoreSavedItem] = useState(true);
  const [cartAmount, setCartAmount] = useState(2);
  const [savedItemAmount, setSavedItemAmount] = useState(2);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const [isLoadingRecentCarts, setIsLoadingRecentCarts] = useState(true);

  const MAX_CARTS = 6;
  useScreenListener("SavedCarts");
  useEffect(() => {
    if (showHeader === false) {
      setShowHeader(true);
      setCartPage(false);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data, error } = await supabase
          .from("Cart")
          .select()
          .eq("user_id", userID);

        if (error) throw new Error(error);
        if (data) {
          const updatedData = data.filter((cart) => cart.name !== null);
          setUserData(updatedData);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserData();
  }, [userID, page, refresh]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from("Cart")
        .select()
        .eq("user_id", userID)
        .limit(itemsPerPage * page); // Adjust the limit based on the page

      if (error) throw new Error(error);
      if (data) {
        const cartsWithNullName = data.filter((cart) => cart.name === null);

        setRecentCarts(cartsWithNullName);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoadingRecentCarts(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [userID, page, refresh]);

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

  const loadMoreSavedData = () => {
    setSavedItemAmount((prevAmount) => {
      if (viewMoreSavedItem) {
        if (prevAmount < MAX_CARTS) {
          return prevAmount + 2;
        }
        return 2; // Reset to 2 when the max is reached
      } else {
        return 2;
      }
    });
  };

  const generateUUID = () => uuid.v4();

  const refreshData = () => {
    setRefresh(!refresh); // This will trigger refreshes
  };

  // useScroll(scrollY, isSearchFocused);

  useEffect(() => {
    if (cartAmount >= MAX_CARTS || cartAmount >= recentCarts?.length) {
      setViewMore(false);
    } else if (cartAmount <= MAX_CARTS) {
      setViewMore(true);
    }
  }, [cartAmount, recentCarts]);

  useEffect(() => {
    if (savedItemAmount >= MAX_CARTS || savedItemAmount >= userData?.length) {
      setViewMoreSavedItem(false);
    } else if (cartAmount <= MAX_CARTS) {
      setViewMoreSavedItem(true);
    }
  }, [savedItemAmount, userData]);

  return (
    <>
      <View
        style={{
          backgroundColor: "#333333",
        }}
        className=" flex flex-row justify-between items-center p-4 shadow-lg"
      >
        <Text
          fontType={"Nunito-ExtraBold"}
          className="text-[32px] font-bold text-white grow mr-3"
        >
          Saved Carts
        </Text>

        <Button
          title={
            <Text className="text-[12px]" fontType={"Nunito-Bold"}>
              + New Saved Cart
            </Text>
          }
          onPress={() => {
            navigation.navigate("New Saved Cart", {
              refreshData,
              newCart: true,
            });
          }}
          color="#fff"
          titleStyle={{
            color: "#333",
            fontWeight: "bold",
            fontSize: 14,
          }}
          buttonStyle={{
            borderRadius: 5,
            padding: 5,
          }}
          containerStyle={{
            width: 130,
            borderRadius: 5,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </View>

      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        keyboardDismissMode="on-drag"
        className="bg-white pt-5"
      >
        <View>
          <View className="mb-20 mx-3">
            {userData ? (
              userData?.length === 0 ? (
                <Text
                  fontType={"Nunito-ExtraBold"}
                  className="text-center font-bold  text-base text-[#D5D5D5]"
                >
                  No saved carts
                </Text>
              ) : (
                <>
                  {userData.slice(0, savedItemAmount).map((cart) => (
                    <View
                      key={cart.id}
                      onPress={() => {
                        navigation.navigate("New Saved Cart", {
                          cartID: cart.id,
                          refreshData,
                          recentCarts,
                        });
                      }}
                      className="my-3"
                    >
                      <CartGrid cart={cart} refreshData={refreshData} />
                    </View>
                  ))}

                  {userData?.length !== 0 ? (
                    userData?.length > 2 ? (
                      <Chevron
                        fetchData={loadMoreSavedData}
                        viewMore={viewMoreSavedItem}
                      />
                    ) : (
                      <></>
                    )
                  ) : (
                    <Text
                      fontType={"Nunito-ExtraBold"}
                      className="text-center font-bold  text-base text-[#D5D5D5]"
                    >
                      No Recent Carts
                    </Text>
                  )}
                </>
              )
            ) : (
              // <Text>Loading user data...</Text>
              <View style={{ gap: 10, width: "100%", paddingHorizontal: 10 }}>
                <AvatarLayout />
                <AvatarLayout />
              </View>
            )}
            <Text
              fontType={"Nunito-ExtraBold"}
              className="text-3xl font-bold text-center my-10"
            >
              Recent Carts
            </Text>

            <View>
              {isLoadingRecentCarts ? (
                <View style={{ gap: 10, width: "100%", paddingHorizontal: 10 }}>
                  <AvatarLayout />
                  <AvatarLayout />
                </View>
              ) : recentCarts ? (
                recentCarts.slice(0, cartAmount).map((cartNoName) => (
                  <View
                    key={generateUUID()}
                    className="flex flex-row w-100 my-3 justify-between "
                  >
                    <CartGrid cart={cartNoName} />
                  </View>
                ))
              ) : (
                <Text>No Recent carts added</Text>
              )}
              {/* {recentCarts.length !== 0 ? (
              <Chevron fetchData={loadMore} viewMore={viewMore} />
            ) : (
              <Text
                fontType={"Nunito-ExtraBold"}
                className="text-center font-bold  text-base text-[#D5D5D5]"
              >
                No Recent Carts
              </Text>
            )} */}
              {recentCarts?.length !== 0 ? (
                recentCarts?.length > 2 ? (
                  <Chevron fetchData={loadMore} viewMore={viewMore} />
                ) : (
                  <></>
                )
              ) : isLoadingRecentCarts ? (
                <></>
              ) : (
                <Text
                  fontType={"Nunito-ExtraBold"}
                  className="text-center font-bold  text-base text-[#D5D5D5]"
                >
                  No Recent Carts
                </Text>
              )}
            </View>
          </View>
        </View>
      </Animated.ScrollView>
    </>
  );
}
