import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";
import { tabPlaceholderStyles as styles } from "../../components/styles";
import ProfileHeaderIcon from "../../components/ProfileHeaderIcon";

export default function OrderHistoryScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={localStyles.header}>
        <ProfileHeaderIcon />
        <Text style={styles.title}>Order History</Text>
      </View>
      <View style={styles.container}>
        <Text style={styles.subtitle}>Coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
  },
});
