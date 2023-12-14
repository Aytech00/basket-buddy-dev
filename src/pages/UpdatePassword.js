import React from "react";
import { Button, Input } from "@rneui/base";
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function UpdatePassword() {
  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: "#fff" }}>
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
    </SafeAreaView>
  );
}
