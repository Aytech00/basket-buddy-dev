import React, { useEffect, useState, useContext, useRef } from "react";
import { View, Animated } from "react-native";
import UserContext from "../lib/userContext";
import { supabase } from "../lib/supabase";
import Text from "../components/ui/Text";
import RecentProducts from "../components/RecentProducts";
import { StatusBar } from "react-native";
import SavedCartsDisplay from "../components/SavedCartsDisplay";
import RecentCartsDisplay from "../components/RecentCartsDisplay";
import { SafeAreaView } from "react-native-safe-area-context";
import MainHeaderContext from "../lib/MainHeaderContext";
import useScreenListener from "../components/useScreenListener";
export default function HomePage({ navigation, route }) {
  const [userData, setUserData] = useState([]);
  const { session } = useContext(UserContext);
  const [userID, setUserID] = useState(session.user.id);
  const ITEMS_PER_PAGE = 10; // You can change this as per your requirements
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const { showHeader, setShowHeader } = useContext(MainHeaderContext);

  useScreenListener("Home");
  useEffect(() => {
    if (showHeader === false) {
      setShowHeader(true);
    }
  }, []);
  useEffect(() => {
    fetchUserData(0, ITEMS_PER_PAGE).then((data) => {
      setUserData(data);
    });
  }, []);

  const fetchUserData = async (page, itemsPerPage) => {
    const { data, error } = await supabase
      .from("Cart")
      .select()
      .eq("user_id", userID)
      .is("name", null)
      .range(0, 5);

    console.log("DATA");
    // console.log(data);
    if (error) {
      console.error("Error fetching user data:", error.message);
      return [];
    }
    if (data) {
      return data;
    }
  };

  useEffect(() => {
    fetchUserData(0, ITEMS_PER_PAGE).then((data) => {
      setUserData(data);
    });
  }, []);

  const fetchUserDataSavedCarts = async (page, itemsPerPage) => {
    const { data, error } = await supabase
      .from("Cart")
      .select()
      .eq("user_id", userID)
      .not("name", "eq", null);

    if (error) {
      console.error("Error fetching user data:", error.message);
      return [];
    }
    if (data) {
      return data;
    }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
      <View className="bg-white h-screens">
        <Animated.ScrollView
          ref={scrollViewRef}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          keyboardDismissMode="on-drag"
        >
          <View className="p-2 ">
            <Text
              fontType={"Nunito-ExtraBold"}
              className="text-3xl font-bold text-center m-5"
            >
              Recent Products
            </Text>
            <RecentProducts />
          </View>

          <View className="p-2 h-auto">
            <Text
              fontType={"Nunito-ExtraBold"}
              className="text-3xl font-bold text-center m-5"
            >
              Saved Carts
            </Text>
            <SavedCartsDisplay
              fetchUserData={fetchUserDataSavedCarts}
              navigation={navigation}
            />
          </View>

          <View className="p-2 ">
            <Text
              fontType={"Nunito-ExtraBold"}
              className="text-3xl font-bold text-center m-5"
            >
              Recent Carts
            </Text>
            <RecentCartsDisplay
              fetchUserData={fetchUserData}
              navigation={navigation}
            />
          </View>

          <StatusBar style="auto" />
        </Animated.ScrollView>
      </View>
    </SafeAreaView>
  );
}
