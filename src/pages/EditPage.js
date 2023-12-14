import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import { Button, Input } from "@rneui/base";
import { supabase } from "../lib/supabase";
import Text from "../components/ui/Text";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import { decode } from "base64-arraybuffer";
import { AvatarContext } from "../lib/avatarContext";

const ChangeNameComponent = () => {
  const { handleAvatar } = useContext(AvatarContext);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const { avatar } = useContext(AvatarContext);

  useEffect(() => {
    if (image) {
      // console.log(image);
    }
  });

  const retrieveUserSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) console.log(error.message);

    if (data) {
      return data.session.user.id;
    }
  };

  const handleNameChange = async () => {
    setIsLoading(true);
    if (name) {
      const { data, error } = await supabase
        .from("profiles")
        .update({ username: name })
        .eq("id", await retrieveUserSession())
        .select();

      setIsLoading(false);

      if (error) console.log(error.message);

      if (data) {
        Alert.alert("Name successfully changed!");
        navigation.goBack();
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      const url = await uploadToSupabase(result.base64);
      if (url) {
        // Here you can store the url or do something with it
        handleAvatar(url);
      }
    }
  };

  const uploadToSupabase = async (
    base64Image,
    imageExtension = "jpg",
    bucketName = "avatars"
  ) => {
    setIsLoading(true);
    try {
      const base64Str = base64Image.includes("base64,")
        ? base64Image.substring(
            base64Image.indexOf("base64,") + "base64,".length
          )
        : base64Image;
      const res = decode(base64Str);

      if (!(res.byteLength > 0)) {
        console.error("[uploadToSupabase] ArrayBuffer is null");
        return null;
      }

      let id = await retrieveUserSession();
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(`${id}/profile.${imageExtension}`, res, {
          contentType: `image/jpg`,
          upsert: true,
        });

      if (data) {
        setIsLoading(false);
        return data.path;
      }
      if (!data) {
        console.error("[uploadToSupabase] Data is null");
        setIsLoading(false);
        return null;
      }

      if (error) {
        console.error("[uploadToSupabase] upload: ", error);
        setIsLoading(false);
        return null;
      }
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  return (
    <View className="h-screen bg-white flex flex-col ">
      <View className="h-full items-center  shadow-lg p-5">
        <View className="h-1/3 w-full items-center">
          <Text fontType="Nunito-ExtraBold" className="text-xl">
            Change Your Profile Picture
          </Text>
          {image ? (
            <Image className="w-20 h-20 rounded-2xl" source={{ uri: image }} />
          ) : (
            <Image className="w-20 h-20 rounded-2xl" source={{ uri: avatar }} />
          )}
          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          )}

          <Button
            onPress={pickImage}
            title="Pick an image"
            color="#fff"
            titleStyle={{
              color: "#333",
              fontWeight: "bold",
              fontSize: 14,
            }}
            buttonStyle={{
              borderRadius: 5,
              padding: 5,
            }}
            containerStyle={{
              width: 110,
              borderRadius: 5,
              marginVertical: 20,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        </View>
        <View className="flex flex-col items-center  w-full">
          <Text fontType="Nunito-ExtraBold" className="text-xl">
            Change Your Name
          </Text>
          <Input
            onChangeText={(text) => setName(text)}
            value={name}
            placeholder="Enter new Name"
            autoCapitalize={"none"}
            inputStyle={styles.input}
            inputContainerStyle={{ borderBottomWidth: 0 }}
            containerStyle={styles.inputContainer}
          />
          <Button
            onPress={handleNameChange}
            title="Update"
            color="#fff"
            titleStyle={{
              color: "#333",
              fontWeight: "bold",
              fontSize: 14,
            }}
            buttonStyle={{
              borderRadius: 5,
              padding: 5,
            }}
            containerStyle={{
              width: 110,
              borderRadius: 5,
              marginVertical: 20,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />

          <Button
            onPress={() => {
              navigation.goBack();
            }}
            title="Close"
            color="#fff"
            titleStyle={{
              color: "#333",
              fontWeight: "bold",
              fontSize: 14,
            }}
            buttonStyle={{
              borderRadius: 5,
              padding: 5,
            }}
            containerStyle={{
              width: 110,
              borderRadius: 5,
              marginVertical: 20,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />
        </View>
      </View>
    </View>
  );
};

export default ChangeNameComponent;

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
    width: "100%",
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
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
