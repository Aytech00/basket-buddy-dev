import React, { useState } from "react";
import { Icon } from "@rneui/themed";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import Text from "./Text";

export default function Chevron({ fetchData, viewMore }) {
  const [loading, setLoading] = useState(false);

  const handleFetchData = async () => {
    setLoading(true);
    await fetchData();
    setLoading(false);
  };

  return (
    <TouchableOpacity onPress={handleFetchData}>
      <View className="w-full flex flex-row justify-center items-center mt-8">
        {loading ? (
          <ActivityIndicator size="small" color="#D5D5D5" />
        ) : (
          <>
            <Text
              fontType={"Nunito-ExtraBold"}
              className="text-center font-bold  text-base text-[#D5D5D5]"
            >
              {viewMore ? "View More" : "View Less"}
            </Text>
            {viewMore ? (
              <Icon
                name="chevron-down-outline"
                type="ionicon"
                color="#D5D5D5"
                size={30}
                // iconStyle={{
                //   boxShadow: "0px 2px 2px 0px #00000040",
                // }}
              />
            ) : (
              <Icon
                name="chevron-up-outline"
                type="ionicon"
                color="#D5D5D5"
                size={30}
                // iconStyle={{
                //   boxShadow: "0px 2px 2px 0px #00000040",
                // }}
              />
            )}
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
