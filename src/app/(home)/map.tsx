import { Button, Text, View, TouchableOpacity } from "react-native";
import React, { useEffect, useRef } from "react";
import MapView, { Marker } from "react-native-maps";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocation } from "../../Providers/LocationProvider";
import { supabase } from "../../lib/supabase";
import RestaurantModal from "../../components/RestaurantModal";
import { homeMapStyles as styles } from "../../components/styles";
import { WeeklyBusinessHours } from "../../lib/businessHours";

interface Restaurant {
  location_id: number;
  distance_meters: number;
  latitude: number;
  longitude: number;
  restaurant: {
    id: string;
    name: string;
    owner_id: string;
  };
}

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
  const { location, errorMsg, isLoading, refreshLocation } = useLocation(); // get location from location provider
  const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = React.useState<RestaurantModalInfo | null>(null);

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

  const selectedRestaurantDistanceMeters = selectedRestaurant
    ? restaurants.find((r) => r.restaurant.id === selectedRestaurant.id)?.distance_meters
    : undefined;

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
        <Button title="Try Again" onPress={() => refreshLocation()} />
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
        testID="re-center"
        style={[styles.recenterButton, { top: Math.max(24, insets.top * 0.45 + 14 + 44) }]}
        onPress={focusOnLocation}
        activeOpacity={0.8}
      >
        <Ionicons name="navigate" size={24} color="#0B2D5B" />
      </TouchableOpacity>

      {selectedRestaurant && (
        <RestaurantModal
          visible={modalVisible}
          restaurant={selectedRestaurant}
          distance={
            selectedRestaurantDistanceMeters !== undefined
              ? selectedRestaurantDistanceMeters / 1609.34
              : undefined
          }
          onClose={closeModal}
          onViewMenu={openRestaurantMenu}
        />
      )}
    </View>
  );
}

