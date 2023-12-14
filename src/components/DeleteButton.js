import { Button } from "@rneui/base";
import { supabase } from "../lib/supabase";

export default function DeleteButton({ cartID, handleHeader }) {
  const handleDeleteRow = async (cartID) => {
    try {
      const { data, error } = await supabase
        .from("Cart")
        .delete()
        .eq("id", cartID); // Replace 'your_table_name' with the actual table name and 'id' with the appropriate row identifier column

      if (error) {
        console.error("Error deleting row:", error.message);
      } else {
        handleHeader(true);
      }
    } catch (error) {
      console.error("Error deleting row:", error.message);
    }
  };

  return (
    <Button
      title="Delete Cart"
      onPress={() => handleDeleteRow(cartID)}
      titleStyle={{
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 12,
      }}
      buttonStyle={{
        borderRadius: 2,
        padding: 5,
        backgroundColor: "#FF485A",
        height: 35,
      }}
      containerStyle={{
        width: 120,
        borderRadius: 5,
        marginLeft: "auto",
        marginRight: "auto",

        marginTop: 10,
        marginBottom: 10,
      }}
    />
  );
}
