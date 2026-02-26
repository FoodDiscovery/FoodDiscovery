import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "../../lib/supabase";
import { useCart, type CartItem } from "../../Providers/CartProvider";
import { useAuth } from "../../Providers/AuthProvider";
import {
  checkoutStyles as styles,
  sharedStyles,
  NAVY,
} from "../../components/styles";

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
        cart: JSON.stringify(
          items.map((i) => ({
            itemId: i.itemId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            restaurant_id: i.restaurantId,
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
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header (matches Home theme) */}
      <View style={[styles.header, { paddingTop: Math.max(10, insets.top * 0.45) }]}>
        <View style={styles.headerCenter}>
          <Image source={FoodDiscoveryLogo} style={styles.headerLogo} resizeMode="contain" />
          <Text style={styles.title}>Checkout</Text>
          <Text style={styles.subtitle}>Pay with card. Confirm after payment.</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.replace("/(home)/cart")}
          style={styles.headerBackBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.headerBackText}>←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.page, { paddingBottom: Math.max(24, insets.bottom + 18) }]}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySub}>Add items from a restaurant first.</Text>
          </View>
        ) : (
          <>
            {groupByRestaurant(items).map(
              ({ restaurantId, restaurantName, items: restaurantItems }) => (
                <View key={restaurantId} style={styles.card}>
                  <Text style={styles.cardTitle}>{restaurantName}</Text>

                  {restaurantAddresses[restaurantId] ? (
                    <Text style={styles.cardMeta}>{restaurantAddresses[restaurantId]}</Text>
                  ) : null}

                  <View style={sharedStyles.spacerHeight10} />

                  {restaurantItems.map((item) => (
                    <View key={item.key} style={styles.lineRow}>
                      <Text style={styles.lineLeft} numberOfLines={2}>
                        {item.quantity} × {item.name}
                      </Text>
                      <Text style={styles.lineRight}>
                        ${(item.quantity * item.price).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              )
            )}

            <View style={styles.card}>
              <Text style={styles.summaryRow}>Items: {itemCount}</Text>
              <Text style={styles.summaryRow}>Subtotal: ${subtotal.toFixed(2)}</Text>
              <Text style={styles.summaryRow}>Tax: ${tax.toFixed(2)}</Text>
              <Text style={[styles.summaryRow, styles.summaryTotal]}>
                Total: ${total.toFixed(2)}
              </Text>
            </View>

            {error ? (
              <View style={[styles.card, styles.errorCardBorder]}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.payBtn, loading && styles.loadingOpacity]}
              onPress={handleCheckout}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={NAVY} />
              ) : (
                <Text style={styles.payBtnText}>Pay ${total.toFixed(2)}</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}