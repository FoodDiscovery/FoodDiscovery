// src/app/(home)/cart.tsx  (or wherever your CartScreen file lives)
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { useCart } from "../../Providers/CartProvider";

export default function CartScreen() {
  const insets = useSafeAreaInsets();

  const {
    items,
    incrementItem,
    decrementItem,
    removeItem,
    clearCart,
    itemCount,
    subtotal,
  } = useCart();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(10, insets.top * 0.45),
          },
        ]}
      >
        <Text style={styles.headerTitle}>Your Cart</Text>

        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerBackBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.page,
          { paddingBottom: (insets.bottom ?? 0) + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Review your selected items before checkout.
        </Text>

        {items.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>
              Add menu items from a restaurant page.
            </Text>

            <TouchableOpacity
              style={[styles.pillSmallGold, { marginTop: 14 }]}
              activeOpacity={0.85}
              onPress={() => router.back()}
            >
              <Text style={styles.pillSmallGoldText}>Browse restaurants</Text>
            </TouchableOpacity>
          </View>
        )}

        {items.map((item) => (
          <View key={item.key} style={styles.card}>
            <View style={styles.rowTop}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbPlaceholder}>
                  <Text style={{ fontSize: 18 }}>📷</Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemMeta} numberOfLines={1}>
                  {item.restaurantName}
                </Text>
                <Text style={styles.itemPrice}>${item.price.toFixed(2)} each</Text>
              </View>
            </View>

            <View style={styles.rowBottom}>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  activeOpacity={0.85}
                  onPress={() => decrementItem(item.key)}
                >
                  <Text style={styles.qtyBtnText}>−</Text>
                </TouchableOpacity>

                <Text style={styles.qtyText}>Qty {item.quantity}</Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  activeOpacity={0.85}
                  onPress={() => incrementItem(item.key)}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.removeBtn}
                activeOpacity={0.85}
                onPress={() => removeItem(item.key)}
              >
                <Text style={styles.removeBtnText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {items.length > 0 && (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items</Text>
                <Text style={styles.summaryValue}>{itemCount}</Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ${subtotal.toFixed(2)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              activeOpacity={0.85}
              onPress={() => router.push("/checkout")}
            >
              <Text style={styles.checkoutBtnText}>Check out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.clearBtn}
              activeOpacity={0.85}
              onPress={clearCart}
            >
              <Text style={styles.clearBtnText}>Clear cart</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const NAVY = "#0B2D5B";
const GOLD = "#F5C542";
const BG = "#F3F6FB";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B1220",
    letterSpacing: -0.2,
  },
  headerBackBtn: {
    position: "absolute",
    left: 16,
    top: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5ECF7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerBackText: {
    fontSize: 18,
    fontWeight: "600",
    color: NAVY,
  },

  page: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 12,
  },

  // empty state
  empty: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  emptySub: {
    marginTop: 6,
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "600",
  },

  // cards
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
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

  rowTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },

  thumb: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#EEF2F7",
  },
  thumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
  },

  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0B1220",
    letterSpacing: -0.1,
  },
  itemMeta: {
    marginTop: 2,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  itemPrice: {
    marginTop: 6,
    fontSize: 14,
    color: NAVY,
    fontWeight: "600",
  },

  rowBottom: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: "700",
    color: NAVY,
    marginTop: Platform.OS === "ios" ? -1 : 0,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#B42318",
  },
  removeBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginTop: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },

  checkoutBtn: {
    backgroundColor: NAVY,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  checkoutBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },

  clearBtn: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  clearBtnText: {
    color: NAVY,
    fontWeight: "600",
    fontSize: 14,
  },

  // reused pill style for empty state CTA
  pillSmallGold: {
    backgroundColor: GOLD,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillSmallGoldText: {
    color: NAVY,
    fontWeight: "600",
    fontSize: 14,
  },
});
