import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../Providers/AuthProvider";
import { useOrderDetailCache } from "../../Providers/OrderDetailCacheProvider";
import OrderHistoryCard, { type OrderHistoryItem } from "./OrderHistoryCard";
import { tabPlaceholderStyles as styles } from "../styles";

export default function OrderHistoryList() {
  const { session } = useAuth();
  const { getCached, setCached, fetchOrderDetail, fetchOrderList } = useOrderDetailCache();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // if user changes or new function reference for fetchOrderList
  const loadOrders = useCallback(async () => {
    const userId = session?.user?.id ?? "";
    setError(null);
    const result = await fetchOrderList(userId);
    if ("error" in result) {
      setError(result.error);
      setOrders([]);
    } else {
      setOrders(result.data);
    }
  }, [session?.user?.id, fetchOrderList]);

  // load list on mount and when user changes
  useEffect(() => {
    setLoading(true);
    loadOrders().finally(() => setLoading(false));
  }, [loadOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders().finally(() => setRefreshing(false));
  }, [loadOrders]);

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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
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
