
import { Stack } from "expo-router";

import AuthProvider from "../Providers/AuthProvider";
import LocationProvider from "../Providers/LocationProvider";
import CartProvider from "../Providers/CartProvider";
import { StripeProvider } from "@stripe/stripe-react-native";

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}>
      <LocationProvider>
      <CartProvider>
        <AuthProvider>
          <Stack screenOptions={{ headerShown: false }}>
            {/* route groups */}
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(home)" />
            <Stack.Screen name="(owner)" />
            <Stack.Screen name="(onboarding)" />
          </Stack>
        </AuthProvider>
      </CartProvider>
    </LocationProvider>
    </StripeProvider>
  );
}
