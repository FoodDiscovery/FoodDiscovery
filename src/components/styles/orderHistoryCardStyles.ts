import { StyleSheet } from "react-native";

const NAVY = "#0B2D5B";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 8,
    paddingBottom: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderId: {
    flex: 1,
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  statusWrap: {},
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusBadgeConfirmed: { backgroundColor: "#DBEAFE" },
  statusBadgeReady: { backgroundColor: "#D1FAE5" },
  statusBadgeCompleted: { backgroundColor: "#E5E7EB" },
  statusBadgeDefault: { backgroundColor: "#F3F4F6" },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextConfirmed: { color: "#1D4ED8" },
  statusTextReady: { color: "#047857" },
  statusTextCompleted: { color: "#374151" },
  statusTextDefault: { color: "#6B7280" },
  date: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    marginTop: 2,
  },
  itemCount: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  price: {
    fontSize: 14,
    fontWeight: "700",
    color: NAVY,
  },
});

export default styles;
