import { Button, Dimensions, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { useLocation } from "../../Providers/LocationProvider";
import { supabase } from '../../lib/supabase';
import RestaurantModal from '../../components/RestaurantModal';

// Define the Restaurant type based on expected data structure
type Restaurant = {
    location_id: number;
    distance_meters: number;
    latitude: number;
    longitude: number;
    restaurant: {
        id: string,
        name: string,
        owner_id: string,
    }
}

// Restaurant information to be displayed in the modal
interface RestaurantModalInfo {
    id: string;
    name: string | null;
    description: string | null;
    cuisine_type: string | null;
    image_url: string | null;
    business_hours: { text: string } | null;
    phone: string | null;
    preview_images: string[] | null; // array of image URLs restaurant owners selected to display
}

const MapScreen = () => {
    const mapRef = useRef<MapView>(null);
    const { location, errorMsg, isLoading } = useLocation();
    const [restaurants, setRestaurants] = React.useState<Restaurant[]>([]);
    const [loadingRestaurants, setLoadingRestaurants] = React.useState(false);

    // Modal state
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = React.useState<RestaurantModalInfo | null>(null);
    const [loadingRestaurantDetails, setLoadingRestaurantDetails] = React.useState(false);

    // fetch restaurant locations from supabase on mount

    useEffect(() => {
        // wait for location to chage from context and then center map
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({ // center map on user location
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }, 1000);
            fetchNearbyRestaurants(location.latitude, location.longitude);
        }
    }, [location]);

    const fetchNearbyRestaurants = async (latitude: number, longitude: number) => {
        setLoadingRestaurants(true);
        const { data, error } = await supabase
            .rpc('get_nearby_restaurants', { // call the Postgres function
                user_lat: latitude,
                user_lng: longitude,
                radius_meters: 5000,
            });

        if (error) {
            console.error('Error fetching nearby restaurants:', error);
        } else if (data) {
            setRestaurants(data as Restaurant[]);
        }

        setLoadingRestaurants(false);
    };

    // Fetch restaurant details to render the modal
    const handleMarkerPress = async (restaurantId: string) => {
        setLoadingRestaurantDetails(true);
        setModalVisible(true);

        try {
            const { data, error } = await supabase
                .from('restaurants')
                .select('id, name, description, cuisine_type, image_url, business_hours, phone, preview_images')
                .eq('id', restaurantId)
                .single();

            if (error) {
                console.error('Error fetching restaurant details:', error);
                setModalVisible(false);
                return;
            }

            if (data) {
                setSelectedRestaurant(data as RestaurantModalInfo);
            }
        } catch (err) {
            console.error('Error:', err);
            setModalVisible(false);
        } finally {
            setLoadingRestaurantDetails(false);
        }
    };

    const focusOnLocation = () => {
        if (!location || !mapRef.current) {
            return;
        }
        mapRef.current.animateToRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }, 1000);
    }

    // Close the modal -> update state
    const closeModal = () => {
        setModalVisible(false);
        setSelectedRestaurant(null);
    }

    // display loading text while location is being fetched
    if (isLoading) {
        return (
            <View style={styles.container}>
                <Text>Searching for location...</Text>
            </View>
        );
    }

    // error handling for location fetch
    if (errorMsg || !location) {
        return (
            <View style={styles.container}>
                <Text>{errorMsg || "Location unavailable"}</Text>
                <Button title="Try Again" onPress={() => router.replace('/map')} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                ref={mapRef}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                provider='google'
            >
                <Marker
                    coordinate={location}
                    title={"My Location"}
                    description={"Here I am"}
                />
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
                style={styles.backButton}
                // can replace for router.back() to keep the map in memory
                onPress={() => router.replace('/')}
            >
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.buttonContainer}
                onPress={focusOnLocation}
            >
                <Text style={styles.backButtonText}>Get Location</Text>
            </TouchableOpacity>
            {/* Restaurant Modal */}
            {selectedRestaurant && (
                <RestaurantModal
                    visible={modalVisible}
                    restaurant={selectedRestaurant}
                    distance={restaurants.find(r => r.restaurant.id === selectedRestaurant.id)?.distance_meters
                        ? restaurants.find(r => r.restaurant.id === selectedRestaurant.id)!.distance_meters / 1609.34 // Convert meters to miles
                        : undefined}
                    onClose={closeModal}
                />
            )}
        </View>
    );
}

export default MapScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
    buttonContainer: {
        position: 'absolute',
        borderRadius: 10,
        bottom: 20,
        width: '100%',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'white',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
});




