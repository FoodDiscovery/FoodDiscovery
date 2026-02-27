import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useLocation } from "./LocationProvider";
import { supabase } from "../lib/supabase";
import {
  fetchAllRestaurantRatings,
  type RestaurantRatingSummary,
} from "../lib/ratings";

interface RestaurantRow {
  id: string;
  name: string | null;
  description: string | null;
  cuisine_type: string | null;
  image_url: string | null;
  preview_images: string[] | null;
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
    image_url: string | null;
    preview_images: string[] | null;
    cuisine_type: string | null;
  };
}

type SortMode = "name" | "distance";

interface HomeContextValue {
  loading: boolean;
  restaurants: RestaurantRow[];
  nearby: NearbyRestaurant[];
  restaurantDistances: Map<string, number>;
  restaurantRatings: Map<string, RestaurantRatingSummary>;
  query: string;
  setQuery: (query: string) => void;
  sortMode: SortMode;
  setSortMode: (mode: SortMode) => void;
  selectedCuisines: string[];
  setSelectedCuisines: (cuisines: string[] | ((prev: string[]) => string[])) => void;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  cuisineOptions: string[];
  toggleCuisine: (c: string) => void;
  filteredBase: RestaurantRow[];
  filteredNearby: NearbyRestaurant[];
  activeList: (RestaurantRow | NearbyRestaurant)[];
  headerSubtitle: string;
  onPressSort: () => void;
}

const HomeContext = createContext<HomeContextValue | undefined>(undefined);

export function useHome() {
  const ctx = useContext(HomeContext);
  if (!ctx) {
    throw new Error("useHome must be used within HomeProvider");
  }
  return ctx;
}

export default function HomeProvider({ children }: { children: React.ReactNode }) {
  const { location, errorMsg, isLoading } = useLocation();

  const [loading, setLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<RestaurantRow[]>([]);
  const [nearby, setNearby] = useState<NearbyRestaurant[]>([]);
  const [restaurantDistances, setRestaurantDistances] = useState<Map<string, number>>(new Map());
  const [restaurantRatings, setRestaurantRatings] = useState<Map<string, RestaurantRatingSummary>>(new Map());

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
        .select("id,name,description,cuisine_type,image_url,preview_images");

      if (error) {
        setLoading(false);
        Alert.alert("Failed to load restaurants", error.message);
        return;
      }

      setRestaurants((data ?? []) as RestaurantRow[]);

      // fetch all ratings for all restaurants
      fetchAllRestaurantRatings()
        .then((map) => setRestaurantRatings(map))
        .catch((ratingsError) => {
          console.error("Failed to load restaurant ratings", ratingsError);
        })
        .finally(() => {
          setLoading(false);
        });
    };

    load();
  }, []);

  // Load distances for all restaurants when location is available
  useEffect(() => {
    const loadDistances = async () => {
      if (!location) return;

      const { data, error } = await supabase.rpc("get_nearby_restaurants", {
        user_lat: location.latitude,
        user_lng: location.longitude,
        radius_meters: 50000, // Large radius to get all restaurants
      });

      if (error) {
        // Non-critical error, continue without distances
        return;
      }

      const nearbyData = (data ?? []) as NearbyRestaurant[];
      const distanceMap = new Map<string, number>();
      nearbyData.forEach((n) => {
        distanceMap.set(n.restaurant.id, n.distance_meters);
      });
      setRestaurantDistances(distanceMap);
    };

    loadDistances();
  }, [location]);

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

      // Fetch restaurant details including images for nearby restaurants
      const nearbyData = (data ?? []) as NearbyRestaurant[];
      const restaurantIds = nearbyData.map((n) => n.restaurant.id);
      
      if (restaurantIds.length > 0) {
        const { data: restaurantDetails } = await supabase
          .from("restaurants")
          .select("id,image_url,preview_images,cuisine_type")
          .in("id", restaurantIds);

        // Merge restaurant details with nearby data
        const enriched = nearbyData.map((n) => {
          const details = restaurantDetails?.find((r) => r.id === n.restaurant.id);
          return {
            ...n,
            restaurant: {
              ...n.restaurant,
              image_url: details?.image_url ?? null,
              preview_images: details?.preview_images ?? null,
              cuisine_type: details?.cuisine_type ?? null,
            },
          };
        });

        setNearby(enriched);
      } else {
        setNearby(nearbyData);
      }
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

    const list = restaurants.filter((r) => {
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

    return nearby.filter((n) => {
      const name = (n.restaurant?.name ?? "").toLowerCase();
      const matches = q.length === 0 || name.includes(q);
      return matches && passesCuisine(n.restaurant.cuisine_type);
    });
  }, [nearby, query, selectedCuisines]);

  const activeList = sortMode === "distance" ? filteredNearby : filteredBase;

  const headerSubtitle =
    sortMode === "distance"
      ? location
        ? "Distance (5km)"
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

  const value = useMemo<HomeContextValue>(
    () => ({
      loading,
      restaurants,
      nearby,
      restaurantDistances,
      restaurantRatings,
      query,
      setQuery,
      sortMode,
      setSortMode,
      selectedCuisines,
      setSelectedCuisines,
      filtersOpen,
      setFiltersOpen,
      cuisineOptions,
      toggleCuisine,
      filteredBase,
      filteredNearby,
      activeList,
      headerSubtitle,
      onPressSort,
    }),
    [
      loading,
      restaurants,
      nearby,
      restaurantDistances,
      restaurantRatings,
      query,
      sortMode,
      selectedCuisines,
      filtersOpen,
      cuisineOptions,
      filteredBase,
      filteredNearby,
      activeList,
      headerSubtitle,
      onPressSort,
    ]
  );

  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

