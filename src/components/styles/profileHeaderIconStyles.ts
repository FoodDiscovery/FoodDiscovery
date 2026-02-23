import { StyleSheet } from "react-native";

export const PROFILE_HEADER_ICON_SIZE = 40;
export const PROFILE_HEADER_ICON_COLOR = "#0B2D5B";

const styles = StyleSheet.create({
  icon: {
    width: PROFILE_HEADER_ICON_SIZE,
    height: PROFILE_HEADER_ICON_SIZE,
    borderRadius: PROFILE_HEADER_ICON_SIZE / 2,
    backgroundColor: "#F5C542",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  avatarImage: {
    width: PROFILE_HEADER_ICON_SIZE,
    height: PROFILE_HEADER_ICON_SIZE,
    borderRadius: PROFILE_HEADER_ICON_SIZE / 2,
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
