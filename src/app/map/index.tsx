import { Button, Dimensions, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { useLocation } from "../../Providers/LocationProvider";

const MapScreen = () => {
    const mapRef = useRef<MapView>(null);
    const {location, errorMsg, isLoading} = useLocation();
    
    useEffect(() => {
        // wait for location to chage from context and then center map
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }, 1000);
        }
    }, [location]);

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

    // display loading text while location is being fetched
    if(isLoading){
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
                <Button title="Try Again" onPress={() => router.replace('/map')} />
            </View>
        );
    }

    return(
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
            </MapView>
            <TouchableOpacity 
                style={styles.backButton} 
                // can replace for router.back() to keep the map in memory
                onPress={() => router.replace('/')}
            >
                <Text style={styles.backButtonText}>← Back</Text>
            </TouchableOpacity>
            <View style = {styles.buttonContainer}>
             <Button title="Get Location" onPress={focusOnLocation} />
            </View> 
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




