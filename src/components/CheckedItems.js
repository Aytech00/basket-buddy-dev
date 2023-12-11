import { useState } from "react";
import { View, Image, Text } from "react-native";

const CheckedItemsView = ({ checkedItemsProp }) => {
  const [checkedItems, setCheckedItems] = useState(checkedItemsProp);

  // const checkedItems = savedCart.filter((item) => checkedItemsProp[item.product.id] === true);

  return (
    <View>
      {checkedItems.map((item, index) => (
        <View
          key={index}
          className="mb-3 px-1.5 flex flex-row items-center justify-between"
        >
          {item.product.image_url ? (
            <Image
              source={{ uri: item.product.image_url }}
              className="aspect-square w-16 h-16 rounded mr-3"
            />
          ) : (
            <></>
          )}
          <Text>{item.product.name}</Text>
        </View>
      ))}
    </View>
  );
};

export default CheckedItemsView;
