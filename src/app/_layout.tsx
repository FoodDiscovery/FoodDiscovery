
import React from "react";
import { Stack } from "expo-router";

import AuthProvider from "../Providers/AuthProvider";
import LocationProvider from "../Providers/LocationProvider";
import CartProvider from "../Providers/CartProvider";

export default function RootLayout() {
  return (
    <LocationProvider>
      <CartProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* route groups */}
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(home)" />
            <Stack.Screen name="(owner)" />

            {/* non-group routes (like /map) */}
            <Stack.Screen name="map" />
          </Stack>
        </AuthProvider>
      </CartProvider>
    </LocationProvider>
  );
}
