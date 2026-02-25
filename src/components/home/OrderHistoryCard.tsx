import React from "react";
import { Text, View } from "react-native";
import { orderHistoryCardStyles as styles } from "../styles";

export interface OrderHistoryItem {
  id: string;
  date: string; // ISO or "DD/MM/YYYY" for display
  itemCount?: number; // optional when coming from orders table (no line items)
  totalPrice: number;
  status?: string; // order_status from orders table (e.g. confirmed, ready, completed)
}

interface OrderHistoryCardProps {
  order: OrderHistoryItem;
  /** Display number 1..n (1 = oldest, n = newest). When set, shown instead of raw id. */
  displayNumber?: number;
}

const SHORT_ID_LENGTH = 8;

function getStatusTextStyle(status: string | undefined): object | null {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === "confirmed") return styles.statusTextConfirmed;
  if (s === "ready") return styles.statusTextReady;
  if (s === "completed") return styles.statusTextCompleted;
  return styles.statusTextDefault;
}

// takes in the order_items as props from its caller
export default function OrderHistoryCard({ order, displayNumber }: OrderHistoryCardProps) {
  const dateDisplay =
    order.date.length === 10 && order.date.includes("-")
      ? (() => {
          const [y, m, d] = order.date.split("-");
          return `${m}/${d}/${y}`; // ISO -> MM/DD/YYYY
        })()
      : order.date;
  const idLabel =
    displayNumber != null ? String(displayNumber) : order.id.length > SHORT_ID_LENGTH ? `${order.id.slice(0, SHORT_ID_LENGTH)}...` : order.id;
  const statusTextStyle = getStatusTextStyle(order.status);
  const statusDisplay = order.status ? order.status.toLowerCase() : null;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.orderId}>Order ID: {idLabel}</Text>
        {statusDisplay && statusTextStyle ? (
          <Text style={[styles.statusText, statusTextStyle]}>{statusDisplay}</Text>
        ) : (
          <View style={styles.statusWrap} />
        )}
      </View>
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
