import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native'
import { useState } from 'react'
import { businessHoursEditorStyles as styles } from './styles'
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
  const [minuteDrafts, setMinuteDrafts] = useState<Record<string, string>>({})

  const updateDay = (day: DayKey, updater: (current: WeeklyBusinessHours[DayKey]) => WeeklyBusinessHours[DayKey]) => {
    onChange({
      ...value,
      [day]: updater(value[day]),
    })
  }

  const minuteDraftKey = (day: DayKey, boundary: 'open' | 'close') => `${day}-${boundary}`

  const getMinuteInputValue = (day: DayKey, boundary: 'open' | 'close', minute: number) => {
    const key = minuteDraftKey(day, boundary)
    if (key in minuteDrafts) {
      return minuteDrafts[key]
    }
    return minute.toString().padStart(2, '0')
  }

  const handleMinuteChange = (day: DayKey, boundary: 'open' | 'close', text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '').slice(0, 2)
    const key = minuteDraftKey(day, boundary)

    setMinuteDrafts((current) => ({
      ...current,
      [key]: digitsOnly,
    }))

    if (digitsOnly.length === 0) {
      return
    }

    updateDay(day, (current) => ({
      ...current,
      [boundary]: { ...current[boundary], minute: normalizeMinuteInput(digitsOnly) },
    }))
  }

  const handleMinuteBlur = (day: DayKey, boundary: 'open' | 'close') => {
    const key = minuteDraftKey(day, boundary)
    const draft = minuteDrafts[key] ?? ''
    const normalizedMinute = normalizeMinuteInput(draft)

    updateDay(day, (current) => ({
      ...current,
      [boundary]: { ...current[boundary], minute: normalizedMinute },
    }))

    setMinuteDrafts((current) => {
      return Object.fromEntries(
        Object.entries(current).filter(([draftKey]) => draftKey !== key)
      ) as Record<string, string>
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
                    value={getMinuteInputValue(day, 'open', dayHours.open.minute)}
                    onChangeText={(text) => handleMinuteChange(day, 'open', text)}
                    onBlur={() => handleMinuteBlur(day, 'open')}
                    selectTextOnFocus
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
                    value={getMinuteInputValue(day, 'close', dayHours.close.minute)}
                    onChangeText={(text) => handleMinuteChange(day, 'close', text)}
                    onBlur={() => handleMinuteBlur(day, 'close')}
                    selectTextOnFocus
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

