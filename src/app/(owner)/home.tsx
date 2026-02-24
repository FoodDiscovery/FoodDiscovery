import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import { supabase } from "../../lib/supabase";
import OrderCard, {
  type OrderItem,
  type OrderStatus,
} from "../../components/owner/OrderCard";
import { ownerHomeStyles as styles } from "../../components/styles";

interface OrderRow {
  id: string;
  status: OrderStatus;
  total_amount: number | string;
  created_at: string;
  customer_id: string | null;
  order_items: OrderItem[];
  profiles: { full_name: string | null } | null;
}

export default function OwnerHomeScreen() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadRestaurantAndOrders = useCallback(async () => {
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();
    if (userErr || !user) {
      Alert.alert("Not signed in", "Please sign in again.");
      router.replace("/(auth)/sign-in");
      return;
    }

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileErr || profile?.role !== "owner") {
      Alert.alert("Not an owner", "This page is only for business owners.");
      router.replace("/(home)/home");
      return;
    }

    const { data: restaurant, error: restErr } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (restErr || !restaurant) {
      setRestaurantId(null);
      setOrders([]);
      setLoading(false);
      return;
    }

    setRestaurantId(restaurant.id);

    const { data: ordersData, error: ordersErr } = await supabase
      .from("orders")
      .select(
        `
        id,
        status,
        total_amount,
        created_at,
        customer_id,
        order_items (
          quantity,
          price_at_time_of_purchase,
          menu_items (name)
        ),
        profiles (full_name)
      `
      )
      .eq("restaurant_id", restaurant.id)
      .in("status", ["confirmed", "ready"])
      .order("created_at", { ascending: false });

    if (ordersErr) {
      setOrders([]);
      setLoading(false);
      return;
    }

    const rows = (ordersData ?? []) as unknown as OrderRow[];
    setOrders(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRestaurantAndOrders();
  }, [loadRestaurantAndOrders]);

  const handleMarkReady = useCallback(
    async (orderId: string) => {
      setUpdatingOrderId(orderId);
      const { error } = await supabase
        .from("orders")
        .update({ status: "ready" })
        .eq("id", orderId);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: "ready" as OrderStatus } : o
          )
        );
      }
      setUpdatingOrderId(null);
    },
    []
  );

  const handleMarkCompleted = useCallback(
    async (orderId: string) => {
      setUpdatingOrderId(orderId);
      const { error } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", orderId);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      }
      setUpdatingOrderId(null);
    },
    []
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0B2D5B" />
          <Text style={styles.loadingText}>Loading orders…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Incoming Orders</Text>
        <Text style={styles.subtitle}>
          Manage pickup orders for your restaurant
        </Text>
      </View>

      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No incoming orders</Text>
          <Text style={styles.emptySub}>
            {restaurantId
              ? "New orders will appear here when customers place them."
              : "Set up your restaurant in Profile to receive orders."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <OrderCard
              id={item.id}
              status={item.status as OrderStatus}
              totalAmount={Number(item.total_amount)}
              createdAt={item.created_at}
              customerName={
                (item.profiles as { full_name: string | null } | null)
                  ?.full_name ?? null
              }
              orderItems={item.order_items ?? []}
              onMarkReady={
                item.status === "confirmed"
                  ? () => handleMarkReady(item.id)
                  : undefined
              }
              onMarkCompleted={
                item.status === "ready"
                  ? () => handleMarkCompleted(item.id)
                  : undefined
              }
              isUpdating={updatingOrderId === item.id}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
