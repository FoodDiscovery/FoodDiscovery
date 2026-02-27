import { StyleSheet } from "react-native";

export const ratingStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    color: "#f5a623",
    marginRight: 2,
  },
  label: {
    marginLeft: 6,
    color: "#555",
  },
});

export const ratingSizeStyles = {
  sm: {
    star: { fontSize: 12 },
    label: { fontSize: 11 },
  },
  md: {
    star: { fontSize: 16 },
    label: { fontSize: 13 },
  },
  lg: {
    star: { fontSize: 22 },
    label: { fontSize: 16 },
  },
} as const;

