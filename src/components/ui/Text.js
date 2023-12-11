import { Text as RawText } from "react-native";
import { useFonts } from "expo-font";

const Text = (props) => {
  const [fontsLoaded] = useFonts({
    Nunito: require("../../../assets/fonts/Nunito.ttf"),
    "Nunito-Bold": require("../../../assets/fonts/Nunito-Bold.ttf"),
    "Nunito-ExtraBold": require("../../../assets/fonts/Nunito-ExtraBold.ttf"),
    "Nunito-Italic": require("../../../assets/fonts/Nunito-Italic.ttf"),
    "Nunito-Medium": require("../../../assets/fonts/Nunito-Medium.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <RawText
      className={props.className}
      style={[{ fontFamily: props.fontType }, props.style]}
    >
      {props.children}
    </RawText>
  );
};

export default Text;
