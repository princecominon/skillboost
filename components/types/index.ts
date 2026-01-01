export interface UserProfile {
  name: string;
  major: string;
  year: number;
  dailyGoalMinutes?: number;
  completedMinutesToday?: number;
  currentRank?: number;
  skills?: string[];
  xp?: number;
  totalModules?: number;
}

export interface Course {
  id: string;
  title: string;
  skills: string[];
}