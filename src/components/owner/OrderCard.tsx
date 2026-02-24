import { Text, TouchableOpacity, View } from "react-native";
import { ownerHomeStyles as styles } from "../styles";
import OrderItemRow from "./OrderItemRow";

export type OrderStatus = "pending" | "confirmed" | "ready" | "picked_up";

export interface OrderItem {
  quantity: number;
  price_at_time_of_purchase: number;
  menu_items: { name: string } | null;
}

export interface OrderCardProps {
  id: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  customerName: string | null;
  orderItems: OrderItem[];
  onMarkReady?: () => void;
  onMarkCompleted?: () => void;
  isUpdating?: boolean;
}

function formatOrderTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    const now = new Date();
    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();
    if (isToday) {
      return d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    }
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

function abbreviateName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fullName;
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

function getStatusBadge(status: OrderStatus) {
  if (status === "confirmed") {
    return (
      <View style={[styles.statusBadge, styles.statusBadgeConfirmed]}>
        <Text style={[styles.statusText, styles.statusTextConfirmed]}>
          Confirmed
        </Text>
      </View>
    );
  }
  if (status === "ready") {
    return (
      <View style={[styles.statusBadge, styles.statusBadgeReady]}>
        <Text style={[styles.statusText, styles.statusTextReady]}>
          Ready for pickup
        </Text>
      </View>
    );
  }
  return null;
}

export default function OrderCard({
  id,
  status,
  totalAmount,
  createdAt,
  customerName,
  orderItems,
  onMarkReady,
  onMarkCompleted,
  isUpdating = false,
}: OrderCardProps) {
  const displayName = customerName?.trim()
    ? abbreviateName(customerName)
    : "Guest";
  const canMarkReady = status === "confirmed" && onMarkReady;
  const canMarkCompleted = status === "ready" && onMarkCompleted;

  return (
    <View style={styles.card} testID={`order-card-${id}`}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.customerName}>{displayName}</Text>
          <Text style={styles.orderTime}>{formatOrderTime(createdAt)}</Text>
        </View>
        {getStatusBadge(status)}
      </View>

      <View style={styles.itemsSection}>
        <Text style={styles.itemsSectionTitle}>Items</Text>
        {orderItems.map((item, idx) => (
          <OrderItemRow
            key={idx}
            quantity={item.quantity}
            itemName={item.menu_items?.name ?? "Unknown item"}
            priceAtTimeOfPurchase={Number(item.price_at_time_of_purchase)}
          />
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>
          ${Number(totalAmount).toFixed(2)}
        </Text>
      </View>

      {(canMarkReady || canMarkCompleted) && (
        <View style={styles.actionsRow}>
          {canMarkReady && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.actionBtnPrimary,
                isUpdating && styles.actionBtnDisabled,
              ]}
              onPress={onMarkReady}
              disabled={isUpdating}
              testID={`order-${id}-mark-ready`}
            >
              <Text style={styles.actionBtnText}>Ready for pickup</Text>
            </TouchableOpacity>
          )}
          {canMarkCompleted && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                styles.actionBtnSecondary,
                isUpdating && styles.actionBtnDisabled,
              ]}
              onPress={onMarkCompleted}
              disabled={isUpdating}
              testID={`order-${id}-mark-completed`}
            >
              <Text style={[styles.actionBtnText, styles.actionBtnTextSecondary]}>
                Completed
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
