import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    marginTop: 40,
    padding: 12,
  },
  signUpContainer: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: "stretch",
  },
  mt20: {
    marginTop: 20,
  },
  linkText: {
    color: "#007AFF",
    textAlign: "center",
    textDecorationLine: "underline",
  },
  roleToggleContainer: {
    marginBottom: 10,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    textAlign: "center",
  },
  toggleRow: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  toggleButtonActive: {
    backgroundColor: "#007AFF",
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  toggleButtonTextActive: {
    color: "#fff",
  },
  businessSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  imageSection: {
    marginTop: 8,
    paddingHorizontal: 10,
  },
  imageLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#86939e",
    marginBottom: 10,
  },
  pickImageButton: {
    borderWidth: 2,
    borderColor: "#007AFF",
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
  },
  pickImageText: {
    color: "#007AFF",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreviewContainer: {
    alignItems: "center",
    gap: 12,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  changeImageButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  changeImageText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default styles;
