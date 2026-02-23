import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "../../lib/supabase";
import { useCart, type CartItem } from "../../Providers/CartProvider";
import { useAuth } from "../../Providers/AuthProvider";

// ✅ Fix: forbid require() imports
import FoodDiscoveryLogo from "../../../assets/images/fooddiscovery-logo.png";

function requiredEnv(
  name: "EXPO_PUBLIC_SUPABASE_URL" | "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function groupByRestaurant(
  items: CartItem[]
): { restaurantId: string; restaurantName: string; items: CartItem[] }[] {
  const byRestaurant = new Map<string, CartItem[]>();
  for (const item of items) {
    const key = item.restaurantId;
    const list = byRestaurant.get(key) ?? [];
    list.push(item);
    byRestaurant.set(key, list);
  }
  return Array.from(byRestaurant.entries()).map(([restaurantId, items]) => ({
    restaurantId,
    restaurantName: items[0].restaurantName,
    items,
  }));
}

const SUPABASE_URL = requiredEnv("EXPO_PUBLIC_SUPABASE_URL");
const SUPABASE_ANON_KEY = requiredEnv("EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const PAYMENT_SHEET_URL = `${SUPABASE_URL}/functions/v1/payment-sheet-stripe`;
const MERCHANT_DISPLAY_NAME = "Food Discovery";
const SALES_TAX_RATE = 0.0975; // 9.75%

export default function CheckoutScreen() {
  const insets = useSafeAreaInsets();
  const { items, subtotal, itemCount, clearCart } = useCart();
  const { session } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurantAddresses, setRestaurantAddresses] = useState<Record<string, string>>({});

  const tax = useMemo(() => subtotal * SALES_TAX_RATE, [subtotal]);
  const total = useMemo(() => subtotal + tax, [subtotal, tax]);

  useEffect(() => {
    if (items.length === 0) {
      setRestaurantAddresses({});
      return;
    }
    const restaurantIds = [...new Set(items.map((i) => i.restaurantId))];
    (async () => {
      const { data } = await supabase
        .from("locations")
        .select("restaurant_id, address_text")
        .in("restaurant_id", restaurantIds);

      const byId: Record<string, string> = {};
      for (const row of data ?? []) {
        const r = row as { restaurant_id: string; address_text: string | null };
        if (r.address_text && !byId[r.restaurant_id]) byId[r.restaurant_id] = r.address_text;
      }
      setRestaurantAddresses(byId);
    })();
  }, [items]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }
    const amountCents = Math.round(total * 100);
    if (amountCents < 50) {
      setError("Minimum order is $0.50.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const metadata: Record<string, string> = {
        restaurant_id: items[0].restaurantId,
        restaurant_name: items[0].restaurantName,
        cart: JSON.stringify(
          items.map((i) => ({
            itemId: i.itemId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          }))
        ),
      };
      if (session?.user?.id) metadata.user_id = session.user.id;
      if (session?.user?.email) metadata.user_email = session.user.email;

      const res = await fetch(PAYMENT_SHEET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: amountCents,
          currency: "usd",
          metadata,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Request failed: ${res.status}`);
      }

      const data = (await res.json()) as {
        client_secret?: string;
        paymentIntentClientSecret?: string;
      };
      const clientSecret = data.paymentIntentClientSecret ?? data.client_secret;
      if (!clientSecret) throw new Error("No payment client secret returned");

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: MERCHANT_DISPLAY_NAME,
        // returnURL: "fooddiscovery://stripe-redirect",
      });
      if (initError) throw new Error(initError.message);

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === "Canceled") return;
        throw new Error(presentError.message);
      }

      clearCart();
      Alert.alert("Order placed", "Thank you for your order.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={t.safe} edges={["top"]}>
      {/* Header (matches Home theme) */}
      <View style={[t.header, { paddingTop: Math.max(10, insets.top * 0.45) }]}>
        <View style={t.headerCenter}>
          <Image source={FoodDiscoveryLogo} style={t.headerLogo} resizeMode="contain" />
          <Text style={t.title}>Checkout</Text>
          <Text style={t.subtitle}>Pay with card. Confirm after payment.</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          t.page,
          { paddingBottom: Math.max(24, insets.bottom + 18) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={t.emptyCard}>
            <Text style={t.emptyTitle}>Your cart is empty</Text>
            <Text style={t.emptySub}>Add items from a restaurant first.</Text>
          </View>
        ) : (
          <>
            {groupByRestaurant(items).map(
              ({ restaurantId, restaurantName, items: restaurantItems }) => (
                <View key={restaurantId} style={t.card}>
                  <Text style={t.cardTitle}>{restaurantName}</Text>

                  {restaurantAddresses[restaurantId] ? (
                    <Text style={t.cardMeta}>{restaurantAddresses[restaurantId]}</Text>
                  ) : null}

                  <View style={{ height: 10 }} />

                  {restaurantItems.map((item) => (
                    <View key={item.key} style={t.lineRow}>
                      <Text style={t.lineLeft} numberOfLines={2}>
                        {item.quantity} × {item.name}
                      </Text>
                      <Text style={t.lineRight}>
                        ${(item.quantity * item.price).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )
            )}

            <View style={t.card}>
              <Text style={t.summaryRow}>Items: {itemCount}</Text>
              <Text style={t.summaryRow}>Subtotal: ${subtotal.toFixed(2)}</Text>
              <Text style={t.summaryRow}>Tax: ${tax.toFixed(2)}</Text>
              <Text style={[t.summaryRow, t.summaryTotal]}>
                Total: ${total.toFixed(2)}
              </Text>
            </View>

            {error ? (
              <View style={[t.card, { borderColor: "#B42318" }]}>
                <Text style={t.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[t.payBtn, loading && { opacity: 0.7 }]}
              onPress={handleCheckout}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={NAVY} />
              ) : (
                <Text style={t.payBtnText}>Pay ${total.toFixed(2)}</Text>
              )}
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

const t = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerLogo: {
    width: 210,
    height: 56,
    marginBottom: 2,
  },

  title: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: "700",
    color: "#0B1220",
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },

  page: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 6 : 10,
    gap: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B1220",
  },
  cardMeta: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  lineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  lineLeft: {
    flex: 1,
    paddingRight: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  lineRight: {
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },

  summaryRow: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 4,
  },
  summaryTotal: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },

  errorText: { fontSize: 14, fontWeight: "600", color: "#B42318" },

  payBtn: {
    backgroundColor: GOLD,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  payBtnText: {
    color: NAVY,
    fontWeight: "700",
    fontSize: 16,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  emptySub: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
});