import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "base64-arraybuffer";
import { File } from "expo-file-system/next";
import { supabase } from "../lib/supabase";
 
// customer avatar stored in Supabase Storage and cached locally.
const AVATAR_STORAGE_KEY_PREFIX = "avatar_url:";
const AVATAR_BUCKET = "avatars";

interface CustomerProfileIconProps {
  userId: string;
  size?: number;
  onImageChange?: (uri: string | null) => void;
}

export default function CustomerProfileIcon({
  userId,
  size = 96,
  onImageChange,
}: CustomerProfileIconProps) {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const storageKey = `${AVATAR_STORAGE_KEY_PREFIX}${userId}`;

  const loadStoredAvatar = useCallback(async () => {
    if (!userId) return;
    try {
      const stored = await AsyncStorage.getItem(storageKey);
      if (stored) setImageUri(stored);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [userId, storageKey]);

  useEffect(() => {
    // load saved avatar URL
    loadStoredAvatar();
  }, [loadStoredAvatar]);

  const pickAndUploadImage = async () => {
    
    if (!userId) {
      return;
    }

    // ask for permission to read from the user's photo library
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to choose a profile image."
      );
      return;
    }

    // let user crop images
    const result = await ImagePicker.launchImageLibraryAsync({
      quality: 0.9,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) {
      return;
    }

    const asset = result.assets[0];

    if (!asset?.uri) {
      return;
    }

    setUploading(true);
    try {
      // read image into array so supabase can accept into storage
      const file = new File(asset.uri);
      const base64 = await file.base64();
      const arrayBuffer = decode(base64);

      const fileExt = asset.uri.toLowerCase().includes(".png") ? "png" : "jpg";
      const contentType = fileExt === "png" ? "image/png" : "image/jpeg";
      // one avatar per user stored
      const path = `${userId}/avatar.${fileExt}`;

      // upload to supabase
      const { error: uploadErr } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, arrayBuffer, {
          contentType,
          upsert: true,
        });

      if (uploadErr) {
        Alert.alert("Upload failed", uploadErr.message);
        return;
      }

      // get public url to display in image
      const { data } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(path);
      const publicUrl = data?.publicUrl ?? null;
      
      if (publicUrl) {
        await AsyncStorage.setItem(storageKey, publicUrl);
        setImageUri(publicUrl);
        onImageChange?.(publicUrl);
      }
    } catch (e) {
      Alert.alert( "Error", e instanceof Error ? e.message : "Failed to set profile image.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <View
        testID="customer-profile-icon-loading"
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <ActivityIndicator size="small" />
      </View>
    );
  }

  return (
    <TouchableOpacity
      testID="customer-profile-icon"
      onPress={pickAndUploadImage}
      disabled={uploading}
      activeOpacity={0.8}
      style={[styles.ring, { width: size, height: size, borderRadius: size / 2 }]}
    >
      {uploading ? (
        <View
          testID="customer-profile-icon-uploading"
          style={[styles.inner, { width: size, height: size, borderRadius: size / 2 }]}
        >
          <ActivityIndicator size="small" />
        </View>
      ) : imageUri ? (
        <Image
          testID="customer-profile-icon-image"
          source={{ uri: imageUri }}
          style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
          resizeMode="cover"
        />
      ) : (
        <View
          testID="customer-profile-icon-placeholder"
          style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}
        >
          <Text style={[styles.placeholderText, { fontSize: size * 0.45 }]}>👤</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  ring: {
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  inner: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e8e8e8",
  },
  avatar: {
    backgroundColor: "#eee",
  },
  placeholder: {
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {},
});
