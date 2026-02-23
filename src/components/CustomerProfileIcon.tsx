import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decode } from "base64-arraybuffer";
import { File } from "expo-file-system/next";
import { supabase } from "../lib/supabase";
import { AVATAR_BUCKET, getAvatarStorageKey } from "../lib/avatarStorage";
import { useStoredAvatarUrl } from "../lib/useStoredAvatarUrl";
import { customerProfileIconStyles as styles } from "./styles";

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
  const { avatarUri, loading, reload } = useStoredAvatarUrl(userId);
  const [uploading, setUploading] = useState(false);

  const pickAndUploadImage = async () => {
    if (!userId) {
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please allow photo library access to choose a profile image."
      );
      return;
    }

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

    // upload image to supabase
    try {
      // convert image to base64
      const file = new File(asset.uri);
      const base64 = await file.base64();
      const arrayBuffer = decode(base64);

      // get file extension and content type
      const fileExt = asset.uri.toLowerCase().includes(".png") ? "png" : "jpg";
      const contentType = fileExt === "png" ? "image/png" : "image/jpeg";
      const path = `${userId}/avatar.${fileExt}`;

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

      const { data } = supabase.storage
        .from(AVATAR_BUCKET)
        .getPublicUrl(path);

      const publicUrl = data?.publicUrl
        ? `${data.publicUrl}?t=${Date.now()}`
        : null;

      if (publicUrl) {
        // cache public url in AsyncStorage
        const storageKey = getAvatarStorageKey(userId);
        await AsyncStorage.setItem(storageKey, publicUrl);
        await reload();
        onImageChange?.(publicUrl);
      }
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "Failed to set profile image."
      );
    } finally {
      setUploading(false);
    }
  };

  // show loading indicator while loading
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
      ) : avatarUri ? (
        <Image
          testID="customer-profile-icon-image"
          source={{ uri: avatarUri }}
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
