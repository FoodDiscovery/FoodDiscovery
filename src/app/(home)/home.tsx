// src/app/(home)/home.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { supabase } from "../../lib/supabase";
import { useLocation } from "../../Providers/LocationProvider";
import styles from "./homeStyles";

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

type SortMode = "name" | "distance";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { location, errorMsg, isLoading } = useLocation();

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [nearby, setNearby] = useState<NearbyRestaurant[]>([]);

  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("name");

  // Filters
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);

  // Load base restaurants (no distance needed)
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
      if (sortMode !== "distance") return;
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

  const filteredBase = useMemo(() => {
    const q = query.trim().toLowerCase();

    const passesCuisine = (r: RestaurantRow) => {
      if (selectedCuisines.length === 0) return true;
      return selectedCuisines.includes((r.cuisine_type ?? "").trim());
    };

    let list = restaurants.filter((r) => {
      const name = (r.name ?? "").toLowerCase();
      const cuisine = (r.cuisine_type ?? "").toLowerCase();
      const desc = (r.description ?? "").toLowerCase();

      const matches =
        q.length === 0 ||
        name.includes(q) ||
        cuisine.includes(q) ||
        desc.includes(q);

      return matches && passesCuisine(r);
    });

    list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    return list;
  }, [restaurants, query, selectedCuisines]);

  const filteredNearby = useMemo(() => {
    const q = query.trim().toLowerCase();

    const passesCuisine = (cuisineType: string | null | undefined) => {
      if (selectedCuisines.length === 0) return true;
      return selectedCuisines.includes((cuisineType ?? "").trim());
    };

    // We don’t have cuisine/description inside the RPC payload unless your function returns it.
    // So: when sorting by distance, search/filter by name only (and cuisine only if your RPC includes it).
    return nearby.filter((n) => {
      const name = (n.restaurant?.name ?? "").toLowerCase();
      const matches = q.length === 0 || name.includes(q);
      // cuisine filter can’t be applied reliably unless you return cuisine_type in RPC.
      return matches && passesCuisine(undefined);
    });
  }, [nearby, query, selectedCuisines]);

  const activeList = sortMode === "distance" ? filteredNearby : filteredBase;

  const headerSubtitle =
    sortMode === "distance"
      ? location
        ? "Sorted by nearest (within 5km)"
        : "Enable location to sort by distance"
      : "Search by name or cuisine";

  const onPressSort = () => {
    if (sortMode === "name") {
      // switch to distance
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
      setSortMode("distance");
    } else {
      setSortMode("name");
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    if (sortMode === "distance") {
      const n = item as NearbyRestaurant;
      const km = (n.distance_meters / 1000).toFixed(2);
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{n.restaurant.name}</Text>
          <Text style={styles.cardMeta}>{km} km away</Text>
        </View>
      );
    }

    const r = item as RestaurantRow;
    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{r.name ?? "Unnamed restaurant"}</Text>
        {!!r.cuisine_type && <Text style={styles.cardCuisine}>{r.cuisine_type}</Text>}
        {!!r.description && <Text style={styles.cardDesc}>{r.description}</Text>}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header (title + profile button) */}
      <View
        style={[
          styles.header,
          {
            paddingTop: Math.max(8, insets.top * 0.25),
          },
        ]}
      >
        <View style={styles.headerTextContainer}>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            Discover Food 🍽️
          </Text>
          <Text style={styles.subtitle}>{headerSubtitle}</Text>
        </View>

        {/* Profile button (top-right, NOT cut off) */}
        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [
            styles.profileBtn,
            pressed && styles.pressedOpacity70,
          ]}
          hitSlop={10}
        >
          <Text style={styles.profileBtnText}>Profile</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name or cuisine"
          placeholderTextColor="#9AA0A6"
          style={styles.search}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <Pressable
          onPress={() => setFiltersOpen(true)}
          style={({ pressed }) => [styles.pillPrimary, pressed && styles.pressedOpacity80]}
        >
          <Text style={styles.pillPrimaryText}>Filters</Text>
        </Pressable>

        <Pressable
          onPress={onPressSort}
          style={({ pressed }) => [styles.pill, pressed && styles.pressedOpacity80]}
        >
          <Text style={styles.pillText}>
            Sort: {sortMode === "name" ? "Name" : "Distance"}
          </Text>
        </Pressable>

        {(selectedCuisines.length > 0 || query.trim().length > 0) && (
          <Pressable
            onPress={() => {
              setQuery("");
              setSelectedCuisines([]);
            }}
            style={({ pressed }) => [styles.pillGhost, pressed && styles.pressedOpacity80]}
          >
            <Text style={styles.pillGhostText}>Clear</Text>
          </Pressable>
        )}
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : (
        <FlatList
          data={activeList}
          keyExtractor={(item: any) =>
            sortMode === "distance" ? String(item.location_id) : String(item.id)
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
              <Text style={styles.emptyCuisineText}>
                No cuisine types found yet.
              </Text>
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
                        pressed && styles.pressedOpacity85,
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

