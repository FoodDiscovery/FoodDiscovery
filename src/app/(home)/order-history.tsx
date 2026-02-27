import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import OrderHistoryList from "../../components/home/OrderHistoryList";
import DateRangePickerModal, {
  type DateRangeSelection,
} from "../../components/DateRangePickerModal";
import { orderHistoryStyles as styles } from "../../components/styles";
import { dateRangeLabel } from "../../lib/dateUtils";

export default function OrderHistoryScreen() {
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateRangeSelection>({
    startDate: null,
    endDate: null,
  });
  const rangeLabel = dateRangeLabel(dateFilter);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <Text style={styles.title}>Order History</Text>
        <Pressable
          onPress={() => setDateFilterOpen(true)}
          style={styles.filterButton}
        >
          <Text style={styles.filterButtonText}>Filter dates: {rangeLabel}</Text>
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
