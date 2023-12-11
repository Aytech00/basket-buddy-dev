import { useState, useEffect, useContext, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  StyleSheet,
  View,
  Alert,
  Pressable,
  Image,
  Animated,
  Text as NativeText,
  TouchableOpacity,
} from "react-native";
import { Button } from "@rneui/base";
import Text from "../components/ui/Text";
import Avatar from "../components/Avatar";
import * as Linking from "expo-linking";
import { useNavigation } from "@react-navigation/native";
import MainHeaderContext from "../lib/MainHeaderContext";
import CartPageContext from "../lib/cartPageContext";
import { AvatarContext } from "../lib/avatarContext";
import useScreenListener from "../components/useScreenListener";
import { PremiumContext } from "../lib/premiumContext";
import UserContext from "../lib/userContext";

export default function Account({ route }) {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const { showHeader, setShowHeader } = useContext(MainHeaderContext);
  const { cartPage, setCartPage } = useContext(CartPageContext);
  const { avatar } = useContext(AvatarContext);
  const [profiles, setProfiles] = useState();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);
  const { setPremium, premium } = useContext(PremiumContext);
  const { setIndex } = useContext(UserContext);

  const { sessionID, session } = route.params.props;
  const navigation = useNavigation();
  useScreenListener("Account");

  useEffect(() => {
    navigation.setOptions({
      handleAvatar: (url) => {
        setAvatarUrl(url);
      },
    });
  }, []);

  useEffect(() => {
    if (session) {
      getProfile();
    }
  }, [session]);

  useEffect(() => {
    if (showHeader === false) {
      setShowHeader(true);
      setCartPage(false);
    }

    const getProfiles = async () => {
      let { data: profiles, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        console.error(error);
      }

      if (profiles) {
        setProfiles(profiles);
      }
    };

    getProfiles();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      let { data, error, status } = await supabase
        .from("profiles")
        .select(`username, avatar_url`)
        .eq("id", session?.user.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setUsername(data.username);
        setAvatarUrl(data.avatar_url);
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  // useScroll(scrollY, isSearchFocused);

  async function updateProfile({ username, avatar_url }) {
    try {
      setLoading(true);
      if (!session?.user) throw new Error("No user on the session!");

      const updates = {
        id: session?.user.id,
        username,
        avatar_url,
        updated_at: new Date(),
      };

      let { error } = await supabase.from("Profiles").upsert(updates);

      if (error) {
        throw error;
      }
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <View
        style={{ backgroundColor: "#333333" }}
        className=" flex flex-row justify-between items-center p-4 shadow-lg"
      >
        <Text
          fontType="Nunito-ExtraBold"
          className="text-3xl font-bold text-white grow mr-3"
        >
          Your Account
        </Text>
      </View>
      <Animated.ScrollView
        ref={scrollViewRef}
        className="bg-white"
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        keyboardDismissMode="on-drag"
      >
        <View className="flex flex-row  w-screen h-1/6  justify-between my-4">
          <View className="w-1/6 h-auto mx-auto my-auto ">
            {avatarUrl ? (
              <Image
                source={{ uri: avatar }}
                className="aspect-square w-full h-auto rounded-2xl"
              />
            ) : (
              <Avatar />
            )}
          </View>
          <View className="pl-2 pt-2 my-auto mx-auto">
            <Text
              fontType="Nunito-ExtraBold"
              className="text-black text-xs w-100"
            >
              {session?.user?.email}
            </Text>
            <Text fontType="Nunito">
              Joined{" "}
              {new Date(session?.user?.created_at).toLocaleString("default", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Text>
          </View>

          <View className="mr-3 w-auto h-auto flex flex-col justify-center items-center ">
            <TouchableOpacity
              onPress={() => {
                navigation.navigate("Edit Page");
              }}
              style={{
                minHeight: 25,
                width: "100%",
                padding: 10,
                borderRadius: 5,
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: 10,
                marginBottom: 10,
                backgroundColor: "white",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 5,
              }}
            >
              <NativeText
                style={{
                  color: "#111111",
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                Edit Account
              </NativeText>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-col flex">
          <View className="flex justify-center items-center">
            <View className="text-center w-80 h-0.5 m5-5 bg-[#E2E2E2]"></View>
          </View>
          <Text
            fontType="Nunito"
            className=" text-lg font-bold text-black pl-5 m-2"
          >
            Privacy Policy
          </Text>
          <View className="flex justify-center items-center">
            <View className="text-center w-80 h-0.5 m5-5 bg-[#E2E2E2]"></View>
          </View>
          <Pressable
            onPress={() => Linking.openURL("https://basketbuddy.app/")}
          >
            <Text
              fontType="Nunito"
              className=" text-lg font-bold text-black pl-5 m-2"
            >
              About Basket Buddy
            </Text>
          </Pressable>
        </View>

        <View style={styles.container}>
          <View style={styles.verticallySpaced}>
            <Button
              title={premium ? "Deactivate Premium" : "Activate Premium"}
              onPress={async () => {
                setPremium(!premium);
              }}
              color="#313131"
              containerStyle={{
                marginTop: 20,
              }}
            />
          </View>

          <View style={styles.verticallySpaced}>
            <Button
              color="#313131"
              containerStyle={{
                marginTop: 20,
              }}
              title="Sign Out"
              onPress={async () => {
                await supabase.auth.signOut();
                setIndex(1);
              }}
            />
          </View>
        </View>
      </Animated.ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 12,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    // alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
});
