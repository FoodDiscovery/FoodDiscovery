import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { tabPlaceholderStyles as styles } from "../../components/styles";

export default function OwnerAnalyticsScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Analytics</Text>
        <Text style={styles.subtitle}>Coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}

