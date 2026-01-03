// 1. User Profile (Updated to fix Auth/App errors)
export interface UserProfile {
  name: string;
  email?: string;          // ✅ Fixes AuthFlow error
  major: string;
  year: string | number;   // ✅ Fixes dropdown type conflict
  dailyGoalMinutes: number;
  completedMinutesToday: number;
  currentRank: number;
  skills: string[];
  xp: number;
  streakDays: number;      // ✅ Fixes Profile/App error
  totalModules: number;
  certificates?: number;
}

// 2. Course (Updated to support Search & Catalog display)
export interface Course {
  id: string;
  title: string;
  category: string;        // Required for filtering
  thumbnail?: string;      // Required for CourseView images
  description?: string;
  videoUrl?: string;       // Required for the Player
  duration?: string;
  skills: string[];
}

// 3. Navigation View Type (Required for App.tsx state)
export type View = 
  | 'dashboard' 
  | 'courses' 
  | 'course-player' 
  | 'quizzes' 
  | 'mentors' 
  | 'tutorials' 
  | 'profile';