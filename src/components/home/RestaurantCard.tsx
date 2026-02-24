import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { homeStyles as styles } from "../styles";
import RestaurantImage from "./RestaurantImage";
import Rating from "../reviews/ratings";

interface RestaurantCardProps {
  id: string;
  name: string | null;
  cuisineType: string | null;
  imageUrl: string | null;
  distance?: string;
  rating?: number;
}

export default function RestaurantCard({
  id,
  name,
  cuisineType,
  imageUrl,
  distance,
  rating = 0,
}: RestaurantCardProps) {
  const hasRating = rating > 0;
  const ratingLabel = hasRating ? rating.toFixed(1) : undefined;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressedOpacity85]}
      onPress={() => router.push(`/restaurant/${id}`)}
    >
      <RestaurantImage imageUrl={imageUrl} />
      <Text style={styles.restaurantName}>{name ?? "Unnamed restaurant"}</Text>
      <View style={styles.metaRow}>
        <Rating value={rating} size="sm" label={ratingLabel} />
        <Text style={styles.metaText}>{distance ?? ""}</Text>
      </View>
      {cuisineType && (
        <View style={styles.categoryTag}>
          <Text style={styles.categoryText}>#{cuisineType} →</Text>
        </View>
      )}
    </Pressable>
  );
}

