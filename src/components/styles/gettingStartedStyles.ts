import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "center",
    gap: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    color: "#4a4a4a",
    lineHeight: 22,
  },
  helperText: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },
  inputWrap: {
    marginTop: 8,
  },
  buttonWrap: {
    marginTop: 12,
  },
  secondaryButtonWrap: {
    marginTop: 4,
  },
});

export default styles;
