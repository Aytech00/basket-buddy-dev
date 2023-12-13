import React, { useContext, useState } from "react";
import { Button } from "@rneui/themed";
import Text from "../components/ui/Text";
import { CartContext } from "../lib/cartContext";
import { supabase } from "../lib/supabase";

export default function AddButton({ cartProducts }) {
  const [itemAdded, setItemAdded] = useState(false);
  const { addToCart } = useContext(CartContext);

  const calculateOccurrences = (arr) => {
    const occurrences = {};
    arr.forEach((id) => {
      occurrences[id] = (occurrences[id] || 0) + 1;
    });
    return occurrences;
  };

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
      console.log("FOUND PRODUCT");
      const { minPrice, maxPrice } = getCartPriceRange(product);
      return { min: minPrice, max: maxPrice };
    }
  };

  //get product array

  //add them to cart
  const addItemToCart = async (product, quantity, priceRange) => {
    // add to cart animation
    setItemAdded(true);

    // adding to cart
    addToCart(product, quantity, priceRange);

    setTimeout(() => {
      setItemAdded(false);
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

  const handleAddToCart = async () => {
    const occurrences = calculateOccurrences(cartProducts);
    const addToCartPromises = [];

    for (const basket_buddy_id in occurrences) {
      addToCartPromises.push(
        (async () => {
          const quantity = occurrences[basket_buddy_id];
          const priceRange = await fetchSimilarProducts(basket_buddy_id);

          let { data: product, error } = await supabase
            .from("Product")
            .select("*")
            .eq("basket_buddy_id", basket_buddy_id)
            .limit(1)
            .single();

          if (error) {
            console.error("Error fetching cart:", error);
            return;
          }

          if (product) {
            console.log("FOUND PRODUCT");
            return { product, quantity, priceRange };
          }
        })()
      );
    }

    const cartItems = (await Promise.all(addToCartPromises)).filter(
      (item) => item !== undefined
    );

    cartItems.forEach(async ({ product, quantity, priceRange }) => {
      if (product) {
        await addItemToCart(product, quantity, priceRange);
        // Add a delay here to allow state to update
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    });
  };

  return (
    <Button
      onPress={handleAddToCart}
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
      }}
      containerStyle={{
        width: 70,
        borderRadius: 5,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    />
  );
}
