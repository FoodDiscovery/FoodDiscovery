import { Platform, StyleSheet } from "react-native";

const OWNER_NAVY = "#0B2D5B";

/**
 * Shared style constants used across multiple components.
 * Use these instead of inline style objects.
 */
const sharedStyles = StyleSheet.create({
  /* Owner page header - unified title/subtitle format for (owner) screens */
  ownerPageHeader: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === "ios" ? 4 : 8,
  },
  ownerPageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: OWNER_NAVY,
    letterSpacing: -0.5,
  },
  ownerPageSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

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
