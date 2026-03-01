import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 22,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0B2D5B",
  },
  headerButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0B2D5B",
  },
  selectionText: {
    fontSize: 13,
    color: "#3C4A5E",
    marginBottom: 12,
  },
  monthNavRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  monthNavButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EEF3FA",
  },
  monthNavButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B2D5B",
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#10213A",
  },
  weekHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  weekdayLabel: {
    width: "14.2%",
    textAlign: "center",
    fontSize: 12,
    color: "#5A6780",
    fontWeight: "600",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.2%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    // marginBottom: 1,
  },
  dayCellSelected: {
    backgroundColor: "#0B2D5B",
  },
  dayText: {
    fontSize: 13,
    color: "#1A1A1A",
  },
  dayTextSelected: {
    color: "#FFF",
    fontWeight: "700",
  },
  footerRow: {
    // marginTop: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  footerButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "#EEF3FA",
  },
  footerButtonText: {
    color: "#0B2D5B",
    fontWeight: "700",
  },
  applyButton: {
    backgroundColor: "#0B2D5B",
  },
  applyButtonText: {
    color: "#FFF",
  },
});

export default styles;
