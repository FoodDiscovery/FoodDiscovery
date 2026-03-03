import { StyleSheet } from "react-native";

const NAVY = "#0B2D5B";
const BG = "#F3F6FB";
const BORDER = "#E5ECF7";
const MUTED = "#6B7280";
const TEXT_PRIMARY = "#111827";
const TEXT_DARK = "#0B1220";

const styles = StyleSheet.create({
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: BG,
  },
  keyboardView: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollView: {
    flex: 1,
    backgroundColor: BG,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    backgroundColor: BG,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 24,
  },
  signUpContainer: {
    paddingBottom: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: -18,
    marginBottom: -34,
  },
  logo: {
    width: 1536 / 4.5,
    height: 1024 / 4.5,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 15,
    color: MUTED,
    textAlign: "center",
    marginBottom: 16,
    fontWeight: "600",
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 14,
  },
  linkText: {
    color: NAVY,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
  },
  linkWrap: {
    marginTop: 14,
    alignItems: "center",
  },
  roleToggleContainer: {
    marginBottom: 12,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    color: TEXT_PRIMARY,
  },
  toggleRow: {
    flexDirection: "row",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: "#FFFFFF",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: "#EEF2F7",
  },
  toggleButtonActive: {
    backgroundColor: NAVY,
  },
  toggleButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: MUTED,
  },
  toggleButtonTextActive: {
    color: "#FFFFFF",
  },
  businessSection: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 6,
    color: TEXT_DARK,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: MUTED,
    marginBottom: 18,
    fontWeight: "600",
  },
  imageSection: {
    marginTop: 12,
    paddingHorizontal: 0,
  },
  imageLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 10,
  },
  pickImageButton: {
    borderWidth: 2,
    borderColor: BORDER,
    borderStyle: "dashed",
    borderRadius: 16,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  pickImageText: {
    color: NAVY,
    fontSize: 15,
    fontWeight: "700",
  },
  imagePreviewContainer: {
    alignItems: "center",
    gap: 12,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  changeImageButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "#EEF2F7",
    borderRadius: 12,
  },
  changeImageText: {
    color: NAVY,
    fontSize: 14,
    fontWeight: "600",
  },
  previewAlbumSection: {
    marginTop: 20,
    paddingHorizontal: 0,
  },
  previewAlbumHint: {
    fontSize: 13,
    color: MUTED,
    marginBottom: 12,
    fontWeight: "600",
  },
  previewAddButton: {
    backgroundColor: NAVY,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  previewAddButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  previewTile: {
    alignItems: "center",
    gap: 6,
  },
  previewThumb: {
    width: 92,
    height: 92,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  previewRemoveButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: "#EEF2F7",
  },
  previewRemoveText: {
    color: NAVY,
    fontSize: 12,
    fontWeight: "600",
  },
  previewEmptyText: {
    color: MUTED,
    fontSize: 13,
    fontWeight: "600",
  },
  // RNE Input/Button overrides - use as style objects
  inputContainer: {
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  inputLabel: {
    color: TEXT_PRIMARY,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: TEXT_PRIMARY,
  },
  multilineInput: {
    minHeight: 90,
    paddingVertical: 12,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    backgroundColor: NAVY,
  },
  buttonTitle: {
    fontWeight: "800",
    fontSize: 16,
  },
});

export default styles;
export { NAVY, BG, BORDER, MUTED };
