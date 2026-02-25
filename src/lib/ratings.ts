import { supabase } from "./supabase";

export interface RestaurantRatingSummary {
  restaurant_id: string;
  average_rating: number | null;
  rating_count: number;
}

const USER_REVIEWS_TABLE = "restaurant_ratings";

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
  const { data, error } = await supabase
    .from(USER_REVIEWS_TABLE)
    .select("rating")
    .eq("user_id", userId)
    .eq("restaurant_id", restaurantId)
    .limit(1);

  if (error) {
    throw error;
  }
  const first = Array.isArray(data) ? data[0] : null;
  if (!first || typeof first.rating !== "number" || !Number.isFinite(first.rating)) return null;
  return normalizeRating(first.rating);
}

export async function saveUserRestaurantReview(
  userId: string,
  restaurantId: string,
  rating: number,
  reviewDescription: string
): Promise<void> {
  const normalized = normalizeRating(rating);
  const trimmedDescription = reviewDescription.trim();

  const { data: existing, error: existingError } = await supabase
    .from(USER_REVIEWS_TABLE)
    .select("id")
    .eq("user_id", userId)
    .eq("restaurant_id", restaurantId)
    .limit(1);

  if (existingError) {
    throw existingError;
  }

  const existingRow = Array.isArray(existing) ? existing[0] : null;
  const payload = {
    user_id: userId,
    restaurant_id: restaurantId,
    rating: normalized,
    review_description: trimmedDescription,
  };

  const { error } = existingRow
    ? await supabase.from(USER_REVIEWS_TABLE).update(payload).eq("id", existingRow.id)
    : await supabase.from(USER_REVIEWS_TABLE).insert(payload);
  if (error) {
    throw error;
  }
}

export async function fetchUserRestaurantRatings(
  userId: string,
  restaurantIds: string[]
): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (restaurantIds.length === 0) return map;

  const uniqueIds = Array.from(new Set(restaurantIds));
  const { data, error } = await supabase
    .from(USER_REVIEWS_TABLE)
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

