import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OrderHistoryCard, { type OrderHistoryItem } from "../../components/home/OrderHistoryCard";
import { tabPlaceholderStyles as styles } from "../../components/styles";

// Dummy data until backend is integrated. Replace with API call.
const DUMMY_ORDERS: OrderHistoryItem[] = [
  { id: "100001", date: "23/02/2026", itemCount: 2, totalPrice: 18.66 },
  { id: "100002", date: "22/02/2026", itemCount: 1, totalPrice: 8.5 },
  { id: "100003", date: "21/02/2026", itemCount: 4, totalPrice: 42.0 },
];

const BG = "#F3F6FB";

export default function OrderHistoryScreen() {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: BG }]} edges={["top"]}>
      <View style={[styles.container, { justifyContent: "flex-start", paddingTop: 24 }]}>
        <Text style={styles.title}>Order History</Text>
        <ScrollView
          style={{ flex: 1, width: "100%", marginTop: 16 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {DUMMY_ORDERS.length === 0 ? (
            <Text style={styles.subtitle}>No orders yet.</Text>
          ) : (
            DUMMY_ORDERS.map((order) => (
              <OrderHistoryCard key={order.id} order={order} />
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
