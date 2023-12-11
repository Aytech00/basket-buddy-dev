import React from "react";
import uuid from "react-native-uuid";
export default function modifyProduct({ modifyProductID }) {
  const [productName, setProductName] = useState();
  const [productImage, setProductImage] = useState();
  const [productWeight, setProductWeight] = useState();

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("Product")
        .select("*")
        .eq("id", modifyProductID)
        .single();

      // Process the result or handle any errors here
      if (error) throw error;

      if (data) {
        setProductName(data.name);
        setProductImage(data.image_url);
        setProductWeight(data.weight);
      }
    };

    fetchData();
  }, []);

  return (
    <View
      key={uuid.v4()}
      className="mb-3 px-1.5 flex flex-row items-center justify-between"
    >
      {productImage ? (
        <Image
          source={{ uri: productImage }}
          className="aspect-square w-16 h-16 rounded mr-3"
        />
      ) : (
        <></>
      )}

      {/* Product Name + Price */}
      <View className="w-1/2 mr-auto">
        <Text className="text-md font-bold text-ellipsis overflow-hidden w-full">
          {productName}
        </Text>
      </View>
    </View>
  );
}
