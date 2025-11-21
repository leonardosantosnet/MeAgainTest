import dayjs from 'dayjs';
import { Session } from '../../types/session';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export function hasSessionConflict(
  start: Date | string | dayjs.Dayjs,
  end: Date | string | dayjs.Dayjs,
  sessions: Session[]
): boolean {
  const startTime = dayjs(start);
  const endTime = dayjs(end);

  return sessions.some(session => {
    const sessionStart = dayjs(session.startTime);
    const sessionEnd = sessionStart.add(session.duration, 'minute');

    // Verifica se há sobreposição
    return (
      (sessionStart.isSameOrBefore(endTime) && sessionEnd.isSameOrAfter(startTime))
    );
  });
}
