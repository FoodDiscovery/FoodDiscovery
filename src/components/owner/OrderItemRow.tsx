import { Text, View } from "react-native";
import { ownerHomeStyles as styles } from "../styles";

export interface OrderItemRowProps {
  quantity: number;
  itemName: string;
  priceAtTimeOfPurchase: number;
}

export default function OrderItemRow({
  quantity,
  itemName,
  priceAtTimeOfPurchase,
}: OrderItemRowProps) {
  const lineTotal = quantity * Number(priceAtTimeOfPurchase);
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemLeft}>
        <Text style={styles.itemQtyName} numberOfLines={2}>
          {quantity} x {itemName}
        </Text>
      </View>
      <Text style={styles.itemPrice}>${lineTotal.toFixed(2)}</Text>
    </View>
  );
}
