import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Button } from "@rneui/base";
import { supabase } from "../lib/supabase";
import Glen from "../images/glenn-happy.png";

const Confirmed = ({ tokens, setter }) => {
  const confirmedSession = async () => {
    let AccessToken = tokens.accessToken;
    let RefreshToken = tokens.refreshToken;
    setter(tokens);
    const { data, error } = supabase.auth.setSession({
      access_token: AccessToken,
      refresh_token: RefreshToken,
    });
    if (error) console.log(error);
    if (data) {
    }
  };

  return (
    <View className="flex justify-center items-center">
      <Text>Your account has been confirmed!</Text>
      <Text>You can now access all the features of our app.</Text>
      <Image style={styles.glen} source={Glen} />
      <Button
        onPress={() => confirmedSession()}
        title={
          <Text fontType="Nunito-Bold" className="text-white">
            All done. Thanks Glenn!
          </Text>
        }
        color="#313131"
        containerStyle={styles.buttonContainer}
      />
    </View>
  );
};

export default Confirmed;

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
