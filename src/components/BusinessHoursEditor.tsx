import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native'
import {
  DAY_ORDER,
  DAY_LABELS,
  DayKey,
  Meridiem,
  WeeklyBusinessHours,
  normalizeHourInput,
  normalizeMinuteInput,
} from '../lib/businessHours'

interface BusinessHoursEditorProps {
  value: WeeklyBusinessHours
  onChange: (next: WeeklyBusinessHours) => void
}

function PeriodToggle({
  selected,
  onSelect,
}: {
  selected: Meridiem
  onSelect: (period: Meridiem) => void
}) {
  return (
    <View style={styles.periodWrap}>
      {(['AM', 'PM'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[styles.periodButton, selected === period && styles.periodButtonActive]}
          onPress={() => onSelect(period)}
        >
          <Text
            style={[styles.periodButtonText, selected === period && styles.periodButtonTextActive]}
          >
            {period}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default function BusinessHoursEditor({
  value,
  onChange,
}: BusinessHoursEditorProps) {
  const updateDay = (day: DayKey, updater: (current: WeeklyBusinessHours[DayKey]) => WeeklyBusinessHours[DayKey]) => {
    onChange({
      ...value,
      [day]: updater(value[day]),
    })
  }

  return (
    <View style={styles.container}>
      {DAY_ORDER.map((day) => {
        const dayHours = value[day]
        return (
          <View key={day} style={styles.dayCard}>
            <View style={styles.dayHeader}>
              <Text style={styles.dayLabel}>{DAY_LABELS[day]}</Text>
              <TouchableOpacity
                style={[styles.closedToggle, dayHours.closed && styles.closedToggleActive]}
                onPress={() =>
                  updateDay(day, (current) => ({
                    ...current,
                    closed: !current.closed,
                  }))
                }
              >
                <Text style={[styles.closedToggleText, dayHours.closed && styles.closedToggleTextActive]}>
                  {dayHours.closed ? 'Closed' : 'Open'}
                </Text>
              </TouchableOpacity>
            </View>

            {!dayHours.closed && (
              <View style={styles.timeRows}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Open</Text>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    value={String(dayHours.open.hour)}
                    onChangeText={(text) =>
                      updateDay(day, (current) => ({
                        ...current,
                        open: { ...current.open, hour: normalizeHourInput(text) },
                      }))
                    }
                    maxLength={2}
                    placeholder="9"
                  />
                  <Text style={styles.timeColon}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    value={dayHours.open.minute.toString().padStart(2, '0')}
                    onChangeText={(text) =>
                      updateDay(day, (current) => ({
                        ...current,
                        open: { ...current.open, minute: normalizeMinuteInput(text) },
                      }))
                    }
                    maxLength={2}
                    placeholder="00"
                  />
                  <PeriodToggle
                    selected={dayHours.open.period}
                    onSelect={(period) =>
                      updateDay(day, (current) => ({
                        ...current,
                        open: { ...current.open, period },
                      }))
                    }
                  />
                </View>

                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>Close</Text>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    value={String(dayHours.close.hour)}
                    onChangeText={(text) =>
                      updateDay(day, (current) => ({
                        ...current,
                        close: { ...current.close, hour: normalizeHourInput(text) },
                      }))
                    }
                    maxLength={2}
                    placeholder="5"
                  />
                  <Text style={styles.timeColon}>:</Text>
                  <TextInput
                    style={styles.timeInput}
                    keyboardType="number-pad"
                    value={dayHours.close.minute.toString().padStart(2, '0')}
                    onChangeText={(text) =>
                      updateDay(day, (current) => ({
                        ...current,
                        close: { ...current.close, minute: normalizeMinuteInput(text) },
                      }))
                    }
                    maxLength={2}
                    placeholder="00"
                  />
                  <PeriodToggle
                    selected={dayHours.close.period}
                    onSelect={(period) =>
                      updateDay(day, (current) => ({
                        ...current,
                        close: { ...current.close, period },
                      }))
                    }
                  />
                </View>
              </View>
            )}
          </View>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  dayCard: {
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#fff',
    gap: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  closedToggle: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  closedToggleActive: {
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  closedToggleText: {
    fontSize: 13,
    color: '#1f2937',
    fontWeight: '500',
  },
  closedToggleTextActive: {
    color: '#b91c1c',
  },
  timeRows: {
    gap: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  timeLabel: {
    width: 44,
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '600',
  },
  timeInput: {
    width: 44,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'center',
    fontSize: 14,
  },
  timeColon: {
    fontSize: 16,
    color: '#374151',
    marginHorizontal: -2,
  },
  periodWrap: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    overflow: 'hidden',
    marginLeft: 2,
  },
  periodButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
  },
  periodButtonActive: {
    backgroundColor: '#1d4ed8',
  },
  periodButtonText: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
})
