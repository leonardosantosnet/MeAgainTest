export interface SessionType {
  id: string;
  name: string;
  category: string;
  priority: number;
  completedCount?: number; 
}

export interface Session {
  id: string;
  sessionTypeId: number;
  sessionType: SessionType; 
  startTime: string;         
  duration: number;         
  completed: boolean;
}