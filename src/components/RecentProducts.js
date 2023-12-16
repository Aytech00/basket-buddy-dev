import React, { useEffect, useState, useContext } from "react";
import Text from "../components/ui/Text";
import { View } from "react-native";
import { supabase } from "../lib/supabase";
import UserContext from "../lib/userContext";
import Chevron from "./ui/Chevron";
import uuid from "react-native-uuid";
import ProductRow from "./ui/productRow";
import { AvatarLayout } from "./SkeletonLoader";

const RecentProducts = () => {
  const [foundProducts, setFoundProducts] = useState(new Map()); // Use Map to store products
  const { session } = useContext(UserContext);
  const [userID, setUserID] = useState(session?.user?.id);
  const [page, setPage] = useState(0);
  const [viewMore, setViewMore] = useState(true);
  const [productAmount, setProductAmount] = useState(2);
  const MAX_PRODUCTS = 6; // Define the maximum number of products to display
  const [isLoading, setIsLoading] = useState(true);

  const fetchIDRecentProduct = async (setOfIds) => {
    const arrayOfIds = Array.from(setOfIds);
    let fetchedProductsMap = new Map(foundProducts); // Clone the current Map

    await Promise.all(
      arrayOfIds.map(async (productId) => {
        if (!fetchedProductsMap.has(productId)) {
          // Check if the product is already fetched
          const { data: product, error } = await supabase
            .from("Product")
            .select("*")
            .eq("basket_buddy_id", productId)
            .single()
            .limit(1);
          if (error) {
            // console.error("Error fetching product:", error);
            return null;
          }
          if (product) {
            product.quantity = 1;
            fetchedProductsMap.set(productId, product); // Store product in the Map using productId as key
          }
        }
      })
    );
    setFoundProducts(fetchedProductsMap); // Update state
    setIsLoading(false);
  };

  const fetchCart = async (page) => {
    let recentProducts = new Set();
    let hasNewProducts = false;
    let currentPage = page;

    while (!hasNewProducts && foundProducts.size < MAX_PRODUCTS) {
      try {
        const { data, error } = await supabase
          .from("Cart")
          .select()
          .eq("user_id", userID)
          .order("created_date", { ascending: false });
        if (error) {
          console.error(error);
        } else if (data) {
          data.map((cart) => {
            cart.products_array.map((product) => {
              if (!foundProducts.has(product)) {
                recentProducts.add(product); // Using Set's add method
              }
            });
          });
          hasNewProducts = Array.from(recentProducts).some(
            (id) => !foundProducts.has(id)
          ); // Check if there are any new products
        }
      } catch (error) {
        console.error(error);
      }

      if (!hasNewProducts) {
        currentPage++; // Increment the page to fetch the next set of products
      }
    }

    const uniqueArray = Array.from(recentProducts); // Convert Set back to an array

    fetchIDRecentProduct(uniqueArray);
  };

  const loadMore = () => {
    setProductAmount((prevAmount) => {
      if (viewMore) {
        if (prevAmount < MAX_PRODUCTS) {
          return prevAmount + 2;
        }
        return 2; // Reset to 2 when the max is reached
      } else {
        return 2;
      }
    });
  };

  useEffect(() => {
    if (productAmount >= MAX_PRODUCTS || productAmount > foundProducts.size) {
      setViewMore(false);
    } else {
      setViewMore(true);
    }
  }, [productAmount, foundProducts]);

  useEffect(() => {
    fetchCart(page);
  }, [page]); // Add page to the dependencies

  if (isLoading)
    return (
      <View style={{ gap: 10 }}>
        <AvatarLayout />
        <AvatarLayout />
      </View>
    );

  return (
    <View className="mx-2">
      {foundProducts.size === 0
        ? ""
        : Array.from(foundProducts.values())
            .slice(0, productAmount)
            .map((product) => {
              // Convert Map values to array
              return (
                <View className="my-3" key={uuid.v4()}>
                  <ProductRow product={product} />
                </View>
              );
            })}
      {foundProducts.size !== 0 ? (
        foundProducts.size > 2 ? (
          <Chevron fetchData={loadMore} viewMore={viewMore} />
        ) : (
          <></>
        )
      ) : (
        <Text
          fontType={"Nunito-ExtraBold"}
          className="text-center font-bold text-base text-[#D5D5D5]"
        >
          Empty
        </Text>
      )}
    </View>
  );
};

export default RecentProducts;
