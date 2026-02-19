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
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 10,
    alignItems: "center",
    flexWrap: "wrap",
  },
  pillPrimary: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  pillPrimaryText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  pill: {
    backgroundColor: "#EFEFEF",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  pillText: {
    color: "#111",
    fontWeight: "600",
    fontSize: 14,
  },
  pillGhost: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 18,
  },
  pillGhostText: {
    color: "#007AFF",
    fontWeight: "800",
    fontSize: 14,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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

  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#F5F5F5",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E0E0E0",
  },
  imagePlaceholderText: {
    fontSize: 48,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginTop: 12,
    marginHorizontal: 16,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginHorizontal: 16,
    gap: 12,
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  metaText: {
    fontSize: 14,
    color: "#666",
  },
  deliveryFee: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
    marginHorizontal: 16,
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "#F0F0F0",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});

export default styles;
