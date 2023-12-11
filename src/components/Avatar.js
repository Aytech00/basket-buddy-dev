import React, { useState } from "react";
import { Image, View, Pressable } from "react-native";
import * as ImagePicker from "expo-image-picker";
import ImageAssets from "../../assets/images/pic.png";
export default function ImagePickerExample({ url, size = 150, onUpload }) {
  const [image, setImage] = useState(null);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Pressable onPress={pickImage} />
      {image ? (
        <Image
          source={{ uri: image }}
          style={{ width: "100%", height: "100%" }}
        />
      ) : (
        <Image source={ImageAssets} />
      )}
    </View>
  );
}
