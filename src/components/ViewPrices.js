import { View, Text, Image, Pressable } from "react-native";
import React, { useEffect, useState, useContext } from "react";
import { Icon } from "@rneui/base";
import { CartContext } from "../lib/cartContext";

const ViewPrices = React.forwardRef((props, ref) => {
  const [productsInStore, setProductsInStore] = useState([]);
  const { cart, removeFromCart, modifyCartItemQuantity } =
    useContext(CartContext);

  useEffect(() => {
    if (props.productsInStore.length > 0) {
      setProductsInStore(props.productsInStore);
    }
  }, [props.productsInStore]);

  const productQuantity = (productName) => {
    let quantity;
    const filteredProducts = cart.filter(
      (item) => item.product.name === productName
    );
    quantity = filteredProducts[0].quantity;
    return quantity;
  };

  const calculatePrices = (product) => {
    let productFromCart = product.product;

    const product_amount = productFromCart.multi_amount;

    let foundProduct = filteredProducts[0];

    const individual_price = parseFloat(
      foundProduct.individual_price.replace("$", "")
    );
    let multi_under = foundProduct.multi_under
      ? parseFloat(foundProduct.multi_under.replace("$", ""))
      : individual_price;
    let multi_over = foundProduct.multi_over
      ? parseFloat(foundProduct.multi_over.replace("$", ""))
      : individual_price;
    let quantity = productQuantity(foundProduct.name);

    if (product_amount == null) {
      return (price = individual_price * quantity);
    } else if (product_amount > 0) {
      if (quantity <= product_amount) {
        return (price = multi_under * quantity);
      } else if (quantity > product_amount) {
        return (price =
          multi_under * product_amount +
          multi_over * (quantity - product_amount));
      }
    }
  };

  return (
    <View className="border border-1 border-red-500">
      {cart.map((product) => (
        <View
          key={product.product.id}
          className="mb-3 px-1.5 flex flex-row items-center justify-between"
        >
          {product.product.image_url ? (
            <Image
              source={{ uri: product.product.image_url }}
              className="aspect-square w-16 h-16 rounded mr-3"
            />
          ) : (
            <></>
          )}

          {/* Product Name + Price */}
          <View className="w-1/2 mr-auto">
            <Text className="text-md font-bold text-ellipsis overflow-hidden w-full">
              {product.product.name}
            </Text>
            {/*FIX PRICE */}
            <Text className="text-gray-400 text-sm font-bold text-ellipsis overflow-hidden w-full">
              {calculatePrices(product).toFixed(2)}
            </Text>
          </View>

          {/* Quantity Selector */}
          <View className="flex flex-row items-center mx-auto mb-2">
            <Pressable
              onPress={() => {
                if (product.quantity == 1)
                  removeFromCart(product.product.basket_buddy_id);

                if (product.quantity > 1)
                  modifyCartItemQuantity(
                    product.product.basket_buddy_id,
                    product.quantity - 1
                  );
              }}
              className="aspect-square h-6 w-6 rounded border-2 border-[#333] pt-[4.5px]"
            >
              {product.quantity == 1 ? (
                <Icon name="trash" type="font-awesome" size={12} />
              ) : (
                <Icon name="minus" type="font-awesome" size={12} />
              )}
            </Pressable>
            <Text className="text-center text-md mx-2 -translate-y-px">
              {product.quantity}
            </Text>
            <Pressable
              onPress={() => {
                modifyCartItemQuantity(
                  product.product.basket_buddy_id,
                  product.quantity + 1
                );
              }}
              className="aspect-square h-6 w-6 rounded border-2 border-[#333] pt-[4px]"
            >
              <Icon name="plus" type="font-awesome" size={12} />
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
});

export default ViewPrices;
