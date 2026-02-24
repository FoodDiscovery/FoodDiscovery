import { Platform, StyleSheet } from "react-native";

const NAVY = "#0B2D5B";
const GOLD = "#F5C542";
const BG = "#F3F6FB";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: Platform.OS === "ios" ? 4 : 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: NAVY,
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 14,
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 10, color: "#6B7280", fontSize: 14 },

  empty: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: NAVY },
  emptySub: { marginTop: 6, fontSize: 14, color: "#6B7280", textAlign: "center" },

  // Order card
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5ECF7",
  },
  customerName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  orderTime: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  statusBadgeConfirmed: {
    backgroundColor: "#DBEAFE",
  },
  statusBadgeReady: {
    backgroundColor: "#D1FAE5",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextConfirmed: {
    color: "#1D4ED8",
  },
  statusTextReady: {
    color: "#047857",
  },

  itemsSection: {
    marginBottom: 12,
  },
  itemsSectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#E5ECF7",
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  totalAmount: {
    fontSize: 17,
    fontWeight: "800",
    color: NAVY,
  },

  actionsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  actionBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnPrimary: {
    backgroundColor: GOLD,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  actionBtnSecondary: {
    backgroundColor: "#E5ECF7",
  },
  actionBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: NAVY,
  },
  actionBtnTextSecondary: {
    color: "#4B5563",
  },
  actionBtnDisabled: {
    opacity: 0.6,
  },

  // Order item row
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 6,
  },
  itemLeft: {
    flex: 1,
    paddingRight: 12,
  },
  itemQtyName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
});

export default styles;
