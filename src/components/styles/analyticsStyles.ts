import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F6FB",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 14,
  },
  filterButton: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#E6EEF9",
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  filterButtonText: {
    fontWeight: "700",
    color: "#0B2D5B",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DFE6F2",
    padding: 12,
  },
  statLabel: {
    fontSize: 12,
    color: "#52617B",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#122849",
  },
  sectionCard: {
    borderRadius: 14,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#DFE6F2",
    padding: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#142845",
    marginBottom: 4,
  },
  helperText: {
    color: "#5C6D89",
  },
  frequencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F2F7",
    paddingTop: 8,
  },
  frequencyName: {
    color: "#1E314F",
  },
  frequencyCount: {
    color: "#1E314F",
    fontWeight: "700",
  },
  orderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F0F2F7",
    paddingTop: 8,
  },
  orderDate: {
    color: "#1E314F",
  },
  orderAmount: {
    color: "#1E314F",
    fontWeight: "700",
  },
});

export default styles;
