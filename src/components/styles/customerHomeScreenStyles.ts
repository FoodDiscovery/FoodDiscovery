import { Platform, StyleSheet } from "react-native";

const NAVY = "#0B2D5B";
const GOLD = "#F5C542";
const BG = "#F3F6FB";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  profileIconBtn: {
    position: "absolute",
    left: 16,
    top: 10,
    zIndex: 1,
  },
  logoRow: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    gap: 6,
  },
  logo: {
    width: 260,
    height: 90,
  },
  subtitle: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "700",
  },

  cartIconBtn: {
    position: "absolute",
    right: 16,
    top: 10,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: GOLD,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: NAVY,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  cartBadgeText: {
    color: GOLD,
    fontSize: 12,
    fontWeight: "700",
  },

  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  searchIconMargin: { marginRight: 10 },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
  },

  controls: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
    alignItems: "center",
  },

  pillSmallNavy: {
    backgroundColor: NAVY,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillSmallNavyText: {
    color: "#FFF",
    fontWeight: "800",
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
    fontWeight: "900",
    fontSize: 14,
  },

  pillGhost: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillGhostText: {
    color: NAVY,
    fontWeight: "800",
    fontSize: 14,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    overflow: "hidden",
  },

  cardImage: {
    width: "100%",
    height: 160,
    backgroundColor: "#EEF2F7",
  },
  imagePlaceholder: {
    width: "100%",
    height: 160,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    color: "#6B7280",
    fontWeight: "800",
  },

  cardBody: {
    padding: 16,
  },

  cardTitle: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0B1220",
    letterSpacing: -0.2,
  },
  cardCuisine: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "900",
    color: NAVY,
  },
  cardDesc: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
    lineHeight: 22,
  },
  cardMeta: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "800",
    color: "#6B7280",
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },

  empty: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: 24, fontWeight: "800", color: "#111827" },
  emptySub: { marginTop: 6, fontSize: 16, color: "#6B7280", textAlign: "center" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 16,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 20, fontWeight: "900" },
  modalClose: { fontSize: 16, fontWeight: "800", color: NAVY },
  modalSectionTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 14,
    color: "#6B7280",
  },

  cuisineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cuisineChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F0F4FB",
  },
  cuisineChipActive: {
    backgroundColor: NAVY,
  },
  cuisineChipText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  cuisineChipTextActive: {
    color: "#FFF",
  },
});

export default styles;
export { NAVY, GOLD, BG };
