export type WeekdayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekdayFilter = "all" | WeekdayIndex;

export interface OperationalWeekRange {
  start: Date;
  end: Date;
}

export const WEEKDAY_FILTERS: Array<{
  label: string;
  value: WeekdayFilter;
}> = [
  { label: "Todos", value: "all" },
  { label: "Seg", value: 1 },
  { label: "Ter", value: 2 },
  { label: "Qua", value: 3 },
  { label: "Qui", value: 4 },
  { label: "Sex", value: 5 },
  { label: "Sab", value: 6 },
  { label: "Dom", value: 0 },
];

const OPERATIONAL_WEEK_START_HOUR = 12;

export function parseStoredDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date;
}

export function getOperationalWeekRange(referenceDate = new Date()) {
  const start = new Date(referenceDate);
  const daysSinceSunday = start.getDay();

  start.setHours(OPERATIONAL_WEEK_START_HOUR, 0, 0, 0);
  start.setDate(start.getDate() - daysSinceSunday);

  if (referenceDate.getDay() === 0 && referenceDate.getTime() < start.getTime()) {
    start.setDate(start.getDate() - 7);
  }

  const end = new Date(start);
  end.setDate(start.getDate() + 7);

  return { start, end };
}

export function isDateInOperationalWeek(
  date: Date,
  weekRange: OperationalWeekRange
) {
  const time = date.getTime();

  return time >= weekRange.start.getTime() && time < weekRange.end.getTime();
}

export function isStoredDateInOperationalWeek(
  value: string,
  weekRange: OperationalWeekRange
) {
  const date = parseStoredDate(value);

  return date ? isDateInOperationalWeek(date, weekRange) : false;
}

export function isStoredDateOnWeekday(value: string, weekday: WeekdayIndex) {
  const date = parseStoredDate(value);

  return date ? date.getDay() === weekday : false;
}

export function padDatePart(value: number) {
  return String(value).padStart(2, "0");
}

export function formatShortDate(date: Date) {
  return `${padDatePart(date.getDate())}/${padDatePart(date.getMonth() + 1)}`;
}

export function formatFullDate(date: Date) {
  return `${formatShortDate(date)}/${date.getFullYear()}`;
}

export function formatOperationalWeekRange(weekRange: OperationalWeekRange) {
  return `${formatShortDate(weekRange.start)} - ${formatShortDate(
    weekRange.end
  )}`;
}
