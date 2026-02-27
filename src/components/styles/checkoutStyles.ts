import { Platform, StyleSheet } from "react-native";

export const NAVY = "#0B2D5B";
const GOLD = "#F5C542";
const BG = "#F3F6FB";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
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
  headerLogo: {
    width: 210,
    height: 56,
    marginBottom: 2,
  },

  title: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: "700",
    color: "#0B1220",
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },

  page: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 6 : 10,
    gap: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B1220",
  },
  cardMeta: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },

  lineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  lineLeft: {
    flex: 1,
    paddingRight: 10,
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  lineRight: {
    fontSize: 15,
    fontWeight: "600",
    color: NAVY,
  },

  summaryRow: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    paddingVertical: 4,
  },
  summaryTotal: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: "700",
    color: NAVY,
  },

  errorText: { fontSize: 14, fontWeight: "600", color: "#B42318" },
  errorCardBorder: { borderColor: "#B42318" },
  loadingOpacity: { opacity: 0.7 },

  payBtn: {
    backgroundColor: GOLD,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  payBtnText: {
    color: NAVY,
    fontWeight: "700",
    fontSize: 16,
  },

  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    alignItems: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  emptySub: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
    textAlign: "center",
  },
});

export default styles;
