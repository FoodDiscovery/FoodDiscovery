import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  containerCenter: { justifyContent: "center" },
  orderListScroll: { flex: 1, width: "100%", marginTop: 16 },
  orderListContent: { paddingHorizontal: 16, paddingBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: "#666",
  },
});

export default styles;
