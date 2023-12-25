import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, Platform, StatusBar, ImageBackground } from "react-native";
import {
  NavigationContainer,
  createNavigationContainerRef,
} from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Tab } from "@rneui/themed";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import UserContext from "./src/lib/userContext";
import { CartProvider } from "./src/lib/cartContext";
import { SavedCartProvider } from "./src/lib/SavedCartContext";
import HomePage from "./src/pages/home";
import SavedCartsPage from "./src/pages/savedCarts";
import AccountPage from "./src/pages/account";
import Auth from "./src/components/auth";
import NewSavedCart from "./src/pages/NewSavedCart";
import MainHeader from "./src/components/ui/MainHeader";
import { MainHeaderProvider } from "./src/lib/MainHeaderContext";
import { supabase } from "./src/lib/supabase";
import { Buffer } from "buffer";
import DoneShopping from "./src/pages/DoneShopping";
import * as Linking from "expo-linking";
import StoresNearYou from "./src/pages/StoresNearYou";
import PasswordResetScreen from "./src/pages/PasswordResetScreen";
import EditPage from "./src/pages/EditPage";
import { CartPageProvider } from "./src/lib/cartPageContext";
import { AvatarProvider } from "./src/lib/avatarContext";
import { PremiumProvider } from "./src/lib/PremiumContext";
import { SearchProvider, useSearchContext } from "./src/lib/SearchBarContext";
import { GestureHandlerRootView } from "react-native-gesture-handler";

global.Buffer = Buffer;

SplashScreen.preventAutoHideAsync();

const prefix = Linking.createURL("/");

