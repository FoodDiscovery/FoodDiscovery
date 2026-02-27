import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useAuth } from "../../Providers/AuthProvider";
import { useOrderDetailCache } from "../../Providers/OrderDetailCacheProvider";
import OrderHistoryCard, { type OrderHistoryItem } from "./OrderHistoryCard";
import { tabPlaceholderStyles as styles } from "../styles";
import { sharedStyles } from "../styles";
import { toDateOnlyForFilter } from "../../lib/dateUtils";

interface OrderHistoryListProps {
  startDate?: string | null;
  endDate?: string | null;
}

function withinDateFilter(orderDate: string, startDate?: string | null, endDate?: string | null): boolean {
  if (!startDate) return true;
  const normalized = toDateOnlyForFilter(orderDate);
  if (!normalized) return false;
  if (!endDate) return normalized === startDate;
  return normalized >= startDate && normalized <= endDate;
}

export default function OrderHistoryList({ startDate = null, endDate = null }: OrderHistoryListProps) {
  const { session } = useAuth();
  const { getCached, setCached, fetchOrderDetail, fetchOrderList } = useOrderDetailCache();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  // loading for initial render
  const hasLoadedOnce = useRef(false);

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

  // Refetch whenever the Order History tab is focused (including first load)
  useFocusEffect(
    useCallback(() => {
      const isInitial = !hasLoadedOnce.current;
      if (isInitial) setLoading(true);
      loadOrders().finally(() => {
        setLoading(false);
        hasLoadedOnce.current = true;
      });
    }, [loadOrders])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadOrders().finally(() => setRefreshing(false));
  }, [loadOrders]);

  if (loading) {
    return (
      <View style={[styles.container, styles.containerCenter]}>
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

  const filteredOrders = orders.filter((order) =>
    withinDateFilter(order.createdAt ?? order.date, startDate, endDate)
  );

  if (filteredOrders.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>No orders match those date filters.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.orderListScroll}
      contentContainerStyle={styles.orderListContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {filteredOrders.map((order, index) => {
        const isOpening = loadingOrderId === order.id;
        const displayNumber = filteredOrders.length - index; // 1 = oldest, n = newest
        return (
          <View key={order.id}>
            <Pressable
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
              style={({ pressed }) =>
                pressed || isOpening ? sharedStyles.pressedOpacity70 : {}
              }
              disabled={isOpening}
            >
              <OrderHistoryCard order={order} displayNumber={displayNumber} />
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}
