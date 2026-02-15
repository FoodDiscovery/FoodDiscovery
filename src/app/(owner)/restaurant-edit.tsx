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
  TouchableOpacity,
} from "react-native";
import { supabase } from "../../lib/supabase";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system/next";
import { decode } from "base64-arraybuffer";
import { router } from "expo-router";
import styles from "./ownerStyles";

interface RestaurantRow {
  id: string;
  owner_id: string;
  name: string | null;
  description: string | null;
  cuisine_type: string | null;
  image_url: string | null;
  business_hours: { text: string } | null;
  phone: string | null;
  created_at: string | null;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "phone-pad";
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontSize: 14, fontWeight: "600" }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        keyboardType={keyboardType ?? "default"}
        style={{
          borderWidth: 1,
          borderColor: "#333",
          borderRadius: 10,
          paddingHorizontal: 12,
          paddingVertical: multiline ? 12 : 10,
          fontSize: 16,
          minHeight: multiline ? 90 : undefined,
        }}
      />
    </View>
  );
}

async function uploadImageToSupabase(params: {
  restaurantId: string;
  ownerId: string;
}): Promise<string | null> {
  const { restaurantId, ownerId } = params;

  // Ask permission
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert("Permission needed", "Please allow photo library access to upload an image.");
    return null;
  }

  // Pick image
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.9,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset?.uri) return null;

  // Read file as base64 -> arraybuffer using new File class
  const file = new File(asset.uri);
  const base64 = await file.base64();
  const arrayBuffer = decode(base64);

  // Guess extension / content type
  const fileExt = asset.uri.toLowerCase().includes(".png") ? "png" : "jpg";
  const contentType = fileExt === "png" ? "image/png" : "image/jpeg";

  // Put images under: restaurant-images/<ownerId>/<restaurantId>/image.<ext>
  const path = `${ownerId}/${restaurantId}/image.${fileExt}`;

  const { error: uploadErr } = await supabase.storage
    .from("restaurant-images")
    .upload(path, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadErr) {
    Alert.alert("Upload failed", uploadErr.message);
    return null;
  }

  const { data } = supabase.storage.from("restaurant-images").getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export default function RestaurantEditScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [businessHours, setBusinessHours] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [address, setAddress] = useState("");
  const [locationId, setLocationId] = useState<number | null>(null);

  const isDirty = useMemo(() => {
    return (
      name.trim().length > 0 ||
      description.trim().length > 0 ||
      cuisineType.trim().length > 0 ||
      businessHours.trim().length > 0 ||
      phone.trim().length > 0 ||
      imageUrl.trim().length > 0 ||
      address.trim().length > 0
    );
  }, [name, description, cuisineType, businessHours, phone, imageUrl, address]);

  useEffect(() => {
    const loadOrCreateRestaurant = async () => {
      setLoading(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        setLoading(false);
        Alert.alert("Not signed in", "Please sign in to edit your restaurant.");
        return;
      }

      const uid = userRes.user.id;
      setOwnerId(uid);

      // Check if user has 'owner' role in profiles table
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", uid)
        .single();

      if (profileErr) {
        setLoading(false);
        Alert.alert("Profile load failed", profileErr.message);
        return;
      }

      if (profile?.role !== "owner") {
        setIsOwner(false);
        setLoading(false);
        return;
      }

      setIsOwner(true);

      // Fetch existing restaurant for this owner
      const { data: existing, error: fetchErr } = await supabase
        .from("restaurants")
        .select("id,owner_id,name,description,cuisine_type,image_url,business_hours,phone,created_at")
        .eq("owner_id", uid)
        .maybeSingle();

      if (fetchErr) {
        setLoading(false);
        Alert.alert("Load failed", fetchErr.message);
        return;
      }

      const hydrate = (row: RestaurantRow) => {
        setRestaurantId(row.id);
        setOwnerId(row.owner_id);
        setName(row.name ?? "");
        setDescription(row.description ?? "");
        setCuisineType(row.cuisine_type ?? "");
        setBusinessHours(row.business_hours?.text ?? "");
        setPhone(row.phone ?? "");
        setImageUrl(row.image_url ?? "");
      };

      const loadLocation = async (restaurantId: string) => {
        const { data: location, error: locationErr } = await supabase
          .from("locations")
          .select("id, restaurant_id, address_text")
          .eq("restaurant_id", restaurantId)
          .maybeSingle();

        if (!locationErr && location) {
          setLocationId(location.id);
          setAddress(location.address_text ?? "");
        }
      };

      if (!existing) {
        // Create a new restaurant for this owner
        const { data: created, error: createErr } = await supabase
          .from("restaurants")
          .insert([
            {
              owner_id: uid,
              name: "",
              description: "",
              cuisine_type: "",
              business_hours: { text: "" },
              phone: "",
              image_url: "",
            },
          ])
          .select("id,owner_id,name,description,cuisine_type,image_url,business_hours,phone,created_at")
          .single();

        if (createErr) {
          setLoading(false);
          Alert.alert("Create failed", createErr.message + "\n\nYou may need an INSERT RLS policy.");
          return;
        }

        hydrate(created as RestaurantRow);
        setLoading(false);
        return;
      }

      hydrate(existing as RestaurantRow);
      await loadLocation(existing.id);
      setLoading(false);
    };

    loadOrCreateRestaurant();
  }, []);

  const onPickImage = async () => {
    if (!restaurantId || !ownerId) {
      Alert.alert("Not ready", "Restaurant not loaded yet.");
      return;
    }

    setUploadingImage(true);
    const publicUrl = await uploadImageToSupabase({ restaurantId, ownerId });
    setUploadingImage(false);

    if (publicUrl) {
      setImageUrl(publicUrl);
      Alert.alert("Image uploaded", "Image saved locally. Press 'Save changes' to store it on your restaurant.");
    }
  };

  const onSave = async () => {
    if (!restaurantId) return;

    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter a restaurant name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("restaurants")
      .update({
        name: name.trim(),
        description: description.trim(),
        cuisine_type: cuisineType.trim(),
        business_hours: { text: businessHours.trim() },
        phone: phone.trim(),
        image_url: imageUrl.trim(),
      })
      .eq("id", restaurantId);

    if (error) {
      setSaving(false);
      Alert.alert("Save failed", error.message);
      return;
    }

    // Save or update location/address
    if (address.trim()) {
      if (locationId) {
        // Update existing location
        const { error: locationErr } = await supabase
          .from("locations")
          .update({ address_text: address.trim() })
          .eq("id", locationId);

        if (locationErr) {
          console.error("Location update error:", locationErr);
        }
      } else {
        // Create new location
        const { data: newLocation, error: locationErr } = await supabase
          .from("locations")
          .insert([
            {
              restaurant_id: restaurantId,
              address_text: address.trim(),
            },
          ])
          .select("id")
          .single();

        if (locationErr) {
          console.error("Location create error:", locationErr);
        } else if (newLocation) {
          setLocationId(newLocation.id);
        }
      }
    }

    setSaving(false);
    Alert.alert("Saved", "Restaurant details updated successfully.");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Loading restaurant...</Text>
      </View>
    );
  }

  // Show access denied message if user is not an owner
  if (!isOwner) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: "600", textAlign: "center" }}>
          Access Denied
        </Text>
        <Text style={{ marginTop: 10, opacity: 0.7, textAlign: "center" }}>
          This page is only available for business owners. Please register as a business owner to manage your restaurant.
        </Text>
        <TouchableOpacity style={[styles.backButton, { marginTop: 20 }]} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Edit Restaurant</Text>
        <Text style={{ opacity: 0.7 }}>Update basic details for your restaurant.</Text>

        <Field
          label="Restaurant Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g., FoodDiscovery Cafe"
        />

        <Field
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="e.g., 123 Main St, City, State"
        />

        <Field
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="e.g., A cozy cafe serving fresh, local cuisine"
          multiline
        />

        <Field
          label="Cuisine Type"
          value={cuisineType}
          onChangeText={setCuisineType}
          placeholder="e.g., Ethiopian, Thai, Mexican"
        />

        <Field
          label="Business Hours"
          value={businessHours}
          onChangeText={setBusinessHours}
          placeholder="e.g., Mon–Fri 10am–8pm"
        />

        <Field
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="e.g., (831) 555-1234"
          keyboardType="phone-pad"
        />

        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 14, fontWeight: "600" }}>Restaurant Image</Text>

          {imageUrl ? (
            <View style={{ alignItems: "flex-start", gap: 8 }}>
              <Image
                source={{ uri: imageUrl }}
                style={{ width: 96, height: 96, borderRadius: 12, borderWidth: 1, borderColor: "#333", backgroundColor: "#f0f0f0" }}
                onError={(e) => {
                  console.error("Image load error:", e.nativeEvent.error);
                  console.log("Failed URL:", imageUrl);
                  Alert.alert(
                    "Image Load Error",
                    `Could not load image. Please check:\n\n1. The storage bucket is set to PUBLIC in Supabase\n2. The bucket name matches your code\n\nURL: ${imageUrl.substring(0, 100)}...`
                  );
                }}
                onLoad={() => console.log("Image loaded successfully:", imageUrl)}
              />
              <Text style={{ fontSize: 12, opacity: 0.7, maxWidth: 280 }} numberOfLines={2}>{imageUrl}</Text>
            </View>
          ) : (
            <Text style={{ opacity: 0.7 }}>No image uploaded yet.</Text>
          )}

          <Button
            title={uploadingImage ? "Uploading..." : "Pick & upload image"}
            onPress={onPickImage}
            disabled={uploadingImage || !restaurantId || !ownerId}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <Button
            title={saving ? "Saving..." : "Save changes"}
            onPress={onSave}
            disabled={saving || !restaurantId || !isDirty}
          />
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

