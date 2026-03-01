import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../../../lib/supabase";
import { formatIsoToPstDisplay } from "../../../lib/dateUtils";
import ownerOrderReceiptStyles, {
  OWNER_NAVY,
} from "../../../components/styles/ownerOrderReceiptStyles";

const styles = ownerOrderReceiptStyles;
import sharedStyles from "../../../components/styles/sharedStyles";

const SALES_TAX_RATE = 0.0975;

interface OrderItemRow {
  quantity: number;
  price_at_time_of_purchase: number;
  name: string;
}

export default function OwnerOrderReceiptScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [address, setAddress] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<OrderItemRow[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<string>("");

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    let cancelled = false;
    (async () => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr || !user) {
        if (!cancelled) {
          setError("Not signed in.");
          setLoading(false);
        }
        return;
      }

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileErr || profile?.role !== "owner") {
        if (!cancelled) {
          setError("Access denied.");
          setLoading(false);
        }
        return;
      }

      const { data: restaurant, error: restaurantErr } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (restaurantErr || !restaurant?.id) {
        if (!cancelled) {
          setError("Restaurant not found.");
          setLoading(false);
        }
        return;
      }

      const { data: order, error: orderErr } = await supabase
        .from("orders")
        .select("restaurant_id, total_amount, order_number, created_at")
        .eq("id", orderId)
        .eq("restaurant_id", (restaurant as { id: string }).id)
        .eq("status", "completed")
        .maybeSingle();

      if (orderErr || !order) {
        if (!cancelled) {
          setError(orderErr?.message ?? "Order not found.");
          setLoading(false);
        }
        return;
      }

      const orderRow = order as {
        restaurant_id: string;
        total_amount: number;
        order_number: number | null;
        created_at: string;
      };

      const [restRes, locRes, itemsRes] = await Promise.all([
        supabase
          .from("restaurants")
          .select("name")
          .eq("id", orderRow.restaurant_id)
          .single(),
        supabase
          .from("locations")
          .select("address_text")
          .eq("restaurant_id", orderRow.restaurant_id)
          .maybeSingle(),
        supabase
          .from("order_items")
          .select("quantity, price_at_time_of_purchase, menu_items(name)")
          .eq("order_id", orderId),
      ]);

      if (cancelled) return;

      const restaurantNameVal =
        (restRes.data as { name: string } | null)?.name ?? "Restaurant";
      const addressVal =
        (locRes.data as { address_text: string | null } | null)?.address_text ??
        null;

      const items = (itemsRes.data ?? []) as {
        quantity: number;
        price_at_time_of_purchase: number;
        menu_items: { name: string }[] | null;
      }[];

      const formattedItems = items.map((i) => {
        const menuItem = Array.isArray(i.menu_items) ? i.menu_items[0] : i.menu_items;
        return {
          quantity: i.quantity,
          price_at_time_of_purchase: i.price_at_time_of_purchase,
          name: menuItem?.name ?? "Item",
        };
      });

      setRestaurantName(restaurantNameVal);
      setAddress(addressVal);
      setLineItems(formattedItems);
      setTotalAmount(Number(orderRow.total_amount));
      setOrderNumber(orderRow.order_number);
      setCreatedAt(orderRow.created_at);
      setError(null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={OWNER_NAVY} />
          <Text style={styles.subtitle}>Loading receipt...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <Text style={styles.subtitle}>{error}</Text>
          <Pressable
            onPress={() => router.replace("/(owner)/analytics")}
            style={styles.goBackBtn}
          >
            <Text style={styles.goBackText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const subtotal = lineItems.reduce(
    (sum, i) => sum + i.quantity * Number(i.price_at_time_of_purchase),
    0
  );
  const tax = subtotal * SALES_TAX_RATE;
  const receiptLabel =
    orderNumber != null ? `Order #${orderNumber}` : `Order ${orderId.slice(0, 8)}`;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View
        style={[
          styles.header,
          { paddingTop: Math.max(10, insets.top * 0.45) },
        ]}
      >
        <Pressable
          onPress={() => router.replace("/(owner)/analytics")}
          style={styles.backBtn}
          hitSlop={12}
        >
          <Ionicons name="chevron-back" size={24} color={OWNER_NAVY} />
        </Pressable>
        <Text style={styles.title}>Order Receipt</Text>
        <View style={sharedStyles.spacerWidth40} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.page,
          { paddingBottom: Math.max(24, insets.bottom + 18) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{restaurantName}</Text>
          <Text style={styles.cardMeta}>{receiptLabel}</Text>
          <Text style={styles.cardMeta}>{formatIsoToPstDisplay(createdAt)}</Text>
          {address ? (
            <Text style={styles.cardMetaAddress}>{address}</Text>
          ) : null}
          <View style={sharedStyles.spacerHeight10} />
          {lineItems.map((item, idx) => (
            <View key={idx} style={styles.lineRow}>
              <Text style={styles.lineLeft} numberOfLines={2}>
                {item.quantity} × {item.name}
              </Text>
              <Text style={styles.lineRight}>
                $
                {(item.quantity * Number(item.price_at_time_of_purchase)).toFixed(
                  2
                )}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.summaryRow}>
            Subtotal: ${subtotal.toFixed(2)}
          </Text>
          <Text style={styles.summaryRow}>Tax: ${tax.toFixed(2)}</Text>
          <Text style={styles.totalPaidLabel}>Total Paid (Customer Amount)</Text>
          <Text style={[styles.summaryRow, styles.summaryTotal]}>
            ${totalAmount.toFixed(2)}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
