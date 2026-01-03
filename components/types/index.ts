export interface UserProfile {
  name: string;
  email?: string;          // Added to fix AuthFlow error
  major: string;
  year: string | number;   // Flexible type (accepts "1" or 1)
  dailyGoalMinutes: number;
  completedMinutesToday: number;
  currentRank: number;
  skills: string[];
  xp: number;
  streakDays: number;
  totalModules: number;
  certificates?: number;   // Optional field
}

export interface Course {
  id: string;
  title: string;
  skills: string[];
}