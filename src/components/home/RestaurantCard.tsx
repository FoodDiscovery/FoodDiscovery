import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { homeStyles as styles } from "../styles";
import RestaurantImage from "./RestaurantImage";

interface RestaurantCardProps {
  id: string;
  name: string | null;
  cuisineType: string | null;
  imageUrl: string | null;
  distance?: string;
}

export default function RestaurantCard({
  id,
  name,
  cuisineType,
  imageUrl,
  distance,
}: RestaurantCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressedOpacity85]}
      onPress={() => router.push(`/restaurant/${id}`)}
    >
      <RestaurantImage imageUrl={imageUrl} />
      <Text style={styles.restaurantName}>{name ?? "Unnamed restaurant"}</Text>
      <View style={styles.metaRow}>
        {/* for future ratings */}
        <Text style={styles.rating}>⭐</Text>
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

