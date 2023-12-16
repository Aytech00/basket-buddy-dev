import { View, Modal, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Button } from "@rneui/base";
import { useEffect, useState, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import Text from "../components/ui/Text";
import Glen from "../../assets/images/glenn-happy.png";
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { PremiumContext } from "../lib/PremiumContext";

const ENTITLEMENT_ID = "basketBuddyPremium";

const WelcomeModal = ({
  visible,
  onClose,
  productPrices,
  highestPriceStore,
  lowestStorePrice,
  lowestPricedProducts,
}) => {
  const [lowestPriceProducts, setLowestPriceProducts] = useState(0);
  const [lowestPriceTotal, setLowestPriceTotal] = useState(0);
  const [show, setShow] = useState(false);
  const [activatingPremium, setActivatingPremium] = useState(false);
  const navigation = useNavigation();
  const { premium, setPremium, offerings, activated } =
    useContext(PremiumContext);

  const closeModal = () => {
    setShow(false);
  };

  useEffect(() => {
    setTimeout(() => {
      premium ? setShow(false) : setShow(true);
    }, 3000);
  }, [visible]);

  //gets lowest priced item
  useEffect(() => {
    const groupedProducts = productPrices.reduce((acc, product) => {
      const price = product.individual_price;

      if (product.product && product.product.EA) {
        const key = product.product.EA;
        if (acc[key]) {
          if (
            price <
            parseFloat(acc[key].product.individual_price.replace("$", ""))
          ) {
            acc[key] = product;
          }
        } else {
          acc[key] = product;
        }
      } else {
        console.warn("Product or EA not found in:", product); // Warn if product or EA is not found
      }

      return acc;
    }, {});

    console.log("productPrices", productPrices);

    const lowestPricedProducts = Object.values(groupedProducts);

    setLowestPriceProducts(lowestPricedProducts);
  }, [productPrices]);

  useEffect(() => {
    if (lowestPriceProducts !== undefined && lowestPriceProducts.length > 0) {
      let lowestPricedItems = 0;
      lowestPriceProducts.map((product_price) => {
        const price = parseFloat(
          product_price.product.individual_price.replace("$", "")
        );
        lowestPricedItems += price * product_price.quantity;
      });

      let basketBuddyBasicSavings = highestPriceStore - lowestStorePrice;
      let basketBuddyPremiumSavings = highestPriceStore - lowestPricedProducts;
      let savings;

      if (basketBuddyPremiumSavings > basketBuddyBasicSavings) {
        savings = basketBuddyPremiumSavings - basketBuddyBasicSavings;
      } else if (basketBuddyPremiumSavings < basketBuddyBasicSavings) {
        savings = 0;
      } else if (basketBuddyPremiumSavings === basketBuddyBasicSavings) {
        savings = 0;
      }
      //if premium is cheaper than basketbuddy
      setLowestPriceTotal(savings);
    }
  });

  const purchaseBasketBuddyPremium = async () => {
    closeModal();

    if (activated) {
      setPremium(true);
      return;
    }

    setActivatingPremium(true);

    try {
      if (offerings.current && offerings.current.monthly) {
        const product = offerings.current.monthly;

        try {
          // console.log("running", product);
          const { customerInfo } = await Purchases.purchasePackage(product);

          if (
            typeof customerInfo.entitlements.active[ENTITLEMENT_ID] !==
            "undefined"
          ) {
            // Unlock that great "pro" content
            setPremium(true);
          }
        } catch (e) {
          if (!e.userCancelled) {
            console.log(e?.message || e);
          }
        } finally {
          setActivatingPremium(false);
        }
      }
    } catch (e) {
      console.log("offeringsError", e);
    } finally {
      setActivatingPremium(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={show}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
      >
        <View
          style={{
            backgroundColor: "white",
            padding: 45,
            borderRadius: 20,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
            width: "80%", // Make sure the modal width is consistent
          }}
        >
          {/* Close Button */}
          <TouchableOpacity
            style={{
              position: "absolute", // Position it absolutely
              top: 15, // 10 pixels from the top
              right: 20, // 10 pixels from the right
            }}
            onPress={closeModal} // Close action when pressed
          >
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>X</Text>
          </TouchableOpacity>

          <View className="text-center flex flex-row justify-center">
            <Image style={styles.glen} source={Glen} />
          </View>
          <Text
            style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}
            className="text-center"
            fontType={"Nunito-Bold"}
          >
            {lowestPriceTotal === -Infinity || lowestPriceTotal === Infinity
              ? "no grocery gtores found with these products"
              : lowestPriceTotal === 0
              ? "Get basket buddy premium and you can save more!"
              : "you could save "}
            <Text
              style={
                lowestPriceTotal === undefined || lowestPriceTotal === 0
                  ? {}
                  : { color: "#6ECB33" }
              }
            >
              {lowestPriceTotal === undefined ||
              lowestPriceTotal === 0 ||
              lowestPriceTotal === -Infinity ||
              lowestPriceTotal === Infinity
                ? null
                : `$${lowestPriceTotal.toFixed(2)}`}
            </Text>
            {lowestPriceTotal === 0 ||
            lowestPriceTotal === -Infinity ||
            lowestPriceTotal === Infinity
              ? ""
              : " if you purchase basket buddy premium!"}
          </Text>

          <Button
            color="#313131"
            containerStyle={{
              marginTop: 20,
            }}
            onPress={purchaseBasketBuddyPremium}
            loading={activatingPremium}
          >
            <Text
              style={{ color: "white", fontSize: 14 }}
              className="text-center"
              fontType={"Nunito-Bold"}
            >
              {`Get Premium - ${
                offerings?.current?.monthly?.product?.priceString || "4.99$"
              }/Month`}
            </Text>
          </Button>
        </View>
      </View>
    </Modal>
  );
};

export default WelcomeModal;

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
