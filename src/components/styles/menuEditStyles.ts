import { StyleSheet } from "react-native";

const NAVY = "#0B2D5B";
const BG = "#F3F6FB";
const BORDER = "#E5ECF7";

const styles = StyleSheet.create({
  /* Layout */
  safe: { flex: 1, backgroundColor: BG },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: BG,
  },
  page: {
    padding: 16,
    paddingBottom: 40,
    gap: 14,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
  },
  container: {
    padding: 16,
    paddingBottom: 24,
    gap: 14,
  },

  /* Typography */
  heading: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0B1220",
    letterSpacing: -0.2,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 20,
    fontSize: 14,
    fontWeight: "600",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
    fontWeight: "700",
  },

  /* Primary action button */
  primaryBtn: {
    backgroundColor: NAVY,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 16,
  },

  /* Category card */
  categoryCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  categoryActions: {
    flexDirection: "row",
    gap: 8,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#E5ECF7",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 12,
    color: NAVY,
    fontWeight: "700",
  },
  xBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  xBtnText: {
    fontSize: 14,
    color: "#DC2626",
    fontWeight: "700",
  },
  disabledBtn: {
    opacity: 0.4,
  },

  /* Item row */
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF2F7",
  },
  itemThumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  unavailableTag: {
    fontSize: 12,
    color: "#DC2626",
    fontWeight: "700",
    marginTop: 2,
  },

  addItemBtn: {
    paddingVertical: 12,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  addItemBtnText: {
    color: NAVY,
    fontWeight: "700",
    fontSize: 15,
  },

  /* Back link */
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
  },
  backBtnText: {
    color: NAVY,
    fontSize: 16,
    fontWeight: "800",
  },

  /* Modal shared */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  itemModalOverlay: {
    justifyContent: "flex-start",
    paddingTop: 150,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    gap: 10,
    // move it up 25 px
    marginTop: -50,
    borderWidth: 1,
    borderColor: BORDER,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    flexWrap: "wrap",
    gap: 12,
  },
  modalHeaderBtns: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0B1220",
  },
  modalScrollContent: {
    paddingBottom: 8,
  },
  subtitleWithMargin: { marginBottom: 12 },
  noPhotoText: { color: "#6B7280", fontWeight: "600" },
  saveBtnSpacing: { marginTop: 16 },
  cancelBtnSpacing: { marginTop: 10 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: "#E5ECF7",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#4B5563",
  },
  saveBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    backgroundColor: NAVY,
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },

  /* Photo modal */
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "#EEF2F7",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 16,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
});

export default styles;
