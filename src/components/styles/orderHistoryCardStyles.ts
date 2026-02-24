import { StyleSheet } from "react-native";

const NAVY = "#0B2D5B";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderId: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#0B1220",
  },
  statusWrap: {},
  statusText: {
    fontSize: 15,
    fontWeight: "600",
  },
  statusTextConfirmed: { color: "#2563EB" },
  statusTextReady: { color: "#16A34A" },
  statusTextCompleted: { color: "#DC2626" },
  statusTextDefault: { color: "#6B7280" },
  date: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  itemCount: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: NAVY,
  },
});

export default styles;
