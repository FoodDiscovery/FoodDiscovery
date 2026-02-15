import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import styles from "./ownerStyles";

type RestaurantRow = {
  id: string;
  owner_id: string;
  name: string | null;
  description: string | null;
  cuisine_type: string | null;
  image_url: string | null;

};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        style={[
          styles.input,
          multiline ? styles.multilineInput : null,
        ]}
      />
    </View>
  );
}

export default function OwnerProfileScreen() {
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  // Restaurant fields
  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [description, setDescription] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [phone, setPhone] = useState(""); // stored locally unless you add a DB column

  // Stats
  const [ordersCount, setOrdersCount] = useState<number | null>(null);
  const [salesTotal, setSalesTotal] = useState<number | null>(null);

  const isDirty = useMemo(() => {
    return (
      name.trim() !== "" ||
      cuisine.trim() !== "" ||
      description.trim() !== "" ||
      logoUrl.trim() !== "" ||
      phone.trim() !== ""
    );
  }, [name, cuisine, description, logoUrl, phone]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        setLoading(false);
        Alert.alert("Not signed in", "Please sign in again.");
        router.replace("/(auth)/sign-in");
        return;
      }

      // Confirm role is owner
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userRes.user.id)
        .single();

      if (profileErr) {
        setLoading(false);
        Alert.alert("Error", profileErr.message);
        return;
      }

      if (profile?.role !== "owner") {
        setLoading(false);
        Alert.alert("Not an owner", "This page is only for business owners.");
        router.replace("/(home)/home");
        return;
      }

      // Load restaurant
      const { data: restaurant, error: restErr } = await supabase
        .from("restaurants")
        .select("id,owner_id,name,description,cuisine_type,image_url")
        .eq("owner_id", userRes.user.id)
        .single();

      if (restErr) {
        setLoading(false);
        Alert.alert("Failed to load restaurant", restErr.message);
        return;
      }

      if (!restaurant) {
        setLoading(false);
        Alert.alert("No restaurant found", "Please create your restaurant first.");
        router.replace("/(owner)/restaurant-edit");
        return;
      }

      const row = restaurant as RestaurantRow;
      setRestaurantId(row.id);
      setName(row.name ?? "");
      setCuisine(row.cuisine_type ?? "");
      setDescription(row.description ?? "");
      setLogoUrl(row.image_url ?? "");

      // Load stats (best-effort depending on your schema)
      await loadStats(row.id);

      setLoading(false);
    };

    const loadStats = async (rid: string) => {
      // 1) Count orders (expects orders.restaurant_id)
      try {
        const { count, error } = await supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("restaurant_id", rid);

        if (!error) setOrdersCount(count ?? 0);
      } catch {}

      // 2) Sum sales
      // Preferred: orders.total_amount (or total / amount) if you have it.
      // Fallback: sum order_items (price * quantity) if columns exist.
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("total_amount")
          .eq("restaurant_id", rid);

        if (!error && Array.isArray(data) && data.length > 0) {
          const sum = data.reduce((acc: number, r: any) => acc + (Number(r.total_amount) || 0), 0);
          setSalesTotal(sum);
          return;
        }
      } catch {}

      // Fallback attempt: order_items has restaurant_id + line_total
      try {
        const { data, error } = await supabase
          .from("order_items")
          .select("line_total")
          .eq("restaurant_id", rid);

        if (!error && Array.isArray(data) && data.length > 0) {
          const sum = data.reduce((acc: number, r: any) => acc + (Number(r.line_total) || 0), 0);
          setSalesTotal(sum);
          return;
        }
      } catch {}


      if (salesTotal === null) setSalesTotal(0);
    };

    load();

  }, []);

  const onSave = async () => {
    if (!restaurantId) return;

    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter your restaurant name.");
      return;
    }

    setSaving(true);

  
    const { error } = await supabase
      .from("restaurants")
      .update({
        name: name.trim(),
        description: description.trim(),
        cuisine_type: cuisine.trim(),
        image_url: logoUrl.trim() || null,
      })
      .eq("id", restaurantId);

    setSaving(false);

    if (error) {
      Alert.alert("Save failed", error.message);
      return;
    }


    if (phone.trim()) {
      Alert.alert(
        "Saved",
        "Restaurant details saved.\n\nNote: phone number is not saved to Supabase yet (add a phone column to restaurants to persist it)."
      );
      return;
    }

    Alert.alert("Saved", "Business profile updated successfully.");
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading owner profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topTitle}>Owner Profile</Text>
        <Button title="Back" onPress={() => router.push("/")} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardFlex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          {/* Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Business Stats</Text>
            <Text style={styles.statsLine}>
              Orders: <Text style={styles.statsValue}>{ordersCount ?? 0}</Text>
            </Text>
            <Text style={styles.statsLine}>
              Sales:{" "}
              <Text style={styles.statsValue}>
                ${Number(salesTotal ?? 0).toFixed(2)}
              </Text>
            </Text>
            <Text style={styles.statsHint}>
              (Sales total depends on your orders schema.)
            </Text>
          </View>

          {/* Logo preview */}
          <View style={styles.logoRow}>
            {logoUrl.trim() ? (
              <Image source={{ uri: logoUrl.trim() }} style={styles.logoImg} />
            ) : (
              <View style={styles.logoPlaceholder}>
                <Text style={styles.noLogoText}>No logo</Text>
              </View>
            )}
            <View style={styles.logoMetaWrap}>
              <Text style={styles.logoLabel}>Logo</Text>
              <Text style={styles.logoHint}>
                Paste an image URL for now (we can switch to uploading later).
              </Text>
            </View>
          </View>

          <Field
            label="Logo URL"
            value={logoUrl}
            onChangeText={setLogoUrl}
            placeholder="https://..."
          />

          <Field
            label="Restaurant Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., FoodDiscovery Cafe"
          />

          <Field
            label="Cuisine Type"
            value={cuisine}
            onChangeText={setCuisine}
            placeholder="e.g., Ethiopian, Thai, Mexican"
          />

          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Short description customers will see"
            multiline
          />

          <Field
            label="Phone Number"
            value={phone}
            onChangeText={setPhone}
            placeholder="(555) 123-4567"
          />

          <View style={styles.saveWrap}>
            <Button
              title={saving ? "Saving..." : "Save profile"}
              onPress={onSave}
              disabled={saving || !restaurantId || !isDirty}
            />
          </View>

          <View style={styles.editDetailsWrap}>
            <Button
              title="Edit full restaurant details"
              onPress={() => router.push("/(owner)/restaurant-edit")}
            />
          </View>

          <Text style={styles.footnote}>
            To persist phone number in Supabase, add a column:
            {"\n"}ALTER TABLE public.restaurants ADD COLUMN phone text;
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