export default function App() {
  const Stack = createNativeStackNavigator();
  const navigationRef = createNavigationContainerRef();
  const [index, setIndex] = useState(1);
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState("");
  const [isSearchFocused, setSearchFocus] = useState(false);
  const [resetPwd, setResetPwd] = useState(false);
  const [highestPrice, setHighestPrice] = useState();
  const [highestStore, setHighestStore] = useState(0);
  const [cartPage, setCartPage] = useState(false);
  const searchRef = useRef();

  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        Recovery: "/ResetPassword",
      },
    },
  };

  useEffect(() => {
    const clearSecureStore = async () => {
      try {
        await SecureStore.deleteItemAsync("key1");
        await SecureStore.deleteItemAsync("key2");
        // Add more keys as needed

        console.log("SecureStore cleared successfully.");
      } catch (error) {
        console.log("Failed to clear SecureStore:", error);
      }
    };

    clearSecureStore();
  }, []);

  const handlePwdReset = (state) => {
    setResetPwd(state);
  };

  const [fontsLoaded] = useFonts({
    Nunito: require("./assets/fonts/Nunito.ttf"),
  });

  const statusBarHeight = StatusBar.currentHeight || 0;

  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session.user);
      setIndex(1);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      console.log(_event);
      setSession(session);
    });
  }, []);

  useEffect(() => {
    setIndex(1);
  }, [session]);

  function navigate(name, params) {
    if (navigationRef.isReady()) navigationRef.navigate(name, params);
  }

  const setCurrentPage = (i) => {
    let newPageName;

    // if (i === index) {
    //   return;
    // }

    switch (i) {
      case 0:
        newPageName = "SavedCarts";
        break;
      case 1:
        newPageName = "Home";
        break;
      case 2:
        newPageName = "Account";
        break;
      case 3:
        newPageName = "Reset Passoword";
        break;
      default:
        console.error("Unknown tab index");
        return;
    }

    setIndex(i);
    navigate(newPageName, {});
  };

  const onLayoutSafeArea = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setIndex(1);
      setCurrentPage(1); // homepage is default
    }
  }, [fontsLoaded]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#333333" }}
      className="bg-gray-300"
      edges={["top"]}
      onLayout={onLayoutSafeArea}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ImageBackground
          source={require("./assets/images/header.png")}
          className="h-1/6 "
        >
          <UserContext.Provider
            value={{
              user,
              session,
              search,
              setSearch,
              searchRef,
              isSearchFocused,
              setSearchFocus,
              setIndex,
              setHighestPrice,
              highestPrice,
              highestStore,
              setHighestStore,
              cartPage,
              setCartPage,
            }}
          >
            <PremiumProvider>
              <SearchProvider>
                <CartProvider>
                  <SavedCartProvider>
                    <CartPageProvider>
                      {/* Provider is added here */}
                      <MainHeaderProvider>
                        <AvatarProvider>
                          <NavigationContainer
                            fallback={<Text>Loading...</Text>}
                            ref={navigationRef}
                            linking={linking}
                          >
                            {session && session.user ? (
                              <View
                                style={{
                                  paddingTop:
                                    Platform.OS === "android" ? 10 : 0,
                                }}
                                className="h-screen"
                              >
                                <MainHeader />
                                {/* { for the satus bar 
                              navigationOptions: {
                                headerStyle: {
                                  marginTop: Constants.statusBarHeight,
                                },
                              },
                            } */}
                                <View className="grow">
                                  <React.Fragment>
                                    <Stack.Navigator
                                      screenOptions={{
                                        headerShown: false,
                                        animation: "fade",
                                      }}
                                    >
                                      <Stack.Screen
                                        name="Home"
                                        component={HomePage}
                                      />

                                      <Stack.Screen
                                        name="Done Shopping"
                                        component={DoneShopping}
                                      />
                                      <Stack.Screen
                                        name="SavedCarts"
                                        component={SavedCartsPage}
                                      />
                                      <Stack.Screen
                                        name="Edit Page"
                                        component={EditPage}
                                      />
                                      <Stack.Screen
                                        name="Stores Near You"
                                        component={StoresNearYou}
                                        // initialParams={{
                                        //   screenHandler: screenHandler,
                                        // }}
                                      />
                                      <Stack.Screen
                                        name="Account"
                                        component={AccountPage}
                                        initialParams={{
                                          props: {
                                            sessionID: session.user.id,
                                            session: session,
                                          },
                                        }}
                                      />

                                      <Stack.Screen
                                        name="New Saved Cart"
                                        component={NewSavedCart}
                                      />

                                      <Stack.Screen
                                        name="Reset Passoword"
                                        component={PasswordResetScreen}
                                      />
                                    </Stack.Navigator>
                                  </React.Fragment>
                                </View>

                                <View
                                  className={`${
                                    Platform.OS !== "android" && "mb-5"
                                  } bg-white`}
                                >
                                  <Tab
                                    className="absolute bottom-0 z-10 w-full"
                                    value={index}
                                    onChange={(e) => {
                                      console.log("Hello");
                                      setCurrentPage(e);
                                      setSearch("");
                                      setSearchFocus(false);
                                      setCartPage(false);
                                      searchRef?.current?.blur();
                                    }}
                                    style={{ elevation: 1 }}
                                    indicatorStyle={{
                                      // backgroundColor: "#333",
                                      // height: 4,
                                      // borderTopLeftRadius: 4,
                                      // width: "33%",
                                      // borderTopRightRadius: 4,
                                      // bottom: "100%",
                                      display: "none",
                                    }}
                                    variant="default"
                                  >
                                    <Tab.Item
                                      title="Saved Carts"
                                      titleStyle={{
                                        fontSize: 10,
                                        color: "#333",
                                      }}
                                      icon={{
                                        name: "cart-outline",
                                        type: "ionicon",
                                        color: "#333",
                                        size: 32,
                                      }}
                                      containerStyle={() => ({
                                        backgroundColor: "white",
                                      })}
                                      buttonStyle={(active) => ({
                                        backgroundColor: "white",
                                        borderTopWidth: 4,
                                        borderBottomWidth: 4,
                                        borderColor: "white",
                                        borderTopColor: active
                                          ? "#333"
                                          : "white",
                                        borderTopLeftRadius: 4,
                                        borderTopRightRadius: 4,
                                      })}
                                    />

                                    <Tab.Item
                                      title="Home"
                                      titleStyle={{
                                        fontSize: 10,
                                        color: "#333",
                                      }}
                                      icon={{
                                        name: "home-outline",
                                        type: "ionicon",
                                        color: "#333",
                                        size: 28,
                                      }}
                                      containerStyle={() => ({
                                        backgroundColor: "white",
                                      })}
                                      buttonStyle={(active) => ({
                                        backgroundColor: "white",
                                        borderTopWidth: 4,
                                        borderBottomWidth: 4,
                                        borderColor: "white",
                                        borderTopColor: active
                                          ? "#333"
                                          : "white",
                                        borderTopLeftRadius: 4,
                                        borderTopRightRadius: 4,
                                      })}
                                    />

                                    <Tab.Item
                                      title="Account"
                                      titleStyle={{
                                        fontSize: 10,
                                        color: "#333",
                                      }}
                                      icon={{
                                        name: "person-outline",
                                        type: "ionicon",
                                        color: "#333",
                                        size: 32,
                                      }}
                                      containerStyle={() => ({
                                        backgroundColor: "white",
                                      })}
                                      buttonStyle={(active) => ({
                                        backgroundColor: "white",
                                        borderTopWidth: 4,
                                        borderBottomWidth: 4,
                                        borderColor: "white",
                                        borderTopColor: active
                                          ? "#333"
                                          : "white",
                                        borderTopLeftRadius: 4,
                                        borderTopRightRadius: 4,
                                      })}
                                    />
                                  </Tab>
                                  <View className="bg-white w-full h-10 absolute bottom-[-40]"></View>
                                </View>
                              </View>
                            ) : (
                              <Auth resetPwd={handlePwdReset} />
                            )}
                          </NavigationContainer>
                        </AvatarProvider>
                      </MainHeaderProvider>
                    </CartPageProvider>
                  </SavedCartProvider>
                </CartProvider>
              </SearchProvider>
            </PremiumProvider>
          </UserContext.Provider>
        </ImageBackground>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}
