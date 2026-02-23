import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  avatarHint: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    textAlign: "center",
  },
  nameText: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  nameHint: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    marginBottom: 2,
  },
  buttonWrap: {
    marginTop: 12,
    minWidth: 160,
  },
});

export default styles;
