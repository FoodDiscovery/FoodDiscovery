import React from "react";
import { Image, Text, View } from "react-native";
import { homeStyles as styles } from "../styles";

interface RestaurantImageProps {
  imageUrl: string | null;
}

export default function RestaurantImage({ imageUrl }: RestaurantImageProps) {
  return (
    <View style={styles.imageContainer}>
      {imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      ) : (
        <View style={styles.imagePlaceholder}>
          {/* can replace with logo */}
          <Text style={styles.imagePlaceholderText}>📷</Text>
        </View>
      )}
    </View>
  );
}

