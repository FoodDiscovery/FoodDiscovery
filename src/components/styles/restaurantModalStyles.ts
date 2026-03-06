import { Dimensions, StyleSheet } from "react-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const NAVY = "#0B2D5B";
const GOLD = "#F5C542";
const BG = "#F3F6FB";
const CARD_BORDER = "#E5ECF7";
const MUTED = "#6B7280";

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContainer: {
    backgroundColor: BG,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 12,
  },
  handleContainer: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
  },
  imageScroll: {
    height: 214,
  },
  imageScrollContent: {
    paddingHorizontal: 0,
  },
  imageWrapper: {
    width: SCREEN_WIDTH,
    height: 214,
    paddingHorizontal: 16,
  },
  menuImage: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    backgroundColor: "#EEF2F7",
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  headerSection: {
    marginBottom: 6,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  name: {
    fontSize: 30,
    fontWeight: "900",
    color: "#0B1220",
    letterSpacing: -0.3,
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusOpen: {
    backgroundColor: "#EAF8EE",
    borderColor: "#A7E0B6",
  },
  statusClosed: {
    backgroundColor: "#FDEBEC",
    borderColor: "#F4C2C5",
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
    fontSize: 12,
    fontWeight: "700",
  },
  statusTextOpen: {
    color: "#137333",
  },
  statusTextClosed: {
    color: "#C5221F",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  metaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0F4FB",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metaChipText: {
    color: NAVY,
    fontSize: 13,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: CARD_BORDER,
    marginVertical: 14,
    marginHorizontal: 0,
  },
  section: {
    marginBottom: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: CARD_BORDER,
    padding: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#111827",
  },
  sectionBody: {
    marginLeft: 26,
  },
  sectionBodyText: {
    fontSize: 15,
    color: MUTED,
    lineHeight: 22,
    fontWeight: "600",
  },
  ratingRow: {
    marginLeft: 26,
    marginBottom: 8,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
    backgroundColor: BG,
    borderTopWidth: 1,
    borderTopColor: CARD_BORDER,
    gap: 10,
  },
  menuButton: {
    backgroundColor: NAVY,
    paddingVertical: 13,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  menuButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  closeButton: {
    backgroundColor: GOLD,
    paddingVertical: 13,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    borderWidth: 1,
    borderColor: "#E9B12A",
  },
  closeButtonText: {
    color: NAVY,
    fontSize: 16,
    fontWeight: "700",
  },
  loadingContainer: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
    color: MUTED,
    fontWeight: "600",
  },
  noImageContainer: {
    width: SCREEN_WIDTH,
    height: 214,
    backgroundColor: "#EEF2F7",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 18,
  },
  noImageText: {
    color: MUTED,
    fontSize: 15,
    fontWeight: "700",
  },
  bottomPadding: {
    height: 10,
  },
});

export default styles;
