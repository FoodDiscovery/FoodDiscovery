import React, { useEffect, useState } from "react";
import { View, Text, Alert, Button, Image, StyleSheet, ActivityIndicator } from "react-native";
import { Link, useRouter } from "expo-router";
import { useAuth } from "../Providers/AuthProvider";
import { supabase } from "../lib/supabase";
import { StripeProvider } from "@stripe/stripe-react-native"; 
interface RestaurantInfo {
  name: string;
  image_url: string | null;
}

export default function App() {
  const { session } = useAuth();
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.id) {
        setIsOwner(false);
        setRestaurant(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      // Fetch user profile to check role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      const userIsOwner = profile?.role === "owner";
      setIsOwner(userIsOwner);

      // If user is an owner, fetch their restaurant data
      if (userIsOwner) {
        const { data: restaurantData } = await supabase
          .from("restaurants")
          .select("name, image_url")
          .eq("owner_id", session.user.id)
          .single();

        if (restaurantData) {
          setRestaurant({
            name: restaurantData.name || "Your Restaurant",
            image_url: restaurantData.image_url,
          });
        }
      } else {
        setRestaurant(null);
      }

      setLoading(false);
    };

    fetchUserData();
  }, [session]);

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Error signing out", error.message);
  }

  if (loading && session) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
    >

    <View style={styles.container}>
      {session ? (
        <View style={styles.contentContainer}>
          {isOwner && restaurant ? (
            // Owner view with restaurant info
            <View style={styles.ownerSection}>
              {restaurant.image_url ? (
                <Image
                  source={{ uri: restaurant.image_url }}
                  style={styles.restaurantImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}
              <Text style={styles.greeting}>Hello, {restaurant.name}!</Text>
            </View>
          ) : (
            // Customer view
            <Text style={styles.greeting}>Welcome to FoodDiscovery!</Text>
          )}

          <Text style={styles.emailText}>
            Signed in as: {session.user.email}
          </Text>

          <View style={styles.buttonContainer}>
            <Button title="Home" onPress={() => router.push("/home")} />
            <Button title="Sign Out" onPress={handleSignOut} />
            <Button title="View Map" onPress={() => router.push("/map")} />
            <Button title="Owner Profile" onPress={() => router.push("/(owner)/owner-profile")} />
            
            {isOwner && (
              <>
                <Button
                  title="Edit Restaurant"
                  onPress={() => router.push("/(owner)/restaurant-edit")}
                />
                <Button
                  title="Edit Menu"
                  onPress={() => router.push("/(owner)/menu-edit")}
                />
              </>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.authContainer}>
          <Text style={styles.signInPrompt}>Please sign in</Text>

          <Link href="/(auth)/sign-in" asChild>
            <Button title="Sign in" />
          </Link>

          <Link href="/(auth)/sign-up" asChild>
            <Button title="Create account" />
          </Link>
        </View>
      )}
    </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  contentContainer: {
    alignItems: "center",
    gap: 12,
    width: "100%",
  },
  ownerSection: {
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ccc",
  },
  placeholderText: {
    color: "#888",
    fontSize: 12,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  emailText: {
    fontSize: 16,
    color: "#666",
  },
  buttonContainer: {
    gap: 12,
    width: "100%",
    marginTop: 8,
  },
  authContainer: {
    gap: 12,
    width: "100%",
  },
  signInPrompt: {
    textAlign: "center",
  },
});
