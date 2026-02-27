import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";

import DateRangePickerModal, {
  type DateRangeSelection,
} from "../../components/DateRangePickerModal";
import { analyticsStyles as styles } from "../../components/styles";
import {
  dateRangeLabel,
  dateOnlyToUtcEnd,
  dateOnlyToUtcStart,
  formatIsoToPstDisplay,
} from "../../lib/dateUtils";
import { supabase } from "../../lib/supabase";

interface AnalyticsOrderItem {
  quantity: number;
  menu_items: { name: string } | { name: string }[] | null;
}

interface AnalyticsOrderRow {
  id: string;
  status: string;
  total_amount: number | string;
  created_at: string;
  order_items: AnalyticsOrderItem[];
}

function getItemName(menuItems: AnalyticsOrderItem["menu_items"]): string {
  if (Array.isArray(menuItems)) return menuItems[0]?.name ?? "Unknown item";
  return menuItems?.name ?? "Unknown item";
}

export default function OwnerAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AnalyticsOrderRow[]>([]);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateRangeSelection>({
    startDate: null,
    endDate: null,
  });

  const loadAnalytics = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      setLoading(false);
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
      setLoading(false);
      Alert.alert("Not an owner", "This page is only for business owners.");
      router.replace("/(home)/home");
      return;
    }

    const { data: restaurant, error: restaurantErr } = await supabase
      .from("restaurants")
      .select("id")
      .eq("owner_id", user.id)
      .maybeSingle();

    if (restaurantErr || !restaurant?.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    let ordersQuery = supabase
      .from("orders")
      .select(
        `
          id,
          status,
          total_amount,
          created_at,
          order_items (
            quantity,
            menu_items (name)
          )
        `
      )
      .eq("restaurant_id", restaurant.id)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (dateFilter.startDate) {
      const endDate = dateFilter.endDate ?? dateFilter.startDate;
      ordersQuery = ordersQuery
        .gte("created_at", dateOnlyToUtcStart(dateFilter.startDate))
        .lte("created_at", dateOnlyToUtcEnd(endDate));
    }

    const { data, error } = await ordersQuery;

    if (error) {
      setOrders([]);
      setLoading(false);
      Alert.alert("Error loading orders", error.message);
      return;
    }

    setOrders((data ?? []) as AnalyticsOrderRow[]);
    setLoading(false);
  }, [dateFilter.endDate, dateFilter.startDate]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const totalSales = useMemo(
    () => orders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0),
    [orders]
  );

  const itemFrequency = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const order of orders) {
      for (const item of order.order_items ?? []) {
        const name = getItemName(item.menu_items);
        counts[name] = (counts[name] ?? 0) + Number(item.quantity ?? 0);
      }
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [orders]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0B2D5B" />
          <Text style={styles.helperText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Business Analytics</Text>
        <Text style={styles.subtitle}>Completed orders and sales performance</Text>

        <Pressable style={styles.filterButton} onPress={() => setDateFilterOpen(true)}>
          <Text style={styles.filterButtonText}>
            Date filter: {dateRangeLabel(dateFilter)}
          </Text>
        </Pressable>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Completed Orders</Text>
            <Text style={styles.statValue}>{orders.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Sales</Text>
            <Text style={styles.statValue}>${totalSales.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Item Frequency</Text>
          {itemFrequency.length === 0 ? (
            <Text style={styles.helperText}>
              No completed orders for this date selection.
            </Text>
          ) : (
            itemFrequency.map(([name, quantity]) => (
              <View key={name} style={styles.frequencyRow}>
                <Text style={styles.frequencyName}>{name}</Text>
                <Text style={styles.frequencyCount}>{quantity}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Completed Orders</Text>
          {orders.length === 0 ? (
            <Text style={styles.helperText}>
              No completed orders for this date selection.
            </Text>
          ) : (
            orders.map((order) => (
              <View key={order.id} style={styles.orderRow}>
                <Text style={styles.orderDate}>
                  {formatIsoToPstDisplay(order.created_at)}
                </Text>
                <Text style={styles.orderAmount}>
                  ${Number(order.total_amount).toFixed(2)}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <DateRangePickerModal
        visible={dateFilterOpen}
        onClose={() => setDateFilterOpen(false)}
        onApply={setDateFilter}
        initialStartDate={dateFilter.startDate}
        initialEndDate={dateFilter.endDate}
      />
    </SafeAreaView>
  );
}
