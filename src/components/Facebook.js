// // import {
// //   LoginManager,
// //   LoginButton,
// //   AccessToken,
// // } from "react-native-fbsdk-next";

//  [
//    "react-native-fbsdk-next",
//    {
//      appID: "1555307718336801",
//      clientToken: "9ef56c0a5d39805ae7ca9e3f07a518f0",
//      displayName: "Basket Buddy",
//    },
//  ];

// import { useEffect } from "react";
// import * as FacebookAuth from "expo-auth-session/providers/facebook";
import { StyleSheet, Image } from "react-native";
import { Button } from "@rneui/base";

// export default function Facebook() {
//   const [request, response, promptAsync] = FacebookAuth.useAuthRequest({
//     clientId: "1555307718336801",
//   });

//   useEffect(() => {
//     console.log(response);

//     if (response && response.type === "success" && response.authentication) {
//       (async () => {
//         const userInfoResponse = await fetch(
//           `https://graph.facebook.com/me?access_token=${response.authentication.accessToken}&fields=id,name,picture.type(large)`
//         );
//         const userInfo = await userInfoResponse.json();
//         console.log(userInfo);
//       })();
//     }
//   }, [response]);

//   const handlePressAsync = async () => {
//     const result = await promptAsync();

//     if (result.type !== "success") {
//       console.log("something went wrong");
//       return;
//     }
//   };

//   return (
//     // <Button
//     //   onPress={handlePressAsync}
//     //   color="#fff"
//     //   type="outline"
//     //   //   buttonStyle={styles.socialAuthButton}
//     // >
//     //   <Image
//     //     source={require("../../assets/images/social-auth/google.png")}
//     //     className="h-10 w-10"
//     //   />
//     // </Button>

//     <Button
//       onPress={handlePressAsync}
//       color="#fff"
//       type="outline"
//       buttonStyle={styles.socialAuthButton}
//     >
//       <Image
//         source={require("../../assets/images/social-auth/facebook.png")}
//         className="h-10 w-10"
//       />
//     </Button>
//   );

//   //   const loginHandler = async () => {
//   //     try {
//   //       const result = await LoginManager.logInWithPermissions([
//   //         "public_profile",
//   //       ]);
//   //       const data = await AccessToken.getCurrentAccessToken();

//   //       if (!data) {
//   //         throw new Error("No data");
//   //       }

//   //       if (result.isCancelled) {
//   //         throw new Error("Login cancelled");
//   //       } else {
//   //         console.log(
//   //           "Login success with permissions: " +
//   //             result.grantedPermissions.toString()
//   //         );
//   //       }
//   //     } catch (error) {
//   //       console.log(error);
//   //     }
//   //   };

//   //   return (
//   //     <LoginButton
//   //       onLoginFinished={(error, result) => {
//   //         if (error) {
//   //           console.log("login has error: " + result.error);
//   //         } else if (result.isCancelled) {
//   //           console.log("login is cancelled.");
//   //         } else {
//   //           AccessToken.getCurrentAccessToken().then((data) => {
//   //             console.log(data.accessToken.toString());
//   //           });
//   //         }
//   //       }}
//   //       onLogoutFinished={() => console.log("logout.")}
//   //     />
//   //   );
// }

export default function Facebook() {
  return (
    <Button
      onPress={() => {}}
      color="#fff"
      type="outline"
      buttonStyle={styles.socialAuthButton}
    >
      <Image
        source={require("../../assets/images/social-auth/facebook.png")}
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
