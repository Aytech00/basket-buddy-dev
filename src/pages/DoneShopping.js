import React, { useRef, useEffect, useState, useContext } from "react";
import { StyleSheet, View, Image, Animated, ScrollView } from "react-native";
import { Button } from "@rneui/base";
import DoneShoppingDisplay from "./DoneShoppingDisplay";
import Text from "../components/ui/Text";
import { CartContext } from "../lib/cartContext";
import { useNavigation } from "@react-navigation/native";
import MainHeaderContext from "../lib/MainHeaderContext";
import CartPageContext from "../lib/cartPageContext";
import { SavedCartContext } from "../lib/SavedCartContext";
import Dollar from "../../assets/images/dollar.png";
import Glen from "../../assets/images/glenn-happy.png";
import UserContext from "../lib/userContext";
export default function DoneShopping({ route }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [cartId, setCartId] = useState(route.params.cartID);
  const [saved, setSaved] = useState();
  const { clearCart } = useContext(CartContext);
  const { setShowHeader } = useContext(MainHeaderContext);
  const { setCartPage } = useContext(UserContext);
  const { clearsavedCart } = useContext(SavedCartContext);

  const navigation = useNavigation();

  useEffect(() => {
    setCartId(route.params.cartID);
    setSaved(route.params.savings);
    startAnimation();
  }, []);

  const startAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: -30,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleHeader = () => {
    clearsavedCart();
    clearCart();
    setCartPage(false);
    navigation.navigate("Home");
    setShowHeader(true);
  };

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <ScrollView contentContainerStyle={styles.container} className=" bg-white">
      <View className="mt-20">
        <Animated.Image
          style={[{ transform: [{ translateY }] }, styles.dollar]}
          source={Dollar}
          className="mx-auto"
        />

        <Image style={styles.glen} source={Glen} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.text} fontType="Nunito-ExtraBold">
          You Saved
        </Text>

        <Text
          fontType="Nunito-ExtraBold"
          className="text-[#6ECB33] text-[45px]"
        >
          ${Math.abs(saved)}
        </Text>

        <Text style={styles.text} fontType="Nunito-ExtraBold">
          this trip!
        </Text>
      </View>

      <View>
        <Text style={styles.scrollText} fontType="Nunito-Italic">
          Want to save your cart for next time? Scroll down
        </Text>
        <Button
          onPress={() => {
            handleHeader();
          }}
          title={
            <Text fontType="Nunito-Bold" className="text-white">
              All done. Thanks Glenn!
            </Text>
          }
          color="#313131"
          containerStyle={styles.buttonContainer}
        />
      </View>

      <View className="mt-10">
        <DoneShoppingDisplay id={cartId} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  glen: {
    width: 270,
    height: 163,
  },
  dollar: {
    width: 66,
    height: 66,
  },
  textContainer: {
    marginTop: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    textAlign: "center",
  },
  scrollText: {
    color: "#A4A4A4",
    textAlign: "center",
  },
  buttonContainer: {
    marginTop: 20,
  },
});
