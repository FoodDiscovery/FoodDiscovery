import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../Providers/AuthProvider";
import { useOrderDetailCache } from "../../../Providers/OrderDetailCacheProvider";
import { orderDetailStyles as style, NAVY } from "../../../components/styles";

const SALES_TAX_RATE = 0.0975;

interface OrderItemRow {
  quantity: number;
  price_at_time_of_purchase: number;
  name: string;
}

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { session } = useAuth();
  const { getCached, setCached, fetchOrderDetail } = useOrderDetailCache();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [address, setAddress] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<OrderItemRow[]>([]);

  useEffect(() => {
    if (!orderId || !session?.user?.id) {
      setLoading(false);
      return;
    }
    // check if it's cached first
    const cached = getCached(orderId);
    if (cached) {
      setRestaurantName(cached.restaurantName);
      setAddress(cached.address);
      setLineItems(cached.lineItems);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setRestaurantName("");
    setAddress(null);
    setLineItems([]);
    let cancelled = false;
    (async () => {
      // attempt to fetch
      const result = await fetchOrderDetail(orderId, session.user.id);
      if (cancelled) return;
      if ("error" in result) {
        setError(result.error);
        setLoading(false);
        return;
      }
      setRestaurantName(result.data.restaurantName);
      setAddress(result.data.address);
      setLineItems(result.data.lineItems);
      setCached(orderId, result.data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [orderId, session?.user?.id, getCached, setCached, fetchOrderDetail]);

  if (!session?.user?.id) {
    return (
      <SafeAreaView style={style.safe} edges={["top"]}>
        <View style={style.center}>
          <Text style={style.subtitle}>Sign in to view order details.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={style.safe} edges={["top"]}>
        <View style={style.center}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={style.safe} edges={["top"]}>
        <View style={style.center}>
          <Text style={style.subtitle}>{error}</Text>
          <Pressable onPress={() => router.replace("/(home)/order-history")} style={style.goBackBtn}>
            <Text style={style.goBackText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const itemCount = lineItems.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = lineItems.reduce(
    (sum, i) => sum + i.quantity * Number(i.price_at_time_of_purchase),
    0
  );
  const tax = subtotal * SALES_TAX_RATE;
  const totalWithTax = subtotal + tax;

  return (
    <SafeAreaView style={style.safe} edges={["top"]}>
      <View style={[style.header, { paddingTop: Math.max(10, insets.top * 0.45) }]}>
        <Pressable onPress={() => router.replace("/(home)/order-history")} style={style.backBtn} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={NAVY} />
        </Pressable>
        <Text style={style.title}>Order details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[style.page, { paddingBottom: Math.max(24, insets.bottom + 18) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={style.card}>
          <Text style={style.cardTitle}>{restaurantName}</Text>
          {address ? <Text style={style.cardMeta}>{address}</Text> : null}
          <View style={{ height: 10 }} />
          {lineItems.map((item, idx) => (
            <View key={idx} style={style.lineRow}>
              <Text style={style.lineLeft} numberOfLines={2}>
                {item.quantity} × {item.name}
              </Text>
              <Text style={style.lineRight}>
                ${(item.quantity * Number(item.price_at_time_of_purchase)).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={style.card}>
          <Text style={style.summaryRow}>Items: {itemCount}</Text>
          <Text style={style.summaryRow}>Subtotal: ${subtotal.toFixed(2)}</Text>
          <Text style={style.summaryRow}>Tax: ${tax.toFixed(2)}</Text>
          <Text style={[style.summaryRow, style.summaryTotal]}>Total: ${totalWithTax.toFixed(2)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
