import { Platform, StyleSheet } from "react-native";

const NAVY = "#0B2D5B";
const GOLD = "#F5C542";
const BG = "#F3F6FB";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  headerProfileIcon: {
    position: "absolute",
    left: 16,
    top: 10,
    zIndex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0B1220",
    letterSpacing: -0.2,
  },
  headerBackBtn: {
    position: "absolute",
    right: 16,
    left: undefined,
    top: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5ECF7",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  headerBackText: {
    fontSize: 18,
    fontWeight: "600",
    color: NAVY,
  },

  page: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 12,
  },

  empty: {
    marginTop: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  emptySub: {
    marginTop: 6,
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    fontWeight: "600",
  },
  browseBtnMargin: { marginTop: 14 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
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

  rowTop: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },

  thumb: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#EEF2F7",
  },
  thumbPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
  },

  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#0B1220",
    letterSpacing: -0.1,
  },
  itemMeta: {
    marginTop: 2,
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
  },
  itemPrice: {
    marginTop: 6,
    fontSize: 14,
    color: NAVY,
    fontWeight: "600",
  },

  rowBottom: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: "700",
    color: NAVY,
    marginTop: Platform.OS === "ios" ? -1 : 0,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },

  removeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#B42318",
  },
  removeBtnText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 12,
  },

  summaryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    marginTop: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  summaryLabel: {
    fontSize: 15,
    color: "#6B7280",
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "600",
  },

  checkoutBtn: {
    backgroundColor: NAVY,
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  checkoutBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
  },

  clearBtn: {
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  clearBtnText: {
    color: NAVY,
    fontWeight: "600",
    fontSize: 14,
  },

  pillSmallGold: {
    backgroundColor: GOLD,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillSmallGoldText: {
    color: NAVY,
    fontWeight: "600",
    fontSize: 14,
  },
});

export default styles;
