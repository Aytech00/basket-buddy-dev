import React from "react";
import { ScrollView, View, Text } from "react-native";
import { Icon } from "@rneui/themed";
import Product from "../components/Product";
//this is for keys
import uuid from "react-native-uuid";
import SavedCartSubtotal from "../components/SavedCartSubtotal";
import AddButton from "../components/AddButton";

export default function savedCartsLoader({
  userData,
  recentCarts,
  navigation,
  onSubtotalChange,
}) {
  // Assuming carts is your array of cart objects
  return (
    <ScrollView className="bg-white pt-5">
      <View className="mx-auto ">
        <View className="mb-20">
          {userData ? (
            userData.map((cart) => (
              <View
                key={uuid.v4()}
                className="flex flex-row flex-wrap w-100 m-3 h-auto "
              >
                {/* Image */}
                <View
                  className={`flex flex-wrap flex-row border-2 border-black w-1/4  justify-center items-center`}
                >
                  {cart.products_array.slice(0, 4).map((id) => {
                    return (
                      <View
                        key={uuid.v4()}
                        className={` w-2/4   ${
                          cart.products_array.length === 1 ? "h-20 " : "h-2/4"
                        } flex flex-row justify-center items-center`}
                      >
                        <Product productId={id} />
                      </View>
                    );
                  })}
                </View>

                <View className=" w-2/4 h-full pl-5 mb-1">
                  <Text className="flex flex-row flex-wrap text-left text-xl font-bold truncate">
                    {cart.name}
                    {/*Price here*/}
                  </Text>
                  <View>
                    <SavedCartSubtotal cartId={cart.id} />
                  </View>

                  {/*text */}
                  <View>
                    {cart.products_array.slice(0, 2).map((id) => {
                      return (
                        <View key={uuid.v4()}>
                          <Product productId={id} text={true} />
                        </View>
                      );
                    })}
                  </View>
                </View>
                <View className=" flex  w-1/4  justify-center items-center">
                  <AddButton cartID={cart.id} navigation={navigation} />
                </View>
              </View>
            ))
          ) : (
            <Text>Loading user data...</Text>
          )}
          <Text
            fontType={"Nunito-ExtraBold"}
            className="text-2xl font-bold text-center my-10"
          >
            Recent Carts
          </Text>

          {recentCarts ? (
            recentCarts.map((cartNoName) => (
              <View
                key={uuid.v4()}
                className="flex flex-row flex-wrap w-100 m-3 h-auto"
              >
                {/* Image */}
                <View
                  className={`flex flex-wrap flex-row border-2 border-black w-1/4  justify-center items-center`}
                >
                  {cartNoName.products_array.slice(0, 4).map((id) => {
                    return (
                      <View
                        key={uuid.v4()}
                        className={` w-2/4   ${
                          cartNoName.products_array.length === 1
                            ? "h-full "
                            : "h-2/4"
                        } flex flex-row justify-center items-center`}
                      >
                        <Product productId={id} />
                      </View>
                    );
                  })}
                </View>

                <View className=" w-2/4 h-full pl-5 mb-1">
                  <Text className="flex flex-row text-left text-xl font-bold truncate">
                    {cartNoName.created_date}
                    <View>
                      <SavedCartSubtotal cartId={cartNoName.id} />
                    </View>
                  </Text>

                  {/*text */}
                  <View>
                    {cartNoName.products_array.slice(0, 2).map((id) => {
                      return (
                        <View key={uuid.v4()}>
                          <Product productId={id} text={true} />
                        </View>
                      );
                    })}
                  </View>
                </View>
                <View className=" flex  w-1/4  justify-center items-center">
                  <AddButton cartID={cartNoName.id} navigation={navigation} />
                </View>
              </View>
            ))
          ) : (
            <Text>No Recent carts added</Text>
          )}
          <View className="w-full flex flex-row justify-center items-center mt-5">
            <Text className="text-center text-base text-[#D5D5D5]">
              View More
            </Text>
            <Icon
              name="chevron-down-outline"
              type="ionicon"
              color="#D5D5D5"
              size={30}
              // iconStyle={{
              //   boxShadow: "0px 2px 2px 0px #00000040",
              // }}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
