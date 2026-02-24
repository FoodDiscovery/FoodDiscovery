import { StyleSheet } from "react-native";

export const NAVY = "#0B2D5B";
const BG = "#F3F6FB";

export default StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  mutedText: { marginTop: 10, color: "#6B7280", fontWeight: "700" },

  topRow: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  headerProfileIcon: {
    position: "absolute",
    left: 16,
    top: 10,
    zIndex: 1,
  },
  headerBackBtn: {
    position: "absolute",
    right: 16,
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
  topLogoWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  topLogo: { width: 170, height: 44 },

  page: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  heading: {
    fontSize: 34,
    fontWeight: "900",
    color: "#0B1220",
    letterSpacing: -0.2,
  },

  subtitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "700",
    color: "#6B7280",
    lineHeight: 22,
  },

  cuisineTag: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: NAVY,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  cuisineTagText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 13,
  },

  sectionWrap: {
    marginBottom: 14,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5ECF7",
  },
  emptyTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  emptySub: { marginTop: 6, fontSize: 14, color: "#6B7280", fontWeight: "700" },

  ownerTitle: { fontSize: 22, fontWeight: "900", color: "#111827" },
  ownerSub: { marginTop: 8, textAlign: "center", color: "#6B7280", fontWeight: "700" },

  pillSmallNavy: {
    backgroundColor: NAVY,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  pillSmallNavyText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 14,
  },
});
