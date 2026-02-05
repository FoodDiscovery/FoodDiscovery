import { Stack } from 'expo-router';
import LocationProvider from '../../Providers/LocationProvider';

export default function MapLayout() {
    return (
        <LocationProvider>
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="map" />
        </Stack>
        </LocationProvider>
    );
}