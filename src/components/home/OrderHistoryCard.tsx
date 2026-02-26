import React from "react";
import { Text, View } from "react-native";
import { formatDateOnlyForDisplay, formatIsoToPstDisplay } from "../../lib/dateUtils";
import { orderHistoryCardStyles as styles } from "../styles";

export interface OrderHistoryItem {
  id: string;
  date: string; // ISO, YYYY-MM-DD, or MM/DD/YYYY for display
  createdAt?: string; // raw timestamp for filtering
  itemCount?: number; // optional when coming from orders table (no line items)
  totalPrice: number;
  status?: string; // order_status from orders table (e.g. confirmed, ready, completed)
  orderNumber?: number; // from orders.order_number, displayed as Order ID when present
}

interface OrderHistoryCardProps {
  order: OrderHistoryItem;
  /** Display number 1..n (1 = oldest, n = newest). When set, shown instead of raw id. */
  displayNumber?: number;
}

const SHORT_ID_LENGTH = 8;

function getStatusBadgeStyles(status: string | undefined): { badge: object; text: object } | null {
  if (!status) return null;
  const s = status.toLowerCase();
  if (s === "confirmed") return { badge: styles.statusBadgeConfirmed, text: styles.statusTextConfirmed };
  if (s === "ready") return { badge: styles.statusBadgeReady, text: styles.statusTextReady };
  if (s === "completed") return { badge: styles.statusBadgeCompleted, text: styles.statusTextCompleted };
  return { badge: styles.statusBadgeDefault, text: styles.statusTextDefault };
}

// takes in the order_items as props from its caller
export default function OrderHistoryCard({ order, displayNumber }: OrderHistoryCardProps) {
  const dateDisplay =
    order.date.length === 10 && order.date.includes("-")
      ? formatDateOnlyForDisplay(order.date)
      : /^\d{4}-\d{2}-\d{2}T/.test(order.date)
        ? formatIsoToPstDisplay(order.date)
        : order.date;
  const idLabel =
    order.orderNumber != null
      ? String(order.orderNumber)
      : displayNumber != null
        ? String(displayNumber)
        : order.id.length > SHORT_ID_LENGTH
          ? `${order.id.slice(0, SHORT_ID_LENGTH)}...`
          : order.id;
  const statusBadgeStyles = getStatusBadgeStyles(order.status);
  const statusDisplay = order.status ? order.status.toLowerCase() : null;

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.topRow}>
          <Text style={styles.orderId}>Order ID: {idLabel}</Text>
          {statusDisplay && statusBadgeStyles ? (
            <View style={[styles.statusBadge, statusBadgeStyles.badge]}>
              <Text style={[styles.statusText, statusBadgeStyles.text]}>{statusDisplay}</Text>
            </View>
          ) : (
            <View style={styles.statusWrap} />
          )}
        </View>
        <Text style={styles.date}>{dateDisplay}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.itemCount}>
          {order.itemCount != null ? `${order.itemCount} item${order.itemCount === 1 ? "" : "s"}` : "—"}
        </Text>
        <Text style={styles.price}>${order.totalPrice.toFixed(2)}</Text>
      </View>
    </View>
  );
}
