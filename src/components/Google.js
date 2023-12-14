import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "../lib/supabase";
import { StyleSheet, Image, Alert } from "react-native";
import { Button } from "@rneui/base";

export default function Google() {
  GoogleSignin.configure({
    scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    webClientId:
      "573393173410-01kmc3j63p31cqaf8oelh0g4p7e7s8gt.apps.googleusercontent.com",
    iosClientId:
      "573393173410-k0j0sr4cfipq6mr1dpe489j4c6j9tmo5.apps.googleusercontent.com",
    androidClientId:
      "573393173410-h9m5bc0nm5tjs42k9o69oc0f0j5p9112.apps.googleusercontent.com",
  });

  return (
    <Button
      onPress={async () => {
        try {
          await GoogleSignin.hasPlayServices();
          const userInfo = await GoogleSignin.signIn();
          if (userInfo?.idToken) {
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: userInfo.idToken,
            });

            if (error) throw new Error(error);
            if (data) {
              await supabase.auth.setSession({
                access_token: data?.session?.access_token,
                refresh_token: data?.session?.refresh_token,
              });
            }
          } else {
            throw new Error("no ID token present!");
          }
        } catch (error) {
          console.log(error);
        }
      }}
      color="#fff"
      type="outline"
      buttonStyle={styles.socialAuthButton}
    >
      <Image
        source={require("../../assets/images/social-auth/google.png")}
        className="h-10 w-10"
      />
    </Button>
  );
}

const styles = StyleSheet.create({
  socialAuthButton: {
    borderColor: "lightgray",
    borderRadius: 3,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 5,
  },
});
