import dayjs from 'dayjs';
import { Session, SessionType } from '../../types/session';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter); 
dayjs.extend(isSameOrBefore); 

export function hasSessionConflict(start: Date, end: Date, aSession: Session[]) {
  const checkSession = aSession.map(a => {
    
    if(
      (dayjs(a.startTime).isSameOrAfter(dayjs(start)) && dayjs(a.startTime).isSameOrBefore(dayjs(end))) ||
      (dayjs(a.startTime).add(a.duration, 'minute').isSameOrAfter(dayjs(start)) && dayjs(a.startTime).add(a.duration, 'minute').isSameOrBefore(dayjs(end)))
    ){   
      return true;
    }
  });

  console.log(checkSession);

  if (checkSession.some(a => a === true)) 
    return true; 
  else 
    return false;
}

