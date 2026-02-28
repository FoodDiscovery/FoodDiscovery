import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  Image,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { supabase } from "../../lib/supabase";
import { ownerStyles as styles } from "../../components/styles";
import sharedStyles from "../../components/styles/sharedStyles";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system/next";
import { decode } from "base64-arraybuffer";
import BusinessHoursEditor from "../../components/BusinessHoursEditor";
import {
  WeeklyBusinessHours,
  createDefaultBusinessHours,
  normalizeWeeklyBusinessHours,
  validateWeeklyBusinessHours,
} from "../../lib/businessHours";

interface RestaurantRow {
  id: string;
  owner_id: string;
  name: string | null;
  description: string | null;
  cuisine_type: string | null;
  image_url: string | null;
  business_hours: WeeklyBusinessHours | { text?: string } | string | null;
  phone: string | null;
}

interface FormState {
  ownerFullName: string;
  name: string;
  address: string;
  cuisine: string;
  description: string;
  businessHours: WeeklyBusinessHours;
  phone: string;
  imageUrl: string;
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
    <View style={styles.fieldContainer}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9AA0A6"
        multiline={multiline}
        keyboardType={keyboardType ?? "default"}
        style={[styles.input, multiline ? styles.multilineInput : null]}
      />
    </View>
  );
}

async function uploadImageToSupabase(params: {
  restaurantId: string;
  ownerId: string;
}): Promise<string | null> {
  const { restaurantId, ownerId } = params;

  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert("Permission needed", "Please allow photo library access to upload an image.");
    return null;
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.9,
    allowsEditing: true,
    aspect: [1, 1],
  });

  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset?.uri) return null;

  const file = new File(asset.uri);
  const base64 = await file.base64();
  const arrayBuffer = decode(base64);

  const fileExt = asset.uri.toLowerCase().includes(".png") ? "png" : "jpg";
  const contentType = fileExt === "png" ? "image/png" : "image/jpeg";
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

