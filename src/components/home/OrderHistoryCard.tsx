import React from "react";
import { Text, View } from "react-native";
import { orderHistoryCardStyles as styles } from "../styles";

export interface OrderHistoryItem {
  id: string;
  date: string; // ISO or "DD/MM/YYYY" for display
  itemCount?: number; // optional when coming from orders table (no line items)
  totalPrice: number;
}

interface OrderHistoryCardProps {
  order: OrderHistoryItem;
}

const SHORT_ID_LENGTH = 8;

// takes in the order_items as props from its caller
export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const dateDisplay =
    order.date.length === 10 && order.date.includes("-")
      ? (() => {
          const [y, m, d] = order.date.split("-");
          return `${m}/${d}/${y}`; // ISO -> MM/DD/YYYY
        })()
      : order.date;
  const shortId =
    order.id.length > SHORT_ID_LENGTH ? `${order.id.slice(0, SHORT_ID_LENGTH)}...` : order.id;

  return (
    <View style={styles.card}>
      <Text style={styles.orderId}>Order ID: {shortId}</Text>
      <Text style={styles.date}>{dateDisplay}</Text>
      <View style={styles.row}>
        <Text style={styles.itemCount}>
          {order.itemCount != null ? `${order.itemCount} item${order.itemCount === 1 ? "" : "s"}` : "—"}
        </Text>
        <Text style={styles.price}>${order.totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );
}
