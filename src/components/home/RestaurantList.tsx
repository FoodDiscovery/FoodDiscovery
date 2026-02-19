import React from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import { homeStyles as styles } from "../styles";
import RestaurantCard from "./RestaurantCard";
import { useHome } from "../../Providers/HomeProvider";

type RestaurantRow = {
  id: string;
  name: string | null;
  cuisine_type: string | null;
  image_url: string | null;
  preview_images: string[] | null;
};

type NearbyRestaurant = {
  location_id: number;
  distance_meters: number;
  restaurant: RestaurantRow;
};

function getRestaurantImage(restaurant: RestaurantRow): string | null {
  if (restaurant.image_url) return restaurant.image_url;
  if (restaurant.preview_images && restaurant.preview_images.length > 0) {
    return restaurant.preview_images[0];
  }
  return null;
}

export default function RestaurantList() {
  const { loading, activeList, sortMode, restaurantDistances } = useHome();
  const renderItem = ({ item }: { item: any }) => {
    if (sortMode === "distance") {
      const n = item as NearbyRestaurant;
      const miles = (n.distance_meters / 1609.34).toFixed(1);
      const imageUrl = getRestaurantImage(n.restaurant);
      return (
        <RestaurantCard
          id={n.restaurant.id}
          name={n.restaurant.name}
          cuisineType={n.restaurant.cuisine_type}
          imageUrl={imageUrl}
          distance={`${miles} mi`}
        />
      );
    }

    const r = item as RestaurantRow;
    const imageUrl = getRestaurantImage(r);
    const distanceMeters = restaurantDistances.get(r.id);
    const distance = distanceMeters !== undefined 
      ? `${(distanceMeters / 1609.34).toFixed(1)} mi`
      : undefined;
    return (
      <RestaurantCard
        id={r.id}
        name={r.name}
        cuisineType={r.cuisine_type}
        imageUrl={imageUrl}
        distance={distance}
      />
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  return (
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
          <Text style={styles.emptySub}>Try a different search or clear filters.</Text>
        </View>
      }
    />
  );
}

