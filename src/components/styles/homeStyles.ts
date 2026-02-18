import { Platform, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFF" },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  title: {
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: -0.5,
    color: "#000",
  },
  subtitle: {
    marginTop: 2,
    color: "#666",
    fontSize: 14,
  },

  profileBtn: {
    backgroundColor: "#EAF2FF",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignSelf: "flex-start",
  },
  profileBtnText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "700",
  },

  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
  },
  search: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 14 : 12,
    fontSize: 16,
    color: "#111",
  },

  controls: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
    alignItems: "center",
  },
  pillPrimary: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  pillPrimaryText: {
    color: "#FFF",
    fontWeight: "800",
    fontSize: 16,
  },
  pill: {
    backgroundColor: "#EFEFEF",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  pillText: {
    color: "#111",
    fontWeight: "800",
    fontSize: 16,
  },
  pillGhost: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 999,
  },
  pillGhostText: {
    color: "#007AFF",
    fontWeight: "800",
    fontSize: 16,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#F4F4F4",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 34,
    fontWeight: "900",
    color: "#000",
    letterSpacing: -0.2,
  },
  cardCuisine: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "800",
    color: "#007AFF",
  },
  cardDesc: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: "700",
    color: "#5A5A5A",
    lineHeight: 28,
  },
  cardMeta: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#5A5A5A",
  },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: { marginTop: 10, color: "#666" },

  empty: {
    marginTop: 40,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: { fontSize: 24, fontWeight: "800", color: "#111" },
  emptySub: { marginTop: 6, fontSize: 16, color: "#666", textAlign: "center" },

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
  modalClose: { fontSize: 16, fontWeight: "800", color: "#007AFF" },
  modalSectionTitle: { marginTop: 8, marginBottom: 8, fontSize: 14, color: "#666" },
  emptyCuisineText: { color: "#666" },

  cuisineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  cuisineChip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#EFEFEF",
  },
  cuisineChipActive: {
    backgroundColor: "#007AFF",
  },
  cuisineChipText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111",
  },
  cuisineChipTextActive: {
    color: "#FFF",
  },

  pressedOpacity70: { opacity: 0.7 },
  pressedOpacity80: { opacity: 0.8 },
  pressedOpacity85: { opacity: 0.85 },
});

export default styles;
