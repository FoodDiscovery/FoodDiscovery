import { Button, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocation } from "../../Providers/LocationProvider";
import { supabase } from "../../lib/supabase";
import RestaurantModal from "../../components/RestaurantModal";
import { homeMapStyles as styles } from "../../components/styles";
import { WeeklyBusinessHours } from "../../lib/businessHours";

type Restaurant = {
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

interface RestaurantModalInfo {
  id: string;
  name: string | null;
  description: string | null;
  cuisine_type: string | null;
  image_url: string | null;
  business_hours: WeeklyBusinessHours | { text: string } | string | null;
  phone: string | null;
  preview_images: string[] | null;
}

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  const { location, errorMsg, isLoading } = useLocation();
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    React.useState<RestaurantModalInfo | null>(null);

  useEffect(() => {
    if (!location || !mapRef.current) return;

    mapRef.current.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      1000
    );

    fetchNearbyRestaurants(location.latitude, location.longitude);
  }, [location]);

  async function fetchNearbyRestaurants(latitude: number, longitude: number) {
    const { data, error } = await supabase.rpc("get_nearby_restaurants", {
      user_lat: latitude,
      user_lng: longitude,
      radius_meters: 5000,
    });

    if (error) {
      console.error("Error fetching nearby restaurants:", error);
      return;
    }

    setRestaurants((data ?? []) as Restaurant[]);
  }

  async function handleMarkerPress(restaurantId: string) {
    setModalVisible(true);
    const { data, error } = await supabase
      .from("restaurants")
      .select(
        "id, name, description, cuisine_type, image_url, business_hours, phone, preview_images"
      )
      .eq("id", restaurantId)
      .single();

    if (error) {
      console.error("Error fetching restaurant details:", error);
      setModalVisible(false);
      return;
    }

    setSelectedRestaurant(data as RestaurantModalInfo);
  }

  function focusOnLocation() {
    if (!location || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      },
      1000
    );
  }

  function closeModal() {
    setModalVisible(false);
    setSelectedRestaurant(null);
  }

  function openRestaurantMenu(restaurantId: string) {
    closeModal();
    router.push(`/restaurant/${restaurantId}`);
  }

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Searching for location...</Text>
      </View>
    );
  }

  if (errorMsg || !location) {
    return (
      <View style={styles.container}>
        <Text>{errorMsg || "Location unavailable"}</Text>
        <Button title="Try Again" onPress={() => router.replace("/(home)/map")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        ref={mapRef}
        mapPadding={{ top: insets.top * 0.45, right: 8, bottom: 0, left: 0 }}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        <Marker coordinate={location} title="My Location" description="Here I am" />
        {restaurants.map((item) => (
          <Marker
            key={item.location_id}
            coordinate={{
              latitude: item.latitude,
              longitude: item.longitude,
            }}
            title={item.restaurant.name}
            description={`Distance: ${(item.distance_meters / 1000).toFixed(2)} km`}
            pinColor="blue"
            onPress={() => handleMarkerPress(item.restaurant.id)}
          />
        ))}
      </MapView>

      <TouchableOpacity
        style={[styles.buttonContainer, { bottom: insets.bottom + 64 }]}
        onPress={focusOnLocation}
      >
        <Text style={styles.buttonText}>Get Location</Text>
      </TouchableOpacity>

      {selectedRestaurant && (
        <RestaurantModal
          visible={modalVisible}
          restaurant={selectedRestaurant}
          distance={
            restaurants.find((r) => r.restaurant.id === selectedRestaurant.id)?.distance_meters
              ? restaurants.find((r) => r.restaurant.id === selectedRestaurant.id)!.distance_meters /
                1609.34
              : undefined
          }
          onClose={closeModal}
          onViewMenu={openRestaurantMenu}
        />
      )}
    </View>
  );
}