export default function OwnerProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<number | null>(null);

  const [ownerFullName, setOwnerFullName] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [description, setDescription] = useState("");
  const [businessHours, setBusinessHours] = useState<WeeklyBusinessHours>(createDefaultBusinessHours());
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [initialValues, setInitialValues] = useState<FormState | null>(null);

  const currentValues = useMemo<FormState>(
    () => ({
      ownerFullName: ownerFullName.trim(),
      name: name.trim(),
      address: address.trim(),
      cuisine: cuisine.trim(),
      description: description.trim(),
      businessHours,
      phone: phone.trim(),
      imageUrl: imageUrl.trim(),
    }),
    [ownerFullName, name, address, cuisine, description, businessHours, phone, imageUrl]
  );

  const isDirty = useMemo(() => {
    if (!initialValues) return false;
    return JSON.stringify(currentValues) !== JSON.stringify(initialValues);
  }, [currentValues, initialValues]);

  useEffect(() => {
    const loadLocation = async (rid: string) => {
      const { data: location, error: locationErr } = await supabase
        .from("locations")
        .select("id, address_text")
        .eq("restaurant_id", rid)
        .maybeSingle();

      if (!locationErr && location) {
        setLocationId(location.id);
        setAddress(location.address_text ?? "");
        return location.address_text ?? "";
      }

      return "";
    };

    const load = async () => {
      setLoading(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        setLoading(false);
        Alert.alert("Not signed in", "Please sign in again.");
        router.replace("/(auth)/sign-in");
        return;
      }

      const uid = userRes.user.id;
      setOwnerId(uid);

      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("role,full_name")
        .eq("id", uid)
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

      const { data: restaurant, error: restErr } = await supabase
        .from("restaurants")
        .select("id,owner_id,name,description,cuisine_type,image_url,business_hours,phone")
        .eq("owner_id", uid)
        .maybeSingle();

      if (restErr) {
        setLoading(false);
        Alert.alert("Failed to load restaurant", restErr.message);
        return;
      }

      let row: RestaurantRow;
      if (!restaurant) {
        const { data: created, error: createErr } = await supabase
          .from("restaurants")
          .insert([
            {
              owner_id: uid,
              name: "",
              description: "",
              cuisine_type: "",
              business_hours: createDefaultBusinessHours(),
              phone: "",
              image_url: "",
            },
          ])
          .select("id,owner_id,name,description,cuisine_type,image_url,business_hours,phone")
          .single();

        if (createErr || !created) {
          setLoading(false);
          Alert.alert("Create failed", createErr?.message ?? "Unable to create restaurant.");
          return;
        }

        row = created as RestaurantRow;
      } else {
        row = restaurant as RestaurantRow;
      }

      const loadedAddress = await loadLocation(row.id);
      const loadedHours = normalizeWeeklyBusinessHours(row.business_hours);
      setRestaurantId(row.id);
      setOwnerFullName(profile?.full_name ?? "");
      setName(row.name ?? "");
      setCuisine(row.cuisine_type ?? "");
      setDescription(row.description ?? "");
      setBusinessHours(loadedHours);
      setPhone(row.phone ?? "");
      setImageUrl(row.image_url ?? "");
      setInitialValues({
        ownerFullName: (profile?.full_name ?? "").trim(),
        name: (row.name ?? "").trim(),
        address: loadedAddress.trim(),
        cuisine: (row.cuisine_type ?? "").trim(),
        description: (row.description ?? "").trim(),
        businessHours: loadedHours,
        phone: (row.phone ?? "").trim(),
        imageUrl: (row.image_url ?? "").trim(),
      });

      setLoading(false);
    };

    load();
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
    }
  };

  const onSave = async () => {
    if (!restaurantId) return;

    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter your restaurant name.");
      return;
    }
    if (!ownerFullName.trim()) {
      Alert.alert("Missing name", "Please enter your full name.");
      return;
    }

    const businessHoursError = validateWeeklyBusinessHours(businessHours);
    if (businessHoursError) {
      Alert.alert("Invalid business hours", businessHoursError);
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("restaurants")
      .update({
        name: name.trim(),
        description: description.trim(),
        cuisine_type: cuisine.trim(),
        business_hours: businessHours,
        phone: phone.trim() || null,
        image_url: imageUrl.trim() || null,
      })
      .eq("id", restaurantId);

    if (error) {
      setSaving(false);
      Alert.alert("Save failed", error.message);
      return;
    }

    if (ownerId) {
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ full_name: ownerFullName.trim() })
        .eq("id", ownerId);

      if (profileError) {
        setSaving(false);
        Alert.alert("Save failed", profileError.message);
        return;
      }
    }

    if (address.trim()) {
      if (locationId) {
        const { error: locationErr } = await supabase
          .from("locations")
          .update({ address_text: address.trim() })
          .eq("id", locationId);

        if (locationErr) {
          setSaving(false);
          Alert.alert("Address save failed", locationErr.message);
          return;
        }
      } else {
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
          setSaving(false);
          Alert.alert("Address save failed", locationErr.message);
          return;
        }

        if (newLocation) {
          setLocationId(newLocation.id);
        }
      }
    }

    setInitialValues(currentValues);
    setSaving(false);
    Alert.alert("Saved", "Business profile updated successfully.");
  };

  async function handleSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Error signing out", error.message);
    }
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.center}>
          <ActivityIndicator />
          <Text style={styles.loadingText}>Loading owner profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={sharedStyles.ownerPageHeader}>
        <Text style={sharedStyles.ownerPageTitle}>Owner Profile</Text>
        <Text style={sharedStyles.ownerPageSubtitle}>
          Edit your restaurant profile and business details
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardFlex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[styles.logoCard, styles.logoRow]}
              onPress={onPickImage}
              disabled={uploadingImage}
              activeOpacity={0.9}
            >
              {imageUrl.trim() ? (
                <Image
                  source={{ uri: imageUrl.trim() }}
                  style={styles.logoImg}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Text style={styles.noLogoText}>No Image</Text>
                </View>
              )}
              <View style={styles.logoMetaWrap}>
                <Text style={styles.logoLabel}>Restaurant Image</Text>
                <Text style={styles.logoHint}>
                  {uploadingImage ? "Uploading image..." : "Tap to choose from your camera roll"}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={styles.card}>
            <Field
              label="Owner Full Name"
              value={ownerFullName}
              onChangeText={setOwnerFullName}
              placeholder="e.g., Jane Smith"
            />

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

            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Business Hours</Text>
              <BusinessHoursEditor value={businessHours} onChange={setBusinessHours} />
            </View>

            <Field
              label="Phone Number"
              value={phone}
              onChangeText={setPhone}
              placeholder="(555) 123-4567"
              keyboardType="phone-pad"
            />
            </View>

            <View style={styles.saveWrap}>
              <Pressable
                onPress={onSave}
                disabled={saving || !restaurantId || !isDirty}
                style={({ pressed }) => [
                  styles.saveBtn,
                  (saving || !restaurantId || !isDirty) && styles.saveBtnDisabled,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Text style={styles.saveBtnText}>
                  {saving ? "Saving..." : "Save profile"}
                </Text>
              </Pressable>
            </View>

            <View style={styles.signOutWrap}>
              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => [styles.signOutBtn, pressed && { opacity: 0.85 }]}
              >
                <Text style={styles.signOutBtnText}>Sign Out</Text>
              </Pressable>
            </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
