import dayjs from 'dayjs';
import { Availability } from '../../types/availability';

export function isWithinAvailability(
  start: Date | string | dayjs.Dayjs,
  end: Date | string | dayjs.Dayjs,
  availability: Availability[]
): boolean {
  const dayName = dayjs(start).format('dddd'); // Monday, Tuesday, etc.

  const dayAvailability = availability.filter(a => a.day === dayName);
  if (dayAvailability.length === 0) return false;

  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);

  return dayAvailability.some(a => {
    const startHourMinutes = convertTimeStamp(a.startHour);
    const endHourMinutes = convertTimeStamp(a.endHour);

    return startMinutes >= startHourMinutes && endMinutes <= endHourMinutes;
  });
}

export function timeToMinutes(date: Date | string | dayjs.Dayjs): number {
  const d = dayjs(date);
  return d.hour() * 60 + d.minute();
}

export function convertTimeStamp(hourFull: string): number {
  const [hour, minute] = hourFull.split(":").map(Number);
  return hour * 60 + minute;
}
