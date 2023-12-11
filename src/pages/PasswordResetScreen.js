import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Input } from "@rneui/base";

export default function PasswordReset() {
  const [newPassword, setPassword] = useState("");
  const [email, setEmail] = useState("");
  return (
    <View>
      <Text>PasswordResetScreen</Text>

      <Input
        value={email}
        placeholder="email@address.com"
        autoCapitalize={"none"}
        inputStyle={styles.input}
        inputContainerStyle={{ borderBottomWidth: 0 }}
        containerStyle={styles.inputContainer}
      />

      <Input
        onChangeText={(text) => setPassword(text)}
        value={newPassword}
        placeholder="email@address.com"
        autoCapitalize={"none"}
        inputStyle={styles.input}
        inputContainerStyle={{ borderBottomWidth: 0 }}
        containerStyle={styles.inputContainer}
      />

      <Input
        onChangeText={(text) => setPassword(text)}
        value={newPassword}
        placeholder="Re-Type password"
        autoCapitalize={"none"}
        inputStyle={styles.input}
        inputContainerStyle={{ borderBottomWidth: 0 }}
        containerStyle={styles.inputContainer}
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
