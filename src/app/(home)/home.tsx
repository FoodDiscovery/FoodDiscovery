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

import { supabase } from "../../lib/supabase";
import { useLocation } from "../../Providers/LocationProvider";

type RestaurantRow = {
  id: string;
  name: string | null;
  description: string | null;
  cuisine_type: string | null;
};

type NearbyRestaurant = {
  location_id: number;
  distance_meters: number;
  latitude: number;
  longitude: number;
  restaurant: {
    id: string;
    name: string;
    owner_id: string;
  };
};

type SortMode = "Name" | "Distance";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { location, errorMsg, isLoading } = useLocation();

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [nearby, setNearby] = useState<NearbyRestaurant[]>([]);

  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("Name");

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  // Build a lookup so distance mode can still access cuisine/description
  const restaurantById = useMemo(() => {
    const map = new Map<string, RestaurantRow>();
    for (const r of restaurants) map.set(r.id, r);
    return map;
  }, [restaurants]);

  // Load base restaurants (so we have cuisine + description)
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("restaurants")
        .select("id,name,description,cuisine_type");

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

  // Load nearby restaurants whenever sortMode=distance AND location is available
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

    let list = restaurants.filter((r) => {
      const name = (r.name ?? "").toLowerCase();
      const cuisine = (r.cuisine_type ?? "").toLowerCase();
      const desc = (r.description ?? "").toLowerCase();

      const matches =
        q.length === 0 ||
        name.includes(q) ||
        cuisine.includes(q) ||
        desc.includes(q);

      return matches && passesCuisine(r.cuisine_type);
    });

    list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    return list;
  }, [restaurants, query, selectedCuisines]);

  // ✅ Distance mode filtering now works because we enrich from restaurantById
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

  const activeList = sortMode === "Distance" ? filteredNearby : filteredBase;

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

  const renderItem = ({ item }: { item: any }) => {
    if (sortMode === "Distance") {
      const n = item as NearbyRestaurant;
      const km = (n.distance_meters / 1000).toFixed(2);

      // pull cuisine/desc from the base restaurants list
      const base = restaurantById.get(n.restaurant.id);

      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{n.restaurant.name}</Text>
          <Text style={styles.cardMeta}>{km} km away</Text>

          {!!base?.cuisine_type && (
            <Text style={styles.cardCuisine}>{base.cuisine_type}</Text>
          )}
          {!!base?.description && (
            <Text style={styles.cardDesc}>{base.description}</Text>
          )}
        </View>
      );
    }

    const r = item as RestaurantRow;
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{r.name ?? "Unnamed restaurant"}</Text>
        {!!r.cuisine_type && (
          <Text style={styles.cardCuisine}>{r.cuisine_type}</Text>
        )}
        {!!r.description && <Text style={styles.cardDesc}>{r.description}</Text>}
      </View>
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
        {/* Center logo */}
        <View style={styles.logoRow}>
          <Image
            source={require("../../../assets/images/fooddiscovery-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Profile icon button */}
        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [
            styles.profileIconBtn,
            pressed && { opacity: 0.75 },
          ]}
          hitSlop={12}
        >
          <Text style={styles.profileIcon}>👤</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
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
            onPress={() => {
              setQuery("");
              setSelectedCuisines([]);
            }}
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
          keyExtractor={(item: any) =>
            sortMode === "Distance" ? String(item.location_id) : String(item.id)
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No results</Text>
              <Text style={styles.emptySub}>
                Try a different search or clear filters.
              </Text>
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

const NAVY = "#0B2D5B";
const GOLD = "#F5C542";
const BG = "#F3F6FB";

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
  },
  logo: {
    width: 260,
    height: 90,
  },

  profileIconBtn: {
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
  profileIcon: {
    fontSize: 22,
    color: NAVY,
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
  searchIcon: {
    marginRight: 10,
    fontSize: 18,
    opacity: 0.55,
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

  // Smaller pills (keeps color but not “main CTA” huge)
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
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0B1220",
    letterSpacing: -0.2,
  },
  cardCuisine: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "900",
    color: NAVY,
  },
  cardDesc: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
    color: "#6B7280",
    lineHeight: 24,
  },
  cardMeta: {
    marginTop: 8,
    fontSize: 16,
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
  modalSectionTitle: { marginTop: 8, marginBottom: 8, fontSize: 14, color: "#6B7280" },

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