import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import {
  formatDateOnlyForDisplay,
  monthTitle,
  parseDateOnly,
  toDateOnlyString,
} from "../lib/dateUtils";
import { dateRangePickerModalStyles as styles } from "./styles";

export interface DateRangeSelection {
  startDate: string | null;
  endDate: string | null;
}

interface DateRangePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (selection: DateRangeSelection) => void;
  initialStartDate?: string | null;
  initialEndDate?: string | null;
  title?: string;
}

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildMonthDays(month: Date): (string | null)[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay();
  const totalDays = new Date(year, monthIndex + 1, 0).getDate();

  const days: (string | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i += 1) {
    days.push(null);
  }
  for (let day = 1; day <= totalDays; day += 1) {
    days.push(toDateOnlyString(new Date(year, monthIndex, day)));
  }
  while (days.length % 7 !== 0) {
    days.push(null);
  }
  return days;
}

export default function DateRangePickerModal({
  visible,
  onClose,
  onApply,
  initialStartDate = null,
  initialEndDate = null,
  title = "Filter by Date",
}: DateRangePickerModalProps) {
  const [startDate, setStartDate] = useState<string | null>(initialStartDate);
  const [endDate, setEndDate] = useState<string | null>(initialEndDate);
  const [displayMonth, setDisplayMonth] = useState<Date>(
    initialStartDate ? parseDateOnly(initialStartDate) : new Date()
  );

  useEffect(() => {
    if (!visible) return;
    setStartDate(initialStartDate);
    setEndDate(initialEndDate);
    if (initialStartDate) {
      setDisplayMonth(parseDateOnly(initialStartDate));
    }
  }, [visible, initialStartDate, initialEndDate]);

  const days = useMemo(() => buildMonthDays(displayMonth), [displayMonth]);

  const handleSelectDay = (dayString: string) => {
    if (!startDate || endDate) {
      setStartDate(dayString);
      setEndDate(null);
      return;
    }

    if (dayString < startDate) {
      setEndDate(startDate);
      setStartDate(dayString);
      return;
    }

    if (dayString === startDate) {
      setEndDate(null);
      return;
    }

    setEndDate(dayString);
  };

  const applySelection = () => {
    onApply({ startDate, endDate });
    onClose();
  };

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Text style={styles.headerButton}>Close</Text>
            </Pressable>
          </View>

          <Text style={styles.selectionText}>
            From: {formatDateOnlyForDisplay(startDate ?? "")}
            {endDate != null ? ` | To: ${formatDateOnlyForDisplay(endDate)}` : ""}
          </Text>

          <View style={styles.monthNavRow}>
            <Pressable
              onPress={() =>
                setDisplayMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
                )
              }
              style={styles.monthNavButton}
            >
              <Text style={styles.monthNavButtonText}>{"<"}</Text>
            </Pressable>
            <Text style={styles.monthTitle}>{monthTitle(displayMonth)}</Text>
            <Pressable
              onPress={() =>
                setDisplayMonth(
                  (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
                )
              }
              style={styles.monthNavButton}
            >
              <Text style={styles.monthNavButtonText}>{">"}</Text>
            </Pressable>
          </View>

          <View style={styles.weekHeaderRow}>
            {WEEKDAY_LABELS.map((label) => (
              <Text key={label} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {days.map((day, index) => {
              if (!day) {
                return <View key={`empty-${index}`} style={styles.dayCell} />;
              }

              const isStart = startDate === day;
              const isEnd = endDate === day;
              const inRange = startDate && endDate ? day > startDate && day < endDate : false;
              const isSelected = isStart || isEnd || inRange;

              return (
                <Pressable
                  key={day}
                  testID={`day-${day}`}
                  style={[styles.dayCell, isSelected && styles.dayCellSelected]}
                  onPress={() => handleSelectDay(day)}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                    {Number(day.split("-")[2])}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footerRow}>
            <Pressable onPress={clearSelection} style={styles.footerButton}>
              <Text style={styles.footerButtonText}>Clear</Text>
            </Pressable>
            <Pressable onPress={applySelection} style={[styles.footerButton, styles.applyButton]}>
              <Text style={[styles.footerButtonText, styles.applyButtonText]}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
