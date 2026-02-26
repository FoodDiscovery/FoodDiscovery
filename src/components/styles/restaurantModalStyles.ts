import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#D0D0D0",
    borderRadius: 2,
  },
  imageScroll: {
    height: 220,
  },
  imageScrollContent: {
    paddingHorizontal: 0,
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: 220,
    paddingHorizontal: 16,
  },
  menuImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    backgroundColor: "#F5F5F5",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerSection: {
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
    letterSpacing: -0.5,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
  },
  statusOpen: {
    backgroundColor: "#E8F5E9",
  },
  statusClosed: {
    backgroundColor: "#FCE4EC",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotOpen: {
    backgroundColor: "#34A853",
  },
  statusDotClosed: {
    backgroundColor: "#EA4335",
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusTextOpen: {
    color: "#137333",
  },
  statusTextClosed: {
    color: "#C5221F",
  },
  distanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  distanceIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  distance: {
    fontSize: 15,
    color: "#5F6368",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E8EAED",
    marginVertical: 16,
    marginHorizontal: -20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1A1A1A",
    letterSpacing: -0.3,
  },
  sectionText: {
    fontSize: 15,
    color: "#5F6368",
    lineHeight: 22,
    marginLeft: 26,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginLeft: 26,
  },
  tag: {
    backgroundColor: "#F1F3F4",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: "#1A73E8",
    fontWeight: "500",
  },
  comingSoonText: {
    fontSize: 15,
    color: "#9AA0A6",
    fontStyle: "italic",
    marginLeft: 26,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E8EAED",
    gap: 10,
  },
  menuButton: {
    backgroundColor: "#34A853",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#34A853",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  menuButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  closeButton: {
    backgroundColor: "#1A73E8",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#1A73E8",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  loadingContainer: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: "#5F6368",
  },
  noImageContainer: {
    width: SCREEN_WIDTH,
    height: 220,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 16,
  },
  noImageText: {
    color: "#9AA0A6",
    fontSize: 16,
    fontWeight: "500",
  },
  bottomPadding: {
    height: 20,
  },
});

export default styles;
