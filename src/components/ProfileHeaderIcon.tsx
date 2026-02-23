import { useCallback } from "react";
import { Image, Pressable, View } from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import FontAwesome from "@react-native-vector-icons/fontawesome";

import { useAuth } from "../Providers/AuthProvider";
import { useStoredAvatarUrl } from "../lib/useStoredAvatarUrl";
import {
  profileHeaderIconStyles as styles,
  PROFILE_HEADER_ICON_COLOR,
} from "./styles";

// use only for small icons on top left of screens
export default function ProfileHeaderIcon() {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const { avatarUri, reload } = useStoredAvatarUrl(userId);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  return (
    <Pressable
      testID="profile-header-icon"
      onPress={() => router.push("/(home)/profile")}
      style={({ pressed }) => [styles.icon, pressed && { opacity: 0.8 }]}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Go to profile"
    >
      {avatarUri ? (
        <Image
          testID="profile-header-icon-image"
          source={{ uri: avatarUri }}
          style={styles.avatarImage}
          resizeMode="cover"
        />
      ) : (
        <View testID="profile-header-icon-placeholder" style={styles.placeholder}>
          <FontAwesome name="user" size={20} color={PROFILE_HEADER_ICON_COLOR} />
        </View>
      )}
    </Pressable>
  );
}
