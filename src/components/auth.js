import React, { useState, useEffect } from "react";
import { Alert, StyleSheet, View, Image, Text } from "react-native";
import { supabase } from "../lib/supabase";
import { Button, Input } from "@rneui/themed";
import { makeRedirectUri } from "expo-auth-session";
import { supabaseUrl } from "../lib/supabase";
import * as Linking from "expo-linking";
import Constants from "expo-constants";
import Google from "./Google";
import Facebook from "./Facebook";

export default function Auth({ resetPwd }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState("login");
  const [newPassword, setNewPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [confirmedTokens, setConfirmedTokens] = useState();
  const url = Linking.useURL();
  const [userInfo, setUserInfo] = useState();
  const SCHEME = Constants.manifest.scheme;
  const useProxy = Constants.appOwnership === "expo" && Platform.OS !== "web";

  const platformSpecificJustify =
    Platform.OS === "ios" ? "justify-stretch" : "justify-start";

  useEffect(() => {
    if (url) {
      // Extract the fragment part of the URL
      const fragmentIndex = url.indexOf("#");
      const fragment = url.slice(fragmentIndex + 1);

      // Split the fragment into key-value pairs
      const keyValuePairs = fragment.split("&");

      let typeValue = null;
      let accessToken = null;
      let refreshToken = null;

      // Find the "type" parameter and retrieve its value
      keyValuePairs.forEach((pair) => {
        const [key, value] = pair.split("=");
        if (key === "type") {
          typeValue = value;
        }
      });

      if (typeValue === "signup") {
        keyValuePairs.forEach((pair) => {
          const [key, value] = pair.split("=");
          if (key === "access_token") {
            accessToken = value;
          } else if (key === "refresh_token") {
            refreshToken = value;
          }
        });

        setAccountType("confirmed");
        let token = {
          accessToken,
          refreshToken,
        };

        supabase.auth.setSession({
          access_token: token.accessToken,
          refresh_token: token.refreshToken,
        });

        const session = async () => {
          const { data, error } = supabase.auth.getSession();
          if (error) console.log(error);
          // if (data) console.log(data);
        };

        session();

        setConfirmedTokens(token);
      } else if (typeValue == "recovery") {
        keyValuePairs.forEach((pair) => {
          const [key, value] = pair.split("=");
          if (key === "access_token") {
            accessToken = value;
          } else if (key === "refresh_token") {
            refreshToken = value;
          }
        });

        let token = {
          accessToken,
          refreshToken,
        };

        setConfirmedTokens(token);
        try {
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
        } catch (error) {
          console.log(error);
        }

        setAccountType("Set New Password");
      }
    }
  }, [url]);

  const updateUser = async () => {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) console.log(error);
  };

  const updateNewPassword = () => {
    if (newPassword !== rePassword) {
      Alert.alert("Passwords do not match");
    } else if (newPassword === "" && rePassword === "") {
      Alert.alert("Please fill out fields");
    } else if (newPassword == rePassword) {
      confirmedTokens;
      try {
        supabase.auth.setSession({
          access_token: confirmedTokens.accessToken,
          refresh_token: confirmedTokens.refreshToken,
        });
      } catch (error) {
        console.log(error);
      } finally {
        updateUser();
        Alert.alert("Passwords Match!");
      }
    }
  };

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert(error.message);

    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert(error.message);
      console.log(error);
    } else if (!error) {
      Alert.alert(
        "Confirmation Email has been sent",
        "Please confirm your email"
      );
    }
    setLoading(false);
  }

  const startForgetPassword = async () => {
    const redirectUrl = makeRedirectUri({
      native: `${SCHEME}://redirect`,
      useProxy,
      // path: "/recovery",
    });
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) {
      console.log(error);
    } else if (data) {
      Alert.alert(
        "Password Recovery has been sent",
        "Please follow the instructions in the email to reset your password"
      );
    }
  };

  const socialAuthComponent = () => {
    return (
      <View className="flex flex-row items-center justify-center">
        <Google />
        <Facebook />
      </View>
    );
  };

  return (
    <View className="bg-white h-screen  py-12 w-screen">
      <View className="m-4 ">
        {/* page title */}
        <Text className="capitalize text-2xl font-bold text-center">
          {accountType}
        </Text>

        <View className="mt-10">
          {accountType === "login" || accountType === "sign up" ? (
            <View
              className={`flex flex-col justify-${platformSpecificJustify}`}
            >
              {/* Social Auth Buttons */}
              {socialAuthComponent()}

              {/* ---OR--- */}
              <View className="flex flex-row items-center justify-center my-3">
                <View className="bg-gray-300 h-px grow"></View>
                <Text className="mx-2 pb-1 text-gray-400">or</Text>
                <View className="bg-gray-300 h-px grow"></View>
              </View>

              {/* Email Input */}
              <View className="flex flex-col items-center justify-strech w-full mb-2">
                <Input
                  onChangeText={(text) => setEmail(text)}
                  value={email}
                  placeholder="email@address.com"
                  autoCapitalize={"none"}
                  inputStyle={styles.input}
                  inputContainerStyle={{ borderBottomWidth: 0 }}
                  containerStyle={styles.inputContainer}
                />

                {/* Password Input */}
                <Input
                  onChangeText={(text) => setPassword(text)}
                  value={password}
                  secureTextEntry={true}
                  placeholder="Password"
                  autoCapitalize={"none"}
                  inputStyle={styles.input}
                  inputContainerStyle={{ borderBottomWidth: 0 }}
                  containerStyle={styles.inputContainer}
                />
              </View>

              {accountType === "login" ? (
                <View className="flex flex-col justify-strech">
                  <Button
                    title="Login"
                    color="#313131"
                    containerStyle={{ marginBottom: 8 }}
                    disabled={loading}
                    loading={loading}
                    onPress={() => signInWithEmail()}
                  />

                  <Button
                    raised
                    title="Forgot Password"
                    color="#fff"
                    titleStyle={{
                      color: "#333",
                    }}
                    onPress={() => {
                      setAccountType("forgot password");
                    }}
                  />

                  <Text className="text-gray-600 text-center mt-10">
                    Don't have an account?{" "}
                    <Text
                      className="font-bold"
                      onPress={() => {
                        setAccountType("sign up");
                      }}
                    >
                      Sign Up
                    </Text>
                  </Text>
                </View>
              ) : (
                ""
              )}
              {accountType === "sign up" ? (
                <View className="flex flex-col justify-strech">
                  <Button
                    title="Sign Up"
                    color="#313131"
                    disabled={loading}
                    loading={loading}
                    onPress={() => signUpWithEmail()}
                  />

                  <Text className="text-gray-600 text-center mt-10">
                    Already have an account?{" "}
                    <Text
                      className="font-bold"
                      onPress={() => {
                        setAccountType("login");
                      }}
                    >
                      Login
                    </Text>
                  </Text>
                </View>
              ) : (
                ""
              )}
            </View>
          ) : (
            ""
          )}
        </View>

        {accountType === "forgot password" ? (
          <View className="flex flex-col justify-strech">
            <Text className="mb-3">
              Add your email here and we will send you a link to reset your
              password.
            </Text>

            <Input
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="email@address.com"
              autoCapitalize={"none"}
              inputStyle={styles.input}
              inputContainerStyle={{ borderBottomWidth: 0 }}
              containerStyle={styles.inputContainer}
            />

            <Button
              title="Send Link"
              color="#313131"
              disabled={loading || email === ""}
              loading={loading}
              onPress={() => startForgetPassword()}
            />

            <Text className="text-gray-600 text-center mt-10">
              Already have an account?{" "}
              <Text
                className="font-bold"
                onPress={() => {
                  setAccountType("login");
                }}
              >
                Login
              </Text>
            </Text>
          </View>
        ) : (
          ""
        )}

        {accountType === "update password" ? (
          <View className="flex flex-col justify-strech">
            <Input
              onChangeText={(text) => setEmail(text)}
              value={user.email}
              autoCapitalize={"none"}
              inputStyle={styles.input}
              inputContainerStyle={{ borderBottomWidth: 0 }}
              containerStyle={styles.inputContainer}
              disabled={true}
            />

            <Input
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={true}
              placeholder="Password"
              autoCapitalize={"none"}
              inputStyle={styles.input}
              inputContainerStyle={{ borderBottomWidth: 0 }}
              containerStyle={styles.inputContainer}
            />

            <Button
              title="Update Password"
              color="#313131"
              disabled={loading}
              loading={loading}
              onPress={() => updatePassword()}
            />

            <Text className="text-gray-600 text-center mt-10">
              Already have an account?{" "}
              <Text
                className="font-bold"
                onPress={() => {
                  setAccountType("login");
                }}
              >
                Login
              </Text>
            </Text>
          </View>
        ) : (
          ""
        )}

        {accountType === "Set New Password" ? (
          <View className="flex flex-col justify-strech">
            <View>
              <Input
                value={email}
                placeholder="email@address.com"
                autoCapitalize={"none"}
                inputStyle={styles.input}
                inputContainerStyle={{ borderBottomWidth: 0 }}
                containerStyle={styles.inputContainer}
              />

              <Input
                onChangeText={(text) => setNewPassword(text)}
                value={newPassword}
                placeholder="New Password"
                autoCapitalize={"none"}
                inputStyle={styles.input}
                inputContainerStyle={{ borderBottomWidth: 0 }}
                containerStyle={styles.inputContainer}
              />

              <Input
                onChangeText={(text) => setRePassword(text)}
                value={rePassword}
                placeholder="Re-Type password"
                autoCapitalize={"none"}
                inputStyle={styles.input}
                inputContainerStyle={{ borderBottomWidth: 0 }}
                containerStyle={styles.inputContainer}
              />
              <Button
                title={
                  <Text className={"text-white"} fontType={"Nunito-ExtraBold"}>
                    Save New Password
                  </Text>
                }
                color="#313131"
                disabled={loading}
                loading={loading}
                onPress={() => updateNewPassword()}
              />
              <Text className="text-gray-600 text-center mt-10">
                Don't have an account?{" "}
                <Text
                  className="font-bold"
                  onPress={() => {
                    setAccountType("sign up");
                  }}
                >
                  Sign Up
                </Text>
              </Text>
            </View>
          </View>
        ) : (
          ""
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  inputContainer: {
    height: 55,
    marginVertical: 3,
    paddingHorizontal: 0,
  },
  socialAuthButton: {
    borderColor: "lightgray",
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
  },
});
