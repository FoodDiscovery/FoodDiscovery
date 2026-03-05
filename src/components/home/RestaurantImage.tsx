import { Text, View } from "react-native";
import CachedImage from "../CachedImage";
import { homeStyles as styles } from "../styles";

interface RestaurantImageProps {
  imageUrl: string | null;
}

export default function RestaurantImage({ imageUrl }: RestaurantImageProps) {
  return (
    <View style={styles.imageContainer}>
      {imageUrl ? (
        <CachedImage uri={imageUrl} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          {/* can replace with logo */}
          <Text style={styles.imagePlaceholderText}>📷</Text>
        </View>
      )}
    </View>
  );
}

