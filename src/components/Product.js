import React, { useState, useEffect } from "react";
import { Text, Image } from "react-native";
import { supabase } from "../lib/supabase";
const Product = ({ productId, text, imageStyle }) => {
  const [productName, setProductName] = useState();
  const [productImage, setProductImage] = useState();
  const [productWeight, setProductWeight] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("Product")
        .select("*")
        .eq("basket_buddy_id", productId)
        .single()
        .limit(1);
      // Process the result or handle any errors here
      if (error) throw error;

      if (data) {
        if (text) {
          setProductName(data.name); // Truncate to 20 characters. Adjust as needed.
          setProductWeight(data.weight, 2);
        } else if (text !== true) {
          setProductImage(data.image_url);
        }
      }
    };

    fetchData();
  }, [productId]);

  return (
    <>
      {text ? (
        <>
          <Text
            className="text-[#949494] text-xs italic"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {productName} ({productWeight})
          </Text>
        </>
      ) : productImage ? (
        <Image
          source={{ uri: productImage }}
          className="w-full h-full"
          resizeMode="contain"
        />
      ) : (
        <></>
      )}
    </>
  );
};

export default Product;
