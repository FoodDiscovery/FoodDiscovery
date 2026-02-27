import { StyleSheet } from "react-native";

const NAVY = "#0B2D5B";
const BG = "#F3F6FB";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 24,
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: NAVY,
  },
  filterButton: {
    marginTop: 14,
    marginBottom: 6,
    borderRadius: 20,
    backgroundColor: "#E8EEF8",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterButtonText: {
    color: NAVY,
    fontWeight: "700",
  },
});

export default styles;
export { NAVY };
