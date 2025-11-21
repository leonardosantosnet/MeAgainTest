import dayjs from 'dayjs';
import { Availability } from '../../types/availability';

export function isWithinAvailability(start: Date, end: Date, availability: Availability[]) {
  const dayName = dayjs(start).format('dddd'); // Monday, Tuesday, etc.
  
  const dayAvailability = availability.filter(a => a.day === dayName);
   
  if (dayAvailability.length === 0) return false;

  
  const checkAvailability =  dayAvailability.map(a => {

    if(Number(timeToMinutes(start)) && Number(convertTimeStamp(a.startHour)) && Number(convertTimeStamp(a.endHour))){
      if(timeToMinutes(start) >= convertTimeStamp(a.startHour) && timeToMinutes(end) <= convertTimeStamp(a.endHour)){
        return true;
      }
    }

  });

  if (checkAvailability.some(a => a === true)) 
    return true; 
  else 
    return false;
}

export function timeToMinutes(date: Date | string | dayjs.Dayjs) : Number {
  const d = dayjs(date);
  return d.hour() * 60 + d.minute();
} 

export function convertTimeStamp(hourFull: string) : Number {
  const [hour, minute] = hourFull.split(":").map(Number);
  return hour * 60 + minute;
} 