import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  dayCard: {
    borderWidth: 1,
    borderColor: "#e4e4e7",
    borderRadius: 10,
    padding: 10,
    backgroundColor: "#fff",
    gap: 8,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  closedToggle: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  closedToggleActive: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  closedToggleText: {
    fontSize: 13,
    color: "#1f2937",
    fontWeight: "500",
  },
  closedToggleTextActive: {
    color: "#b91c1c",
  },
  timeRows: {
    gap: 8,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  timeLabel: {
    width: 44,
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "600",
  },
  timeInput: {
    width: 44,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: "center",
    fontSize: 14,
  },
  timeColon: {
    fontSize: 16,
    color: "#374151",
    marginHorizontal: -2,
  },
  periodWrap: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
    marginLeft: 2,
  },
  periodButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#fff",
  },
  periodButtonActive: {
    backgroundColor: "#1d4ed8",
  },
  periodButtonText: {
    fontSize: 12,
    color: "#1f2937",
    fontWeight: "600",
  },
  periodButtonTextActive: {
    color: "#fff",
  },
});

export default styles;
