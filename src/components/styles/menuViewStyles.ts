import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  page: {
    padding: 16,
    paddingBottom: 110,
    paddingTop: 42,
    gap: 12,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111",
  },
  subtitle: {
    opacity: 0.7,
    fontSize: 14,
    color: "#222",
  },
  cuisineTag: {
    alignSelf: "flex-start",
    backgroundColor: "#EAF2FF",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cuisineTagText: {
    color: "#007AFF",
    fontSize: 13,
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.55,
    marginTop: 20,
    fontSize: 14,
  },
  categoryCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    backgroundColor: "#fff",
  },
  categoryName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#ddd",
  },
  itemThumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: "#eee",
  },
  itemThumbPlaceholder: {
    width: 56,
    height: 56,
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
    fontWeight: "600",
    color: "#111",
  },
  itemDesc: {
    marginTop: 2,
    fontSize: 12,
    color: "#666",
  },
  itemPrice: {
    marginTop: 4,
    fontSize: 14,
    color: "#333",
    fontWeight: "600",
  },
  unavailableTag: {
    marginTop: 4,
    fontSize: 11,
    color: "#cc0000",
    fontWeight: "700",
  },
  addBtn: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnDisabled: {
    backgroundColor: "#C7D8F8",
  },
  addBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  quantityBtnOutlined: {
    backgroundColor: "transparent",
    borderColor: "#007AFF",
  },
  quantityBtnGray: {
    backgroundColor: "#E5E5E5",
    borderColor: "#E5E5E5",
  },
  quantityBtnText: {
    color: "#007AFF",
    fontSize: 18,
    fontWeight: "700",
  },
  quantityBtnTextGray: {
    color: "#666",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
    minWidth: 20,
    textAlign: "center",
  },
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
  cartBar: {
    position: "absolute",
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: "#111",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartBarText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  cartBarBtn: {
    backgroundColor: "#34A853",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  cartBarBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
});

export default styles;
