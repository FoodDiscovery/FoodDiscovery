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
import { supabase } from "../../lib/supabase";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { decode } from "base64-arraybuffer";

type CompanyRow = {
  id: string;
  owner_id: string;
  name: string | null;
  cuisine: string | null;
  address: string | null;
  hours: string | null;
  phone: string | null;
  logo_url: string | null;
  created_at: string | null;
};

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

async function uploadLogoToSupabase(params: {
  companyId: string;
  ownerId: string;
}): Promise<string | null> {
  const { companyId, ownerId } = params;

  // Ask permission
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert("Permission needed", "Please allow photo library access to upload a logo.");
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

  // Read file as base64 -> arraybuffer
  const base64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const arrayBuffer = decode(base64);

  // Guess extension / content type
  const fileExt = asset.uri.toLowerCase().includes(".png") ? "png" : "jpg";
  const contentType = fileExt === "png" ? "image/png" : "image/jpeg";

  // Put logos under: company-logos/<ownerId>/<companyId>/logo.<ext>
  const path = `${ownerId}/${companyId}/logo.${fileExt}`;

  const { error: uploadErr } = await supabase.storage
    .from("company-logos")
    .upload(path, arrayBuffer, {
      contentType,
      upsert: true,
    });

  if (uploadErr) {
    Alert.alert("Upload failed", uploadErr.message);
    return null;
  }

  const { data } = supabase.storage.from("company-logos").getPublicUrl(path);
  return data?.publicUrl ?? null;
}

export default function CompanyEditScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [companyId, setCompanyId] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [phone, setPhone] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const isDirty = useMemo(() => {
    return (
      name.trim().length > 0 ||
      cuisine.trim().length > 0 ||
      address.trim().length > 0 ||
      hours.trim().length > 0 ||
      phone.trim().length > 0 ||
      logoUrl.trim().length > 0
    );
  }, [name, cuisine, address, hours, phone, logoUrl]);

  useEffect(() => {
    const loadOrCreateCompany = async () => {
      setLoading(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userRes.user) {
        setLoading(false);
        Alert.alert("Not signed in", "Please sign in to edit your company.");
        return;
      }

      const uid = userRes.user.id;
      setOwnerId(uid);

      // IMPORTANT: filter to only THIS user's company
      const { data: existing, error: fetchErr } = await supabase
        .from("companies")
        .select("id,owner_id,name,cuisine,address,hours,phone,logo_url,created_at")
        .eq("owner_id", uid)
        .maybeSingle();

      if (fetchErr) {
        setLoading(false);
        Alert.alert("Load failed", fetchErr.message);
        return;
      }

      const hydrate = (row: CompanyRow) => {
        setCompanyId(row.id);
        setOwnerId(row.owner_id);
        setName(row.name ?? "");
        setCuisine(row.cuisine ?? "");
        setAddress(row.address ?? "");
        setHours(row.hours ?? "");
        setPhone(row.phone ?? "");
        setLogoUrl(row.logo_url ?? "");
      };

      if (!existing) {
        const { data: created, error: createErr } = await supabase
          .from("companies")
          .insert([
            {
              owner_id: uid,
              name: "",
              cuisine: "",
              address: "",
              hours: "",
              phone: "",
              logo_url: "",
            },
          ])
          .select("id,owner_id,name,cuisine,address,hours,phone,logo_url,created_at")
          .single();

        if (createErr) {
          setLoading(false);
          Alert.alert("Create failed", createErr.message + "\n\nYou may need an INSERT RLS policy.");
          return;
        }

        hydrate(created as CompanyRow);
        setLoading(false);
        return;
      }

      hydrate(existing as CompanyRow);
      setLoading(false);
    };

    loadOrCreateCompany();
  }, []);

  const onPickLogo = async () => {
    if (!companyId || !ownerId) {
      Alert.alert("Not ready", "Company not loaded yet.");
      return;
    }

    setUploadingLogo(true);
    const publicUrl = await uploadLogoToSupabase({ companyId, ownerId });
    setUploadingLogo(false);

    if (publicUrl) {
      setLogoUrl(publicUrl);
      Alert.alert("Logo uploaded", "Logo saved locally. Press “Save changes” to store it on your company.");
    }
  };

  const onSave = async () => {
    if (!companyId) return;

    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter a company name.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("companies")
      .update({
        name: name.trim(),
        cuisine: cuisine.trim(),
        address: address.trim(),
        hours: hours.trim(),
        phone: phone.trim(),
        logo_url: logoUrl.trim(),
      })
      .eq("id", companyId);

    setSaving(false);

    if (error) {
      Alert.alert("Save failed", error.message);
      return;
    }

    Alert.alert("Saved", "Company details updated successfully.");
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 10 }}>Loading company...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Edit Company</Text>
        <Text style={{ opacity: 0.7 }}>Update basic details for your restaurant.</Text>

        <Field
          label="Company Name"
          value={name}
          onChangeText={setName}
          placeholder="e.g., FoodDiscovery Cafe"
        />

        <Field
          label="Cuisine"
          value={cuisine}
          onChangeText={setCuisine}
          placeholder="e.g., Ethiopian, Thai, Mexican"
        />

        <Field
          label="Address"
          value={address}
          onChangeText={setAddress}
          placeholder="e.g., 123 Main St, Santa Cruz, CA"
        />

        <Field
          label="Hours"
          value={hours}
          onChangeText={setHours}
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
          <Text style={{ fontSize: 14, fontWeight: "600" }}>Logo</Text>

          {logoUrl ? (
            <View style={{ alignItems: "flex-start", gap: 8 }}>
              <Image
                source={{ uri: logoUrl }}
                style={{ width: 96, height: 96, borderRadius: 12, borderWidth: 1, borderColor: "#333" }}
              />
              <Text style={{ fontSize: 12, opacity: 0.7 }}>{logoUrl}</Text>
            </View>
          ) : (
            <Text style={{ opacity: 0.7 }}>No logo uploaded yet.</Text>
          )}

          <Button
            title={uploadingLogo ? "Uploading..." : "Pick & upload logo"}
            onPress={onPickLogo}
            disabled={uploadingLogo || !companyId || !ownerId}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <Button
            title={saving ? "Saving..." : "Save changes"}
            onPress={onSave}
            disabled={saving || !companyId || !isDirty}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
