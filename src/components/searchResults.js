import React, { useState, useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { supabase } from "../lib/supabase";
import ProductRow from "./ui/productRow";
import SavedProductRow from "./ui/savedProductRow";
import Chevron from "./ui/Chevron";
import { useSearchContext } from "../lib/SearchBarContext";

let lastId = 0; // the id of the last product you fetched

const SearchResults = ({ searchTerm, type, newSaved }) => {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [basketBuddyIds, setBasketBuddyIds] = useState(new Set());
  const [savedCart, setSavedCart] = useState(false);
  const [viewMore, setViewMore] = useState(true);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  useEffect(() => {
    setSavedCart(type === true);
  }, [type]);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const fetchProducts = async (fetchMore = false) => {
    setLoading(true);
    if (!fetchMore) {
      setProducts([]);
      setBasketBuddyIds(new Set());
    }

    // Empty search terms return immediately
    if (!searchTerm.trim()) {
      setLoading(false);
      return;
    }

    let textPattern = `%${searchTerm.toLowerCase()}%`;
    let allProducts = [];

    try {
      const { data: wordData, error: wordError } = await supabase
        .from("Product")
        .select("*")
        .ilike("name", textPattern)
        .gt("id", fetchMore ? lastId : 0)
        .order("id", { ascending: true })
        .limit(20);

      if (wordError) throw wordError;

      allProducts = wordData;

      // Deduplicate the products
      const basketBuddyIdsSet = fetchMore ? new Set(basketBuddyIds) : new Set();
      const uniqueProducts = allProducts.filter((product) => {
        if (!basketBuddyIdsSet.has(product.basket_buddy_id)) {
          basketBuddyIdsSet.add(product.basket_buddy_id);
          return true;
        }
        return false;
      });

      if (uniqueProducts.length > 0) {
        lastId = uniqueProducts[uniqueProducts.length - 1].id;
        setBasketBuddyIds(basketBuddyIdsSet);
        setProducts(
          fetchMore ? [...products, ...uniqueProducts] : uniqueProducts
        );
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.ScrollView
      ref={scrollViewRef}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
        { useNativeDriver: false }
      )}
      scrollEventThrottle={16}
      keyboardDismissMode="on-drag"
      className="h-screen bg-white"
    >
      <View className="flex flex-row items-center justify-between py-3 px-4">
        <Text>
          {products.length
            ? `${products.length} result${products.length > 1 ? "s" : ""}.`
            : ""}
        </Text>
        <View>{/* <Text>Sorting by </Text> */}</View>
      </View>
      {products.length > 0 ? (
        <View className="flex flex-col px-4">
          {products.map((product) => (
            <View key={product.id} className="mb-5">
              {savedCart ? (
                <SavedProductRow product={product} />
              ) : (
                <ProductRow product={product} />
              )}
              <Text>{product.title}</Text>
            </View>
          ))}
          <View className={newSaved ? `mb-56` : `mb-20`}>
            <Chevron
              fetchData={() => fetchProducts(true)}
              viewMore={viewMore}
            />
          </View>
        </View>
      ) : loading ? (
        <Text className="text-center">Loading...</Text>
      ) : (
        <Text className="text-center">
          Couldn't find what you were looking for.
        </Text>
      )}
    </Animated.ScrollView>
  );
};

export default SearchResults;
