import { Platform, StyleSheet } from "react-native";

export const NAVY = "#0B2D5B";
const BG = "#F3F6FB";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingBottom: 10,
  },

  backBtn: {
    padding: 8,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B1220",
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

  goBackBtn: {
    marginTop: 12,
  },
  goBackText: {
    color: NAVY,
    fontWeight: "600",
  },

  /* Review modal styles */
  reviewButton: {
    alignSelf: "flex-end",
    backgroundColor: NAVY,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  reviewButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    gap: 12,
    marginTop: -50,
    borderWidth: 1,
    borderColor: "#E5ECF7",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0B1220",
  },
  reviewInput: {
    minHeight: 96,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#111827",
    fontWeight: "800",
  },
  submitButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: NAVY,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});

export default styles;
