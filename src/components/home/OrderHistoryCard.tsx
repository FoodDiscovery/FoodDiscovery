import React from "react";
import { StyleSheet, Text, View } from "react-native";

const NAVY = "#0B2D5B";

export interface OrderHistoryItem {
  id: string;
  date: string; // ISO or "DD/MM/YYYY" for display
  itemCount: number;
  totalPrice: number;
}

interface OrderHistoryCardProps {
  order: OrderHistoryItem;
}

export default function OrderHistoryCard({ order }: OrderHistoryCardProps) {
  const dateDisplay =
    order.date.length === 10 && order.date.includes("-")
      ? order.date.split("-").reverse().join("/") // ISO -> DD/MM/YYYY
      : order.date;

  return (
    <View style={styles.card}>
      <Text style={styles.orderId}>Order ID: {order.id}</Text>
      <Text style={styles.date}>{dateDisplay}</Text>
      <View style={styles.row}>
        <Text style={styles.itemCount}>{order.itemCount} item{order.itemCount === 1 ? "" : "s"}</Text>
        <Text style={styles.price}>${order.totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0B1220",
  },
  date: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  itemCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
});
