import { supabase } from "./supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface RestaurantRatingSummary {
  restaurant_id: string;
  average_rating: number | null;
  rating_count: number;
}

const USER_RATING_STORAGE_KEY_PREFIX = "restaurant_user_rating";
const USER_RATINGS_TABLE = "restaurant_ratings";

const getUserRatingStorageKey = (userId: string, restaurantId: string): string =>
  `${USER_RATING_STORAGE_KEY_PREFIX}:${userId}:${restaurantId}`;

const normalizeRating = (value: number): number => Math.max(0, Math.min(5, value));

export async function fetchAllRestaurantRatings(): Promise<Map<string, RestaurantRatingSummary>> {
  const map = new Map<string, RestaurantRatingSummary>();

  const { data, error } = await supabase.rpc("get_restaurant_ratings");

  if (error) {
    throw error;
  }
  if (!data) {
    return map;
  }

  // iterate over data and add to map
  (data as RestaurantRatingSummary[]).forEach((row) => {
    const average =
      typeof row.average_rating === "number" && !Number.isNaN(row.average_rating)
        ? row.average_rating
        : null;

    const count = typeof row.rating_count === "number" ? row.rating_count : 0;

    // add to map
    map.set(row.restaurant_id, {
      restaurant_id: row.restaurant_id,
      average_rating: average,
      rating_count: count,
    });
  });

  return map;
}

export async function fetchRestaurantRating(
  restaurantId: string
): Promise<RestaurantRatingSummary | null> {
  const all = await fetchAllRestaurantRatings();
  return all.get(restaurantId) ?? null;
}

export async function getSavedUserRestaurantRating(
  userId: string,
  restaurantId: string
): Promise<number | null> {
  const key = getUserRatingStorageKey(userId, restaurantId);
  const { data, error } = await supabase
    .from(USER_RATINGS_TABLE)
    .select("rating")
    .eq("user_id", userId)
    .eq("restaurant_id", restaurantId)
    .maybeSingle();

  if (!error && data && typeof data.rating === "number" && Number.isFinite(data.rating)) {
    const normalized = normalizeRating(data.rating);
    // Keep local cache warm for quick reads/fallback.
    await AsyncStorage.setItem(key, String(normalized));
    return normalized;
  }

  // Fallback for older local-only ratings or temporary backend failures.
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return null;
  return normalizeRating(parsed);
}

export async function saveUserRestaurantRating(
  userId: string,
  restaurantId: string,
  rating: number
): Promise<void> {
  const key = getUserRatingStorageKey(userId, restaurantId);
  const normalized = normalizeRating(rating);
  const { error } = await supabase.from(USER_RATINGS_TABLE).upsert(
    {
      user_id: userId,
      restaurant_id: restaurantId,
      rating: normalized,
    },
    { onConflict: "user_id,restaurant_id" }
  );

  if (error) {
    throw error;
  }

  // Keep local cache aligned with remote source of truth.
  await AsyncStorage.setItem(key, String(normalized));
}

export async function fetchUserRestaurantRatings(
  userId: string,
  restaurantIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (restaurantIds.length === 0) return map;

  const uniqueIds = Array.from(new Set(restaurantIds));
  const { data, error } = await supabase
    .from(USER_RATINGS_TABLE)
    .select("restaurant_id,rating")
    .eq("user_id", userId)
    .in("restaurant_id", uniqueIds);

  if (error) {
    throw error;
  }

  (data ?? []).forEach((row) => {
    if (typeof row.rating === "number" && Number.isFinite(row.rating)) {
      map.set(row.restaurant_id as string, normalizeRating(row.rating));
    }
  });

  return map;
}

