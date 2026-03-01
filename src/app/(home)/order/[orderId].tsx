import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../Providers/AuthProvider";
import { useOrderDetailCache } from "../../../Providers/OrderDetailCacheProvider";
import Rating from "../../../components/reviews/ratings";
import {
  fetchUserRestaurantReviews,
  saveUserRestaurantReview,
} from "../../../lib/ratings";
import {
  orderDetailStyles as style,
  sharedStyles,
  NAVY,
} from "../../../components/styles";

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
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string>("");
  const [address, setAddress] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<OrderItemRow[]>([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewDescription, setReviewDescription] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);

  useEffect(() => {
    if (!orderId || !session?.user?.id) {
      setLoading(false);
      return;
    }
    // check if it's cached first
    const cached = getCached(orderId);
    if (cached) {
      setRestaurantId(cached.restaurantId ?? null);
      setRestaurantName(cached.restaurantName);
      setAddress(cached.address);
      setLineItems(cached.lineItems);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setRestaurantId(null);
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
      setRestaurantId(result.data.restaurantId ?? null);
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

  useEffect(() => {
    if (!session?.user?.id || !restaurantId) {
      setHasExistingReview(false);
      setReviewRating(0);
      setReviewDescription("");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const reviews = await fetchUserRestaurantReviews(session.user.id, [restaurantId]);
        if (cancelled) return;
        const existing = reviews.get(restaurantId);
        setHasExistingReview(Boolean(existing));
        setReviewRating(existing?.rating ?? 0);
        setReviewDescription(existing?.reviewDescription ?? "");
      } catch (reviewError) {
        console.error("Failed to load review for order detail", reviewError);
        if (cancelled) return;
        setHasExistingReview(false);
        setReviewRating(0);
        setReviewDescription("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [restaurantId, session?.user?.id]);

  const submitReview = async () => {
    if (!session?.user?.id) {
      Alert.alert("Sign in required", "Please sign in to leave a review.");
      return;
    }
    if (!restaurantId) {
      Alert.alert("Unable to review", "Missing restaurant information for this order.");
      return;
    }
    if (reviewRating <= 0) {
      Alert.alert("Rating required", "Please choose a star rating before submitting.");
      return;
    }

    setSavingReview(true);
    try {
      await saveUserRestaurantReview(
        session.user.id,
        restaurantId,
        reviewRating,
        reviewDescription
      );
      setHasExistingReview(true);
      setReviewModalVisible(false);
      Alert.alert("Saved", "Your review has been saved.");
    } catch (reviewError) {
      Alert.alert(
        "Save failed",
        reviewError instanceof Error ? reviewError.message : "Unable to save review."
      );
    } finally {
      setSavingReview(false);
    }
  };

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
        <View style={sharedStyles.spacerWidth40} />
      </View>

      <ScrollView
        contentContainerStyle={[style.page, { paddingBottom: Math.max(24, insets.bottom + 18) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={style.card}>
          <Text style={style.cardTitle}>{restaurantName}</Text>
          {address ? (
            <Pressable
              onPress={() => {
                const encoded = encodeURIComponent(address);
                const url =
                  Platform.OS === "ios"
                    ? `maps://?daddr=${encoded}`
                    : `https://www.google.com/maps/dir/?api=1&destination=${encoded}`;
                Linking.openURL(url);
              }}
              style={({ pressed }) => (pressed ? sharedStyles.pressedOpacity70 : {})}
            >
              <Text style={style.cardMeta}>{address}</Text>
            </Pressable>
          ) : null}
          <View style={sharedStyles.spacerHeight10} />
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

        <Pressable
          style={({ pressed }) => [
            style.reviewButton,
            pressed && sharedStyles.pressedOpacity85,
          ]}
          onPress={() => setReviewModalVisible(true)}
          accessibilityRole="button"
          accessibilityLabel={hasExistingReview ? "Edit review" : "Leave review"}
        >
          <Text style={style.reviewButtonText}>
            {hasExistingReview ? "Edit review" : "Leave review"}
          </Text>
        </Pressable>
      </ScrollView>

      <Modal
        visible={reviewModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!savingReview) setReviewModalVisible(false);
        }}
      >
        <View style={localStyles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={Platform.OS === "ios" ? insets.bottom : 0}
          >
            <View style={localStyles.modalCard}>
              <Text style={localStyles.modalTitle}>
                {hasExistingReview ? "Edit review" : "Leave a review"}
              </Text>
              <Rating
                value={reviewRating}
                onChange={setReviewRating}
                size="md"
                label={reviewRating > 0 ? `${reviewRating.toFixed(1)} stars` : "Tap to rate"}
              />
              <TextInput
                style={localStyles.reviewInput}
                placeholder="Share your experience..."
                placeholderTextColor="#9AA0A6"
                multiline
                value={reviewDescription}
                onChangeText={setReviewDescription}
                editable={!savingReview}
              />
              <View style={localStyles.modalActions}>
                <Pressable
                  style={({ pressed }) => [localStyles.cancelButton, pressed && { opacity: 0.85 }]}
                  onPress={() => setReviewModalVisible(false)}
                  disabled={savingReview}
                >
                  <Text style={localStyles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [localStyles.submitButton, pressed && { opacity: 0.85 }]}
                  onPress={submitReview}
                  disabled={savingReview}
                >
                  <Text style={localStyles.submitButtonText}>
                    {savingReview ? "Saving..." : hasExistingReview ? "Update" : "Submit"}
                  </Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
