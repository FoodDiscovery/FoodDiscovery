import { StyleSheet } from "react-native";

/**
 * Shared style constants used across multiple components.
 * Use these instead of inline style objects.
 */
const sharedStyles = StyleSheet.create({
  /* Spacers */
  spacerHeight10: { height: 10 },
  spacerWidth40: { width: 40 },

  /* Layout */
  flex1: { flex: 1 },
  flex1Center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  /* Typography */
  loadingText: { marginTop: 10, color: "#6B7280" },
  mutedText: { color: "#6B7280" },
  emptyCuisineText: { color: "#6B7280" },
  noPhotoText: { color: "#999" },
  emojiIcon: { fontSize: 18 },

  /* Pressed states */
  pressedOpacity85: { opacity: 0.85 },
  pressedOpacity80: { opacity: 0.8 },
  pressedOpacity75: { opacity: 0.75 },
  pressedOpacity92: { opacity: 0.92 },
  pressedOpacity70: { opacity: 0.7 },
});

/** Returns avatar style for dynamic size (e.g. tab bar icon) */
export const getAvatarStyle = (size: number) => ({
  width: size,
  height: size,
  borderRadius: size / 2,
});

export default sharedStyles;
