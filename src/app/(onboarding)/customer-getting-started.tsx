import { useState } from "react";
import { Alert, Button, Text, View } from "react-native";
import { Input } from "@rneui/themed";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useAuth } from "../../Providers/AuthProvider";
import { useLocation } from "../../Providers/LocationProvider";
import { supabase } from "../../lib/supabase";
import { formatPublicCustomerName } from "../../lib/onboarding";
import { gettingStartedStyles as styles } from "../../components/styles";

export default function CustomerGettingStartedScreen() {
  const { session } = useAuth();
  const { refreshLocation } = useLocation();
  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [requestingLocation, setRequestingLocation] = useState(false);
  const [isNameSaved, setIsNameSaved] = useState(false);

  async function handleContinueWithName() {
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      Alert.alert("Missing name", "Please enter your full name to continue.");
      return;
    }

    if (!session?.user?.id) {
      Alert.alert("Not signed in", "Please sign in and try again.");
      return;
    }

    setSavingName(true);
    const { error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: session.user.id,
          email: session.user.email ?? null,
          role: "customer",
          full_name: trimmedName,
        },
        { onConflict: "id" }
      );

    setSavingName(false);

    if (error) {
      Alert.alert("Could not save name", error.message);
      return;
    }

    setIsNameSaved(true);
  }

  async function handleLocationStep() {
    setRequestingLocation(true);
    await refreshLocation();
    setRequestingLocation(false);
    router.replace("/(home)/home");
  }

  const publicNamePreview = formatPublicCustomerName(fullName);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.container}>
        {!isNameSaved ? (
          <>
            <Text style={styles.title}>Welcome to FoodDiscovery</Text>
            <Text style={styles.subtitle}>
              Let's get your account ready before you start exploring.
            </Text>
            <Text style={styles.helperText}>
              Enter your full name. Businesses will only see your first name and last initial.
            </Text>
            <View style={styles.inputWrap}>
              <Input
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
                placeholder="e.g., Jane Smith"
              />
            </View>
            {publicNamePreview ? (
              <Text style={styles.helperText}>
                Shared with businesses as: {publicNamePreview}
              </Text>
            ) : null}
            <View style={styles.buttonWrap}>
              <Button
                title={savingName ? "Saving..." : "Continue"}
                onPress={handleContinueWithName}
                disabled={savingName}
              />
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>Enable Location</Text>
            <Text style={styles.subtitle}>
              We use your location to help you discover nearby restaurants and sort by distance.
            </Text>
            <Text style={styles.helperText}>
              Tap the button below to open the iOS location permission prompt.
            </Text>
            <View style={styles.buttonWrap}>
              <Button
                title={requestingLocation ? "Requesting..." : "Allow Location Access"}
                onPress={handleLocationStep}
                disabled={requestingLocation}
              />
            </View>
            <View style={styles.secondaryButtonWrap}>
              <Button
                title="Skip for now"
                onPress={() => router.replace("/(home)/home")}
                disabled={requestingLocation}
              />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
