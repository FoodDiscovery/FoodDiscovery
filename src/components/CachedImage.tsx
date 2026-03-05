import React from "react";
import { Image } from "expo-image";
import type { StyleProp, ImageStyle } from "react-native";

interface Props {
  uri?: string | null;
  style?: StyleProp<ImageStyle>;
  contentFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  testID?: string;
}

export default function CachedImage({ uri, style, contentFit = "cover", testID }: Props) {
  if (!uri) return null;

  return (
    <Image
      source={uri}
      style={style}
      contentFit={contentFit}
      cachePolicy="memory-disk"
      transition={200}
      testID={testID}
    />
  );
}
