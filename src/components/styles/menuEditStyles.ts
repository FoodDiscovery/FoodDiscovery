import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  /* Layout */
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  page: {
    padding: 16,
    paddingBottom: 40,
    paddingTop: 50,
    gap: 14,
  },

  /* Typography */
  heading: {
    fontSize: 22,
    fontWeight: "700",
  },
  subtitle: {
    opacity: 0.6,
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.5,
    marginTop: 20,
    fontSize: 14,
  },

  /* Primary action button */
  primaryBtn: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },

  /* Category card */
  categoryCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    backgroundColor: "#fafafa",
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryName: {
    fontSize: 17,
    fontWeight: "600",
  },
  categoryActions: {
    flexDirection: "row",
    gap: 6,
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#e8e8e8",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    fontSize: 14,
  },
  xBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#ffe0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  xBtnText: {
    fontSize: 14,
    color: "#cc0000",
    fontWeight: "700",
  },
  disabledBtn: {
    opacity: 0.35,
  },

  /* Item row */
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  itemThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  itemThumbPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "500",
  },
  itemPrice: {
    fontSize: 13,
    color: "#555",
  },
  unavailableTag: {
    fontSize: 11,
    color: "#cc0000",
    fontWeight: "600",
    marginTop: 2,
  },

  addItemBtn: {
    paddingVertical: 8,
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  addItemBtnText: {
    color: "#007AFF",
    fontWeight: "600",
    fontSize: 14,
  },

  /* Back link */
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
  },
  backBtnText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },

  /* Modal shared */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitleWithMargin: { marginBottom: 12 },
  noPhotoText: { color: "#999" },
  saveBtnSpacing: { marginTop: 16 },
  cancelBtnSpacing: { marginTop: 10 },
  loadingText: { marginTop: 10 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
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
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#e8e8e8",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
  saveBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: "#007AFF",
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

  /* Photo modal */
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#eee",
    resizeMode: "cover",
  },
  photoPlaceholder: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default styles;
