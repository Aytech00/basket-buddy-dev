import React, { useState, useEffect, useContext } from "react";
import { View, Pressable, Image } from "react-native";
import { Button, Icon } from "@rneui/themed";
import { supabase } from "../../lib/supabase";
import { CartContext } from "../../lib/cartContext";
import Text from "./Text";

const ProductRow = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const [price, setPrice] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [itemAdded, setItemAdded] = useState(false);

  const addItemToCart = async () => {
    // add to cart animation
    setItemAdded(true);

    // adding to cart
    addToCart(product, quantity, price);

    setTimeout(() => {
      setItemAdded(false);
      setQuantity(1);
    }, 2000);
  };

  function getCartPriceRange(similarProducts) {
    let minPrice = Infinity; // Initialize to positive infinity
    let maxPrice = -Infinity; // Initialize to negative infinity

    similarProducts.forEach((product) => {
      const price = parseFloat(product.individual_price.replace("$", ""));

      // Update min and max prices
      minPrice = Math.min(minPrice, price);
      maxPrice = Math.max(maxPrice, price);
    });

    // Replace infinities with null
    minPrice = minPrice === Infinity ? null : minPrice;
    maxPrice = maxPrice === -Infinity ? null : maxPrice;
    return { minPrice, maxPrice };
  }

  useEffect(() => {
    const fetchSimilarProducts = async (basket_buddy_id) => {
      let { data: product, error } = await supabase
        .from("Product")
        .select("*")
        .eq("basket_buddy_id", basket_buddy_id);

      if (error) {
        console.error("Error fetching cart:", error);
        return null;
      }

      if (product) {
        const { minPrice, maxPrice } = getCartPriceRange(product);
        return { min: minPrice, max: maxPrice };
      }
    };

    const fetchAllSimilarProducts = async () => {
      const priceRange = await fetchSimilarProducts(product.basket_buddy_id);
      setPrice(priceRange);
    };

    fetchAllSimilarProducts();
  }, [product]);

  if (!product) {
    return null;
  }

  return (
    <View className="flex flex-row items-center justify-between">
      {product.image_url ? (
        <Image
          source={{ uri: product.image_url }}
          className="aspect-square w-16 h-16 rounded mr-3"
        />
      ) : (
        <></>
      )}

      {/* Product Name + Price */}
      <View className="w-1/2 mr-auto">
        <Text
          fontType={"Nunito-ExtraBold"}
          className="text-md font-bold text-ellipsis overflow-hidden w-full"
        >
          {product.name}
        </Text>
        {price ? (
          <Text
            fontType={"Nunito-ExtraBold"}
            className="text-gray-400 text-sm font-bold text-ellipsis overflow-hidden w-full"
          >
            ${price.min} - ${price.max}
          </Text>
        ) : (
          ""
        )}
      </View>

      <View className="flex flex-col justify-center">
        {/* Quantity Selector */}
        <View className="flex flex-row items-center mx-auto mb-2">
          <Pressable
            onPress={() => {
              if (quantity > 1) setQuantity(quantity - 1);
            }}
            className="aspect-square h-6 w-6 rounded border-2 border-[#333] pt-[4.5px]"
            style={{ opacity: quantity <= 1 ? 0.5 : 1 }}
          >
            <Icon name="minus" type="font-awesome" size={12} />
          </Pressable>
          <Text className="text-center text-md mx-2 -translate-y-px">
            {quantity}
          </Text>
          <Pressable
            onPress={() => setQuantity(quantity + 1)}
            className="aspect-square h-6 w-6 rounded border-2 border-[#333] pt-[4px]"
          >
            <Icon name="plus" type="font-awesome" size={12} />
          </Pressable>
        </View>

        <Button
          onPress={() => {
            if (!itemAdded) addItemToCart();
          }}
          title={
            itemAdded ? (
              <Text className={"text-white"} fontType={"Nunito-Bold"}>
                Added{" "}
              </Text>
            ) : (
              <Text className={"text-white"} fontType={"Nunito-Bold"}>
                + Add
              </Text>
            )
          }
          color={itemAdded ? "#6ECB33" : "#CECECE"}
          icon={
            itemAdded
              ? {
                  name: "check",
                  size: 16,
                  color: "white",
                }
              : null
          }
          buttonStyle={{
            borderRadius: 5,
            paddingLeft: 3,
            paddingVertical: 3,
          }}
          titleStyle={{ fontSize: 14 }}
          containerStyle={{
            width: 90,
            borderRadius: 5,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />
      </View>
    </View>
  );
};

export default ProductRow;
