import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../Providers/AuthProvider";
import { useOrderDetailCache } from "../../Providers/OrderDetailCacheProvider";
import { supabase } from "../../lib/supabase";
import OrderHistoryCard, { type OrderHistoryItem } from "./OrderHistoryCard";
import { tabPlaceholderStyles as styles } from "../styles";

function formatOrderDate(createdAt: string): string {
  const d = new Date(createdAt);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

export default function OrderHistoryList() {
  const { session } = useAuth();
  const { getCached, setCached, fetchOrderDetail } = useOrderDetailCache();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);

      // get the past orders that belong to the current user
      const { data, error: fetchError } = await supabase
        .from("orders")
        .select("id, created_at, total_amount")
        .eq("customer_id", session?.user?.id ?? "")
        .order("created_at", { ascending: false });

      if (cancelled) return;
      if (fetchError) {
        setError(fetchError.message);
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderRows = data ?? [];
      if (orderRows.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      // get the order_items count associated with each order_id
      const orderIds = orderRows.map((r: { id: string }) => r.id);
      const { data: itemsData } = await supabase
        .from("order_items")
        .select("order_id, quantity")
        .in("order_id", orderIds);

      const itemCountByOrderId: Record<string, number> = {};
      for (const row of itemsData ?? []) {
        const r = row as { order_id: string; quantity: number };
        itemCountByOrderId[r.order_id] = (itemCountByOrderId[r.order_id] ?? 0) + Number(r.quantity);
      }

      // set the item count for each past order
      setOrders(
        orderRows.map((row: { id: string; created_at: string; total_amount: number }) => ({
          id: row.id,
          date: formatOrderDate(row.created_at),
          totalPrice: Number(row.total_amount),
          itemCount: itemCountByOrderId[row.id] ?? 0,
        }))
      );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center" }]}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>{error}</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>No orders yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, width: "100%", marginTop: 16 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {orders.map((order) => {
        const isOpening = loadingOrderId === order.id;
        return (
          <Pressable
            key={order.id}
            onPress={async () => {
              const cached = getCached(order.id);
              if (cached) {
                router.push(`/(home)/order/${order.id}`);
                return;
              }
              const userId = session?.user?.id;
              if (!userId) return;
              setLoadingOrderId(order.id);
              const result = await fetchOrderDetail(order.id, userId);
              setLoadingOrderId(null);
              if ("data" in result) setCached(order.id, result.data);
              router.push(`/(home)/order/${order.id}`);
            }}
            style={({ pressed }) => [{ opacity: pressed || isOpening ? 0.7 : 1 }]}
            disabled={isOpening}
          >
            <OrderHistoryCard order={order} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
