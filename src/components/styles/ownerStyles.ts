import { StyleSheet } from "react-native";

const NAVY = "#0B2D5B";
const BG = "#F3F6FB";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  keyboardFlex: { flex: 1 },
  loadingText: { marginTop: 10, color: "#6B7280", fontWeight: "700" },

  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  topTitle: { fontSize: 26, fontWeight: "900", color: "#0B1220", letterSpacing: -0.2 },

  container: { padding: 16, gap: 14, paddingBottom: 24 },
  fieldContainer: { gap: 6 },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },

  label: { fontSize: 14, fontWeight: "800", color: "#111827" },
  input: {
    borderWidth: 1,
    borderColor: "#E5ECF7",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  multilineInput: { minHeight: 90, paddingVertical: 12 },

  statsCard: {
    borderWidth: 1,
    borderColor: "#E5ECF7",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  statsTitle: { fontSize: 18, fontWeight: "900", color: "#0B1220" },
  statsLine: { fontSize: 16, fontWeight: "700", color: "#6B7280" },
  statsValue: { fontWeight: "900", color: NAVY },
  statsHint: { fontSize: 13, color: "#6B7280", marginTop: 4, fontWeight: "600" },

  logoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E5ECF7",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
    alignItems: "center",
    gap: 12,
    marginBottom: 0,
  },
  logoRow: {
    alignItems: "center",
    gap: 12,
  },
  logoImg: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: "#EEF2F7",
    overflow: "hidden",
  },
  logoPlaceholder: {
    width: 200,
    height: 200,
    borderRadius: 16,
    backgroundColor: "#EEF2F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5ECF7",
  },
  noLogoText: { color: "#6B7280", fontSize: 16, fontWeight: "700" },
  logoMetaWrap: { alignItems: "center", gap: 4 },
  logoLabel: { fontSize: 16, fontWeight: "800", color: "#0B1220" },
  logoHint: { color: "#6B7280", fontSize: 14, textAlign: "center", fontWeight: "600" },

  saveBtn: {
    backgroundColor: NAVY,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 4,
  },
  saveBtnDisabled: { backgroundColor: "#9CA3AF", opacity: 0.8 },
  saveBtnText: { color: "#FFF", fontWeight: "800", fontSize: 16 },
  signOutBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5ECF7",
    backgroundColor: "#FFFFFF",
  },
  signOutBtnText: { color: NAVY, fontWeight: "800", fontSize: 16 },
  saveWrap: { marginTop: 4 },
  signOutWrap: {
    marginTop: 12,
    marginBottom: 8,
  },

  footnote: {
    marginTop: 10,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
    fontWeight: "600",
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: NAVY,
    fontSize: 16,
    fontWeight: "800",
  },
});

export default styles;
