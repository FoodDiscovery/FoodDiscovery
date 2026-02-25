import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../Providers/AuthProvider";
import { useOrderDetailCache } from "../../Providers/OrderDetailCacheProvider";
import OrderHistoryCard, { type OrderHistoryItem } from "./OrderHistoryCard";
import Rating from "../reviews/ratings";
import { saveUserRestaurantReview } from "../../lib/ratings";
import { tabPlaceholderStyles as styles } from "../styles";

export default function OrderHistoryList() {
  const { session } = useAuth();
  const { getCached, setCached, fetchOrderDetail, fetchOrderList } = useOrderDetailCache();
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<OrderHistoryItem | null>(null);
  const [draftRating, setDraftRating] = useState(0);
  const [draftReview, setDraftReview] = useState("");
  const [savingReview, setSavingReview] = useState(false);

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

  const openReviewModal = (order: OrderHistoryItem) => {
    setReviewOrder(order);
    setDraftRating(0);
    setDraftReview("");
  };

  const closeReviewModal = () => {
    if (savingReview) return;
    setReviewOrder(null);
  };

  const submitReview = async () => {
    if (!session?.user?.id) {
      Alert.alert("Sign in required", "Please sign in to leave a review.");
      return;
    }
    if (!reviewOrder?.restaurantId) {
      Alert.alert("Unable to review", "This order is missing restaurant information.");
      return;
    }
    if (draftRating <= 0) {
      Alert.alert("Rating required", "Please choose a star rating before submitting.");
      return;
    }

    setSavingReview(true);
    try {
      await saveUserRestaurantReview(
        session.user.id,
        reviewOrder.restaurantId,
        draftRating,
        draftReview
      );
      Alert.alert("Thanks!", "Your review was saved.");
      setReviewOrder(null);
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Unable to save review.");
    } finally {
      setSavingReview(false);
    }
  };

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
      {orders.map((order, index) => {
        const isOpening = loadingOrderId === order.id;
        const displayNumber = orders.length - index; // 1 = oldest, n = newest
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
              style={({ pressed }) => [{ opacity: pressed || isOpening ? 0.7 : 1 }]}
              disabled={isOpening}
            >
              <OrderHistoryCard order={order} displayNumber={displayNumber} />
            </Pressable>
            <Pressable
              style={({ pressed }) => [localStyles.reviewButton, pressed && { opacity: 0.85 }]}
              onPress={() => openReviewModal(order)}
              accessibilityRole="button"
              accessibilityLabel="Leave review for this order"
            >
              <Text style={localStyles.reviewButtonText}>Leave review</Text>
            </Pressable>
          </View>
        );
      })}
      <Modal
        visible={reviewOrder != null}
        transparent
        animationType="slide"
        onRequestClose={closeReviewModal}
      >
        <View style={localStyles.modalBackdrop}>
          <View style={localStyles.modalCard}>
            <Text style={localStyles.modalTitle}>Leave a review</Text>
            <Text style={localStyles.modalSubtitle}>
              Order {reviewOrder?.id.slice(0, 8)}
            </Text>

            <Rating
              value={draftRating}
              onChange={setDraftRating}
              size="md"
              label={draftRating > 0 ? `${draftRating.toFixed(1)} stars` : "Tap to rate"}
            />

            <TextInput
              style={localStyles.reviewInput}
              placeholder="Share your experience..."
              placeholderTextColor="#9AA0A6"
              multiline
              value={draftReview}
              onChangeText={setDraftReview}
              editable={!savingReview}
            />

            <View style={localStyles.modalActions}>
              <Pressable
                style={({ pressed }) => [localStyles.cancelBtn, pressed && { opacity: 0.85 }]}
                onPress={closeReviewModal}
                disabled={savingReview}
              >
                <Text style={localStyles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [localStyles.submitBtn, pressed && { opacity: 0.85 }]}
                onPress={submitReview}
                disabled={savingReview}
              >
                <Text style={localStyles.submitBtnText}>
                  {savingReview ? "Saving..." : "Submit"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const localStyles = StyleSheet.create({
  reviewButton: {
    alignSelf: "flex-end",
    marginTop: -4,
    marginBottom: 14,
    backgroundColor: "#0B2D5B",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0B1220",
  },
  modalSubtitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#6B7280",
  },
  reviewInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  cancelBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#E5E7EB",
  },
  cancelBtnText: {
    color: "#111827",
    fontWeight: "800",
  },
  submitBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#0B2D5B",
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
