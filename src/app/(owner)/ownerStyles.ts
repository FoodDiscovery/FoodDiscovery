import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  keyboardFlex: { flex: 1 },
  loadingText: { marginTop: 10, opacity: 0.7 },

  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topTitle: { fontSize: 18, fontWeight: "700" },

  container: { padding: 16, gap: 14, paddingBottom: 40 },
  fieldContainer: { gap: 6 },

  label: { fontSize: 14, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  multilineInput: { minHeight: 90, paddingVertical: 12 },

  statsCard: {
    borderWidth: 1,
    borderColor: "#EEE",
    backgroundColor: "#FAFAFA",
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  statsTitle: { fontSize: 16, fontWeight: "700" },
  statsLine: { fontSize: 14, opacity: 0.85 },
  statsValue: { fontWeight: "700" },
  statsHint: { fontSize: 12, opacity: 0.6, marginTop: 4 },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImg: { width: 64, height: 64, borderRadius: 12, backgroundColor: "#EEE" },
  logoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  noLogoText: { opacity: 0.6 },
  logoMetaWrap: { flex: 1, gap: 8 },
  logoLabel: { fontSize: 14, fontWeight: "600" },
  logoHint: { opacity: 0.7, fontSize: 12 },

  saveWrap: { marginTop: 10 },
  editDetailsWrap: { marginTop: 12 },

  footnote: {
    marginTop: 10,
    fontSize: 12,
    opacity: 0.55,
    lineHeight: 16,
  },

  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default styles;
