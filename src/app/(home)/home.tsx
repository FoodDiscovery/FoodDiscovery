// src/app/(home)/home.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { supabase } from "../../lib/supabase";
import { useLocation } from "../../Providers/LocationProvider";
import { useCart } from "../../Providers/CartProvider";

// ✅ Fix: forbid require() imports
import FoodDiscoveryLogo from "../../../assets/images/fooddiscovery-logo.png";

interface RestaurantRow {
  id: string;
  name: string | null;
  description: string | null;
  cuisine_type: string | null;
  image_url: string | null;
}

interface NearbyRestaurant {
  location_id: number;
  distance_meters: number;
  latitude: number;
  longitude: number;
  restaurant: {
    id: string;
    name: string;
    owner_id: string;
  };
}

type SortMode = "Name" | "Distance";

const NAVY = "#0B2D5B";
const GOLD = "#F5C542";
const BG = "#F3F6FB";

type ActiveListItem = RestaurantRow | NearbyRestaurant;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { location, errorMsg, isLoading } = useLocation();
  const { itemCount } = useCart();

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [nearby, setNearby] = useState<NearbyRestaurant[]>([]);

  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("Name");

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  // Lookup for distance mode enrichment (cuisine/desc/image)
  const restaurantById = useMemo(() => {
    const map = new Map<string, RestaurantRow>();
    for (const r of restaurants) map.set(r.id, r);
    return map;
  }, [restaurants]);

  // Load base restaurants
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("restaurants")
        .select("id,name,description,cuisine_type,image_url");

      if (error) {
        setLoading(false);
        Alert.alert("Failed to load restaurants", error.message);
        return;
      }

      setRestaurants((data ?? []) as RestaurantRow[]);
      setLoading(false);
    };

    load();
  }, []);

  // Load nearby whenever sorting by distance and we have location
  useEffect(() => {
    const loadNearby = async () => {
      if (sortMode !== "Distance") return;
      if (!location) return;

      const { data, error } = await supabase.rpc("get_nearby_restaurants", {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_meters: 5000,
      });

      if (error) {
        Alert.alert("Failed to load restaurants", error.message);
        return;
      }

      setNearby((data ?? []) as NearbyRestaurant[]);
    };

    loadNearby();
  }, [sortMode, location]);

  const cuisineOptions = useMemo(() => {
    const set = new Set<string>();
    restaurants.forEach((r) => {
      const c = (r.cuisine_type ?? "").trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [restaurants]);

  const toggleCuisine = (c: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]
    );
  };

  const passesCuisine = (cuisineType: string | null | undefined) => {
    if (selectedCuisines.length === 0) return true;
    return selectedCuisines.includes((cuisineType ?? "").trim());
  };

  const filteredBase = useMemo(() => {
    const q = query.trim().toLowerCase();

    return restaurants
      .filter((r) => {
        const name = (r.name ?? "").toLowerCase();
        const cuisine = (r.cuisine_type ?? "").toLowerCase();
        const desc = (r.description ?? "").toLowerCase();

        const matches =
          q.length === 0 ||
          name.includes(q) ||
          cuisine.includes(q) ||
          desc.includes(q);

        return matches && passesCuisine(r.cuisine_type);
      })
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }, [restaurants, query, selectedCuisines]);

  const filteredNearby = useMemo(() => {
    const q = query.trim().toLowerCase();

    return nearby.filter((n) => {
      const base = restaurantById.get(n.restaurant.id);

      const name = (n.restaurant?.name ?? base?.name ?? "").toLowerCase();
      const cuisine = (base?.cuisine_type ?? "").toLowerCase();
      const desc = (base?.description ?? "").toLowerCase();

      const matches =
        q.length === 0 ||
        name.includes(q) ||
        cuisine.includes(q) ||
        desc.includes(q);

      return matches && passesCuisine(base?.cuisine_type);
    });
  }, [nearby, query, selectedCuisines, restaurantById]);

  const activeList: ActiveListItem[] =
    sortMode === "Distance" ? filteredNearby : filteredBase;

  const headerSubtitle =
    sortMode === "Distance"
      ? location
        ? "Sorted by nearest (within 5km)"
        : "Enable location to sort by distance"
      : "Search by name, cuisine, or description";

  const onPressSort = () => {
    if (sortMode === "Name") {
      if (isLoading) {
        Alert.alert("Location", "Getting your location… try again in a moment.");
        return;
      }
      if (errorMsg || !location) {
        Alert.alert(
          "Location needed",
          "To sort by distance, allow location access in iOS Settings for this app."
        );
        return;
      }
      setSortMode("Distance");
    } else {
      setSortMode("Name");
    }
  };

  const clearAll = () => {
    setQuery("");
    setSelectedCuisines([]);
  };

  const goToRestaurant = (restaurantId: string) => {
    router.push({
      pathname: "/(home)/restaurant/[id]",
      params: { id: restaurantId },
    });
  };

  const RestaurantImage = ({ uri }: { uri: string | null | undefined }) => {
    if (!uri) {
      return (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>No Image</Text>
        </View>
      );
    }
    return <Image source={{ uri }} style={styles.cardImage} resizeMode="cover" />;
  };

  // ✅ Fix: remove `any` by typing render item
  const renderItem = ({ item }: { item: ActiveListItem }) => {
    if (sortMode === "Distance") {
      const n = item as NearbyRestaurant;
      const km = (n.distance_meters / 1000).toFixed(2);
      const base = restaurantById.get(n.restaurant.id);

      return (
        <Pressable
          onPress={() => goToRestaurant(n.restaurant.id)}
          style={({ pressed }) => [pressed && { opacity: 0.92 }]}
        >
          <View style={styles.card}>
            <RestaurantImage uri={base?.image_url} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{n.restaurant.name}</Text>
              <Text style={styles.cardMeta}>{km} km away</Text>

              {!!base?.cuisine_type && (
                <Text style={styles.cardCuisine}>{base.cuisine_type}</Text>
              )}
              {!!base?.description && (
                <Text style={styles.cardDesc}>{base.description}</Text>
              )}
            </View>
          </View>
        </Pressable>
      );
    }

    const r = item as RestaurantRow;

    return (
      <Pressable
        onPress={() => goToRestaurant(r.id)}
        style={({ pressed }) => [pressed && { opacity: 0.92 }]}
      >
        <View style={styles.card}>
          <RestaurantImage uri={r.image_url} />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{r.name ?? "Unnamed restaurant"}</Text>
            {!!r.cuisine_type && (
              <Text style={styles.cardCuisine}>{r.cuisine_type}</Text>
            )}
            {!!r.description && <Text style={styles.cardDesc}>{r.description}</Text>}
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(10, insets.top * 0.45),
          },
        ]}
      >
        <View style={styles.logoRow}>
          <Image source={FoodDiscoveryLogo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.subtitle}>{headerSubtitle}</Text>
        </View>

        {/* Cart icon */}
        <Pressable
          onPress={() => router.push("/(home)/cart")}
          style={({ pressed }) => [
            styles.cartIconBtn,
            pressed && { opacity: 0.75 },
          ]}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={itemCount > 0 ? `Open cart (${itemCount} items)` : "Open cart"}
        >
          <Ionicons name="cart" size={24} color={NAVY} />
          {itemCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{itemCount > 99 ? "99+" : itemCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#9AA0A6" style={{ marginRight: 10 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name or cuisine"
            placeholderTextColor="#9AA0A6"
            style={styles.searchInput}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          style={({ pressed }) => [styles.pillSmallNavy, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.pillSmallNavyText}>Filters</Text>
        </Pressable>

        <Pressable
          onPress={onPressSort}
          style={({ pressed }) => [styles.pillSmallGold, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.pillSmallGoldText}>
            Sort: {sortMode === "Name" ? "Name" : "Distance"}
          </Text>
        </Pressable>

        {(selectedCuisines.length > 0 || query.trim().length > 0) && (
          <Pressable
            onPress={clearAll}
            style={({ pressed }) => [styles.pillGhost, pressed && { opacity: 0.85 }]}
          >
            <Text style={styles.pillGhostText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10, color: "#6B7280" }}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={activeList}
          // ✅ Fix: remove `any`
          keyExtractor={(item: ActiveListItem) =>
            sortMode === "Distance"
              ? String((item as NearbyRestaurant).location_id)
              : String((item as RestaurantRow).id)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptySub}>Try a different search or clear filters.</Text>
            </View>
          }
        />
      )}

      {/* Filters Modal */}
      <Modal visible={filtersOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <Pressable onPress={() => setFiltersOpen(false)} hitSlop={10}>
                <Text style={styles.modalClose}>Done</Text>
              </Pressable>
            </View>

            <Text style={styles.modalSectionTitle}>Cuisine</Text>

            {cuisineOptions.length === 0 ? (
              <Text style={{ color: "#6B7280" }}>No cuisine types found yet.</Text>
            ) : (
              <View style={styles.cuisineGrid}>
                {cuisineOptions.map((c) => {
                  const active = selectedCuisines.includes(c);
                  return (
                    <Pressable
                      key={c}
                      onPress={() => toggleCuisine(c)}
                      style={({ pressed }) => [
                        styles.cuisineChip,
                        active && styles.cuisineChipActive,
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <Text
                        style={[
                          styles.cuisineChipText,
                          active && styles.cuisineChipTextActive,
                        ]}
                      >
                        {c}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  logoRow: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 6,
  },
  logo: {
    width: 260,
    height: 90,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
  },

  cartIconBtn: {
    position: "absolute",
    right: 16,
    top: 10,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "700",
  },

  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },

  controls: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    alignItems: "center",
  },

  pillSmallNavy: {
    backgroundColor: NAVY,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillSmallNavyText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 14,
  },

  pillSmallGold: {
    backgroundColor: GOLD,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillSmallGoldText: {
    color: NAVY,
    fontWeight: "900",
    fontSize: 14,
  },

  pillGhost: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillGhostText: {
    color: NAVY,
    fontWeight: "800",
    fontSize: 14,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    overflow: "hidden",
  },

  cardImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#EEF2F7",
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    color: "#6B7280",
    fontWeight: "800",
  },

  cardBody: {
    padding: 16,
  },

  cardTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0B1220",
    letterSpacing: -0.2,
  },
  cardCuisine: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "900",
    color: NAVY,
  },
  cardDesc: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
    lineHeight: 22,
  },
  cardMeta: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#6B7280",
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  empty: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: 24, fontWeight: "800", color: "#111827" },
  emptySub: { marginTop: 6, fontSize: 16, color: "#6B7280", textAlign: "center" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: "900" },
  modalClose: { fontSize: 16, fontWeight: "800", color: NAVY },
  modalSectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    color: "#6B7280",
  },

  cuisineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cuisineChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F0F4FB",
  },
  cuisineChipActive: {
    backgroundColor: NAVY,
  },
  cuisineChipText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  cuisineChipTextActive: {
    color: "#FFF",
  },
});