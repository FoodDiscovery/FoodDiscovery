import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OrderHistoryList from "../../components/home/OrderHistoryList";
import { tabPlaceholderStyles as styles } from "../../components/styles";

const BG = "#F3F6FB";

export default function OrderHistoryScreen() {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: BG }]} edges={["top"]}>
      <View style={[styles.container, { justifyContent: "flex-start", paddingTop: 24 }]}>
        <Text style={styles.title}>Order History</Text>
        <OrderHistoryList />
      </View>
    </SafeAreaView>
  );
}
