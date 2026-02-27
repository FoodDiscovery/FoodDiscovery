import { supabase } from "./supabase";

// summary of all star ratings for a restaurant, for quick display of stars
export interface RestaurantRatingSummary {
  restaurant_id: string;
  average_rating: number | null;
  rating_count: number;
}

// single review by a user for a restaurant, for display in the reviews list
export interface RestaurantReview {
  id?: string;
  restaurantId: string;
  rating: number;
  reviewDescription: string;
}

const USER_REVIEWS_TABLE = "restaurant_ratings";

// make rating value between 0 and 5
const normalizeRating = (value: number): number => Math.max(0, Math.min(5, value));

export async function fetchAllRestaurantRatings(): Promise<Map<string, RestaurantRatingSummary>> {
  const map = new Map<string, RestaurantRatingSummary>();

  const { data, error } = await supabase.rpc("get_restaurant_ratings");

  if (error || !data) {
    throw error;
  }

  // iterate over data and add to map
  (data as RestaurantRatingSummary[]).forEach((row) => {
    // if average rating is not a number, set to null
    const average =
      typeof row.average_rating === "number" && !Number.isNaN(row.average_rating) // is a number and not NaN
        ? row.average_rating
        : null;

    const count = typeof row.rating_count === "number" ? row.rating_count : 0; // if not a number, set to 0

    // add to map
    map.set(row.restaurant_id, {
      restaurant_id: row.restaurant_id,
      average_rating: average,
      rating_count: count,
    });
  });

  return map;
}

// fetch summary of all star ratings for a restaurant, for quick display of stars
export async function fetchRestaurantRating(
  restaurantId: string
): Promise<RestaurantRatingSummary | null> {
  const all = await fetchAllRestaurantRatings();
  return all.get(restaurantId) ?? null;
}

// fetch all reviews for a restaurant, for display in the reviews list
export async function fetchRestaurantReviews(
  restaurantId: string
): Promise<RestaurantReview[]> {
  const { data, error } = await supabase
    .from(USER_REVIEWS_TABLE)
    .select("id,rating,review_description")
    .eq("restaurant_id", restaurantId)
    .order("id", { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? [])
    // filter out rows where rating is not a number or is NaN
    .filter((row) => typeof row.rating === "number" && Number.isFinite(row.rating)) 
    .map((row) => ({
      id: String(row.id),
      restaurantId,
      rating: normalizeRating(row.rating as number),
      reviewDescription:
        typeof row.review_description === "string" ? row.review_description.trim() : "",
    }));
}

// fetch the current user's rating for a restaurant, for display in the reviews list
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
  const first = Array.isArray(data) ? data[0] : null; // if data is an array, get the first item, otherwise return null
  if (!first || typeof first.rating !== "number" || !Number.isFinite(first.rating)) return null; // if first is not a number or is NaN, return null
  return normalizeRating(first.rating); // normalize the rating, between 0 and 5
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

  // if existing data, get the first item, otherwise return null
  const existingRow = Array.isArray(existing) ? existing[0] : null;

  // create the payload to save
  const payload = {
    user_id: userId,
    restaurant_id: restaurantId,
    rating: normalized,
    review_description: trimmedDescription,
  };

  // if existing data, update the existing row, otherwise insert a new row
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

  const uniqueIds = Array.from(new Set(restaurantIds)); // get unique restaurant ids

  const { data, error } = await supabase
    .from(USER_REVIEWS_TABLE)
    .select("restaurant_id,rating")
    .eq("user_id", userId)
    .in("restaurant_id", uniqueIds);

  if (error) {
    throw error;
  }
  
  // iterate over data and add to map
  (data ?? []).forEach((row) => {
    if (typeof row.rating === "number" && Number.isFinite(row.rating)) {
      map.set(row.restaurant_id as string, normalizeRating(row.rating));
    }
  });

  return map;
}

export async function fetchUserRestaurantReviews(
  userId: string,
  restaurantIds: string[]
): Promise<Map<string, RestaurantReview>> {
  const map = new Map<string, RestaurantReview>();
  // if no restaurant ids, return empty map
  if (restaurantIds.length === 0) return map;

  const uniqueIds = Array.from(new Set(restaurantIds)); // get unique restaurant ids

  const { data, error } = await supabase
    .from(USER_REVIEWS_TABLE)
    .select("restaurant_id,rating,review_description")
    .eq("user_id", userId)
    .in("restaurant_id", uniqueIds);

  if (error) {
    throw error;
  }

  // iterate over data and add to map
  (data ?? []).forEach((row) => {
    if (typeof row.rating === "number" && Number.isFinite(row.rating)) {
      const restaurantId = row.restaurant_id as string;
      // add to map
      map.set(restaurantId, {
        id: undefined,
        restaurantId,
        rating: normalizeRating(row.rating),
        reviewDescription: typeof row.review_description === "string" ? row.review_description : "",
      });
    }
  });

  return map;
}

