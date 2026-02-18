export const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const

export type DayKey = (typeof DAY_ORDER)[number]
export type Meridiem = 'AM' | 'PM'

export type BusinessTime = {
  hour: number
  minute: number
  period: Meridiem
}

export type BusinessDayHours = {
  closed: boolean
  open: BusinessTime
  close: BusinessTime
}

export type WeeklyBusinessHours = Record<DayKey, BusinessDayHours>

export const DAY_LABELS: Record<DayKey, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
}

function defaultTime(hour: number, minute: number, period: Meridiem): BusinessTime {
  return { hour, minute, period }
}

function defaultDay(): BusinessDayHours {
  return {
    closed: false,
    open: defaultTime(9, 0, 'AM'),
    close: defaultTime(5, 0, 'PM'),
  }
}

export function createDefaultBusinessHours(): WeeklyBusinessHours {
  return {
    monday: defaultDay(),
    tuesday: defaultDay(),
    wednesday: defaultDay(),
    thursday: defaultDay(),
    friday: defaultDay(),
    saturday: defaultDay(),
    sunday: defaultDay(),
  }
}

export function normalizeHourInput(value: string): number {
  const parsed = Number.parseInt(value.replace(/[^0-9]/g, ''), 10)
  if (Number.isNaN(parsed)) return 1
  if (parsed < 1) return 1
  if (parsed > 12) return 12
  return parsed
}

export function normalizeMinuteInput(value: string): number {
  const parsed = Number.parseInt(value.replace(/[^0-9]/g, ''), 10)
  if (Number.isNaN(parsed)) return 0
  if (parsed < 0) return 0
  if (parsed > 59) return 59
  return parsed
}

export function toMinutes(time: BusinessTime): number {
  const hour12 = time.hour === 12 ? 0 : time.hour
  const hour24 = time.period === 'PM' ? hour12 + 12 : hour12
  return hour24 * 60 + time.minute
}

export function formatTime(time: BusinessTime): string {
  return `${time.hour}:${time.minute.toString().padStart(2, '0')} ${time.period}`
}

export function isValidDayRange(hours: BusinessDayHours): boolean {
  if (hours.closed) return true
  return toMinutes(hours.open) < toMinutes(hours.close)
}

export function validateWeeklyBusinessHours(hours: WeeklyBusinessHours): string | null {
  for (const day of DAY_ORDER) {
    if (!isValidDayRange(hours[day])) {
      return `${DAY_LABELS[day]} opening time must be earlier than closing time.`
    }
  }
  return null
}

export function businessHoursToDisplayText(hours: WeeklyBusinessHours): string {
  return DAY_ORDER.map((day) => {
    const dayHours = hours[day]
    if (dayHours.closed) {
      return `${DAY_LABELS[day]}: Closed`
    }
    return `${DAY_LABELS[day]}: ${formatTime(dayHours.open)} - ${formatTime(dayHours.close)}`
  }).join('\n')
}

export function getRestaurantOpenStatus(hours: WeeklyBusinessHours): {
  isOpen: boolean
  statusText: string
} {
  const now = new Date()
  const jsDay = now.getDay()
  const dayByJsIndex: DayKey[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  const day = dayByJsIndex[jsDay]
  const todayHours = hours[day]

  if (todayHours.closed) {
    return { isOpen: false, statusText: 'Closed today' }
  }

  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const openMinutes = toMinutes(todayHours.open)
  const closeMinutes = toMinutes(todayHours.close)
  const isOpen = nowMinutes >= openMinutes && nowMinutes < closeMinutes

  return { isOpen, statusText: isOpen ? 'Open now' : 'Closed' }
}

function isBusinessTime(value: unknown): value is BusinessTime {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<BusinessTime>
  const periodValid = v.period === 'AM' || v.period === 'PM'
  return (
    typeof v.hour === 'number' &&
    v.hour >= 1 &&
    v.hour <= 12 &&
    typeof v.minute === 'number' &&
    v.minute >= 0 &&
    v.minute <= 59 &&
    periodValid
  )
}

function isBusinessDayHours(value: unknown): value is BusinessDayHours {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<BusinessDayHours>
  return (
    typeof v.closed === 'boolean' &&
    isBusinessTime(v.open) &&
    isBusinessTime(v.close)
  )
}

export function isWeeklyBusinessHours(value: unknown): value is WeeklyBusinessHours {
  if (!value || typeof value !== 'object') return false
  const obj = value as Partial<Record<DayKey, unknown>>
  return DAY_ORDER.every((day) => isBusinessDayHours(obj[day]))
}

export function normalizeWeeklyBusinessHours(value: unknown): WeeklyBusinessHours {
  if (isWeeklyBusinessHours(value)) {
    return value
  }
  return createDefaultBusinessHours()
}
