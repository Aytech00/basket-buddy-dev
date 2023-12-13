import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Text from "../components/ui/Text";

export default function SavedCartSubtotal({ cartId, loading, setLoading }) {
  const [subtotal, setSubtotal] = useState({ min: 0, max: 0 });
  const [groceryObject, setGroceryObject] = useState([]);
  const [priceRanges, setPriceRanges] = useState([]);

  useEffect(() => {
    const fetchCartById = async (cartId) => {
      let { data: cart, error } = await supabase
        .from("Cart")
        .select("*")
        .eq("id", cartId)
        .single();

      if (error) {
        console.error("Error fetching cart:", error);
        return null;
      }
      return cart;
    };

    function getCartPriceRange(similarProducts, quantity) {
      let minPrice = Infinity; // Initialize to positive infinity
      let maxPrice = -Infinity; // Initialize to negative infinity

      similarProducts.forEach((product) => {
        const price = parseFloat(product.individual_price.replace("$", ""));
        // Update min and max prices
        minPrice = Math.min(minPrice, price);
        maxPrice = Math.max(maxPrice, price);
      });

      // Replace infinities with null
      minPrice = minPrice === Infinity ? null : minPrice * quantity;
      maxPrice = maxPrice === -Infinity ? null : maxPrice * quantity;

      return { min: minPrice, max: maxPrice };
    }

    const fetchSimilarProducts = async (basket_buddy_id, quantity) => {
      let { data: product, error } = await supabase
        .from("Product")
        .select("*")
        .eq("basket_buddy_id", basket_buddy_id);

      if (error) {
        console.error("Error fetching cart:", error);
        return null;
      }

      if (product) {
        const { min, max } = getCartPriceRange(product, quantity);

        return { min, max };
      }
    };

    const fetchAllSimilarProducts = async (product, quantity) => {
      const priceRange = await fetchSimilarProducts(
        product[0].basket_buddy_id,
        quantity
      );
      return priceRange;
    };

    const fetchProductPrice = async (product, quantity, basket_buddy_id) => {
      let { data: fetchedProduct, error } = await supabase
        .from("Product")
        .select("*")
        .eq("basket_buddy_id", product.basket_buddy_id);

      if (error) {
        console.error("Error fetching cart:", error);
        return null;
      }

      if (fetchedProduct) {
        const priceRange = await fetchAllSimilarProducts(
          fetchedProduct,
          quantity
        );
        setPriceRanges((prev) => [...prev, priceRange]);
        return priceRange;
      }
    };

    const updateDuplicateProducts = async (array) => {
      const duplicates = new Map();
      let quantity = 0;

      await Promise.all(
        array.map(async (product) => {
          const key = JSON.stringify(product);
          if (duplicates.has(key)) {
            duplicates.set(key, duplicates.get(key) + 1);
            quantity++;
          } else {
            duplicates.set(key, 1);
          }
        })
      );

      const duplicatesObject = new Map();
      duplicates.forEach((value, key) => {
        const productObj = JSON.parse(key);
        duplicatesObject.set(productObj, value);
      });

      const groceryObjects = [];

      for (const [groceries, quantity, basket_buddy_id] of duplicatesObject) {
        let price = await fetchProductPrice(groceries, quantity).catch(
          (error) => console.error("Error fetching product price: ", error)
        );

        let groceryObject = {
          groceries: groceries,
          quantity: quantity,
          price: price,
        };

        groceryObjects.push(groceryObject);
      }

      setGroceryObject(groceryObjects);
    };

    const fetchProducts = async (arrayOfIds) => {
      console.log("arrayOfIds");
      // console.log(arrayOfIds);
      try {
        const fetchRequests = arrayOfIds.map(async (productId) => {
          const { data: product, error } = await supabase
            .from("Product")
            .select("*")
            .eq("basket_buddy_id", productId)
            .single()
            .limit(1);

          console.log("Product");
          // console.log(product);

          if (error) {
            console.error("Error fetching product:", error);
            return null;
          }

          if (product) {
            return product;
          }
        });

        const fetchedProducts = await Promise.all(fetchRequests);

        const filteredProducts = fetchedProducts.filter(
          (product) => product !== null
        );

        updateDuplicateProducts(filteredProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    if (cartId !== undefined) {
      fetchCartById(cartId)
        .then((cartData) => {
          if (cartData && cartData.products_array) {
            fetchProducts(cartData.products_array);
          } else {
            console.error(
              "Cart does not exist, has been deleted, or does not contain any products"
            );
          }
        })
        .catch((error) => {
          console.error("Error fetching cart:", error);
        });
    } else {
      return;
    }
  }, [cartId]);

  useEffect(() => {
    if (priceRanges.length > 0) {
      let totalMin = priceRanges.reduce(
        (total, range) =>
          range.min !== null ? total + parseFloat(range.min) : total,
        0
      );
      let totalMax = priceRanges.reduce(
        (total, range) =>
          range.max !== null ? total + parseFloat(range.max) : total,
        0
      );

      setSubtotal({ min: totalMin.toFixed(2), max: totalMax.toFixed(2) });
    }
  }, [priceRanges]);

  useEffect(() => {
    setPriceRanges([]);
  }, [cartId]);

  return (
    <>
      <Text
        fontType={"Nunito-Bold"}
        className="text-gray-400 text-xs text-ellipsis overflow-hidden w-full"
      >
        ${subtotal.min} - ${subtotal.max}
      </Text>
    </>
  );
}
