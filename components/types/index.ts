export interface UserProfile {
  name: string;
  email?: string;          // <--- 1. This fixes the AuthFlow error
  major: string;
  year: string | number;   // <--- 2. Allows both "1" (string) and 1 (number) to prevent type conflicts
  dailyGoalMinutes: number;
  completedMinutesToday: number;
  currentRank: number;
  skills: string[];
  xp: number;
  totalModules: number;
  certificates?: number;   // <--- 3. This fixes potential errors in the Profile component
}

export interface Course {
  id: string;
  title: string;
  skills: string[];
}