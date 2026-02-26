import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OrderHistoryList from "../../components/home/OrderHistoryList";
import DateRangePickerModal, {
  type DateRangeSelection,
} from "../../components/DateRangePickerModal";
import { tabPlaceholderStyles as styles } from "../../components/styles";
import { dateRangeLabel } from "../../lib/dateUtils";

const BG = "#F3F6FB";
const NAVY = "#0B2D5B";

export default function OrderHistoryScreen() {
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateRangeSelection>({
    startDate: null,
    endDate: null,
  });
  const rangeLabel = dateRangeLabel(dateFilter);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: BG }]} edges={["top"]}>
      <View style={[styles.container, { justifyContent: "flex-start", paddingTop: 24 }]}>
        <Text style={[styles.title, { fontSize: 28, fontWeight: "800", color: NAVY }]}>
          Order History
        </Text>
        <Pressable
          onPress={() => setDateFilterOpen(true)}
          style={{
            marginTop: 14,
            marginBottom: 6,
            borderRadius: 20,
            backgroundColor: "#E8EEF8",
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: NAVY, fontWeight: "700" }}>Filter dates: {rangeLabel}</Text>
        </Pressable>
        <OrderHistoryList startDate={dateFilter.startDate} endDate={dateFilter.endDate} />
      </View>
      <DateRangePickerModal
        visible={dateFilterOpen}
        onClose={() => setDateFilterOpen(false)}
        onApply={(selection) => setDateFilter(selection)}
        initialStartDate={dateFilter.startDate}
        initialEndDate={dateFilter.endDate}
      />
    </SafeAreaView>
  );
}
