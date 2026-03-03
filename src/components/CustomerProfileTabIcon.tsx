import { Image } from "react-native";
import { getAvatarStyle } from "./styles";
import FontAwesome from "@react-native-vector-icons/fontawesome";
import { useAuth } from "../Providers/AuthProvider";
import { useStoredAvatarUrl } from "../lib/useStoredAvatarUrl";

interface CustomerProfileTabIconProps {
  color: string;
  size: number;
}

export default function CustomerProfileTabIcon({
  color,
  size,
}: CustomerProfileTabIconProps) {
  const { session } = useAuth();
  const userId = session?.user?.id ?? null;
  const { avatarUri } = useStoredAvatarUrl(userId);

  if (avatarUri)
    return (
      <Image
        source={{ uri: avatarUri }}
        style={getAvatarStyle(size)}
        resizeMode="cover"
      />
    );

  return <FontAwesome name="user" color={color} size={size} />;
}
