import { Button, Dimensions, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { router } from 'expo-router';

const MapScreen = () => {
    const [myLocation, setMyLocation] = useState(null);
    const mapRef = useRef<MapView>(null);
    
    useEffect(() => {
        getLocation();
    }, []);

    const getLocation = async() => {
        try{
            let {status} = await Location.requestForegroundPermissionsAsync();
            if(status !== 'granted'){
                console.warn('Permission to access location was denied');
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            setMyLocation(location.coords);
            console.log(location);
            
            // Center the map on the user's location
            if(mapRef.current){
                mapRef.current.animateToRegion({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }, 1000);
            }
        }
        catch(err){
            console.warn(err);
        }
    }

    const focusOnLocation = () => {
        if (!myLocation || !mapRef.current) {
            return;
        }
        mapRef.current.animateToRegion({
            latitude: myLocation.latitude,
            longitude: myLocation.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        }, 1000);
    }

    // display loading text while location is being fetched
    if(!myLocation){
        return (
            <View style={styles.container}>
                <Text>Searching for location...</Text>
            </View>
        );
    }

    return(
        <View style={styles.container}>
            <MapView
                style={styles.map}
                ref={mapRef}
                initialRegion={{
                    latitude: myLocation.latitude,
                    longitude: myLocation.longitude,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                provider='google'
            >
                <Marker
                    coordinate={myLocation}
                    title={"My Location"}
                    description={"Here I am"}
                />
            </MapView>
            <TouchableOpacity 
                style={styles.backButton} 
                onPress={() => router.push('/')}
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




