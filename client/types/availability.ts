export interface Availability {
  id: string;
  day: string; // e.g., 'Monday'
  startHour: string;     // e.g., '08:00'
  endHour: string;       // e.g., '10:00'
  mac?: string;
}