import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";
import { useStripe } from "@stripe/stripe-react-native";

import { supabase } from "../../lib/supabase";
import { useCart, type CartItem } from "../../Providers/CartProvider";
import { useAuth } from "../../Providers/AuthProvider";
import { menuViewStyles as styles } from "../../components/styles";

function requiredEnv(name: "EXPO_PUBLIC_SUPABASE_URL" | "EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Grouping cart items by restaurant on checkout screen
function groupByRestaurant(
  items: CartItem[]
): { restaurantId: string; restaurantName: string; items: CartItem[] }[] {
  const byRestaurant = new Map<string, CartItem[]>();
  for (const item of items) {
    const key = item.restaurantId;
    let list = byRestaurant.get(key);
    if (!list) {
      list = [];
      byRestaurant.set(key, list);
    }
    list.push(item);
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
  const { items, subtotal, itemCount, clearCart } = useCart();
  const { session } = useAuth();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restaurantAddresses, setRestaurantAddresses] = useState<Record<string, string>>({});

  const tax = subtotal * SALES_TAX_RATE;
  const total = subtotal + tax;

  // Fetching restaurant addresses from supabase to display on checkout screen
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
        if (r.address_text && !byId[r.restaurant_id]) {
          byId[r.restaurant_id] = r.address_text;
        }
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
      if (session?.user?.id) {
        metadata.user_id = session.user.id;
      }
      if (session?.user?.email) {
        metadata.user_email = session.user.email;
      }

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
      const clientSecret =
        data.paymentIntentClientSecret ?? data.client_secret;
      if (!clientSecret) {
        throw new Error("No payment client secret returned");
      }

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: MERCHANT_DISPLAY_NAME,
      });
      if (initError) {
        throw new Error(initError.message);
      }

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code === "Canceled") {
          return;
        }
        throw new Error(presentError.message);
      }

      clearCart();
      Alert.alert("Order placed", "Thank you for your order.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Payment failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.heading}>Checkout</Text>
      <Text style={styles.subtitle}>
        Pay with card. Your order will be confirmed after payment.
      </Text>

      {items.length === 0 ? (
        <Text style={styles.emptyText}>
          Your cart is empty. Add items from a restaurant first.
        </Text>
      ) : (
        <>
          {groupByRestaurant(items).map(({ restaurantId, restaurantName, items: restaurantItems }) => (
            <View key={restaurantId} style={[styles.categoryCard, { marginBottom: 12 }]}>
              <Text style={[styles.itemName, { fontWeight: "700", marginBottom: 4 }]}>
                {restaurantName}
              </Text>
              {restaurantAddresses[restaurantId] ? (
                <Text
                  style={[
                    styles.itemName,
                    {
                      fontWeight: "400",
                      fontSize: 13,
                      color: "#666",
                      marginBottom: 8,
                    },
                  ]}
                >
                  {restaurantAddresses[restaurantId]}
                </Text>
              ) : null}
              {restaurantItems.map((item) => (
                <View
                  key={item.key}
                  style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}
                >
                  <Text style={styles.itemName}>
                    {item.quantity} {item.name}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ${(item.quantity * item.price).toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          ))}

          <View style={styles.categoryCard}>
            <Text style={styles.itemName}>Items: {itemCount}</Text>
            <Text style={styles.itemPrice}>
              Subtotal: ${subtotal.toFixed(2)}
            </Text>
            <Text style={styles.itemPrice}>
              Tax: ${tax.toFixed(2)}
            </Text>
            <Text style={[styles.itemPrice, { fontWeight: "700", marginTop: 4 }]}>
              Total: ${total.toFixed(2)}
            </Text>
          </View>

          {error ? (
            <View style={[styles.categoryCard, { borderColor: "#B42318" }]}>
              <Text style={[styles.itemName, { color: "#B42318" }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[
              styles.addBtn,
              {
                alignItems: "center",
                paddingVertical: 14,
                backgroundColor: "#34A853",
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={[styles.addBtnText, { fontSize: 16 }]}>
                Pay ${total.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>← Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
