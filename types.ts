
export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'CS Core' | 'Technical' | 'Soft Skills' | 'Aptitude';
  progress: number;
  thumbnail: string;
  videoUrl: string;
  skills: string[];
}

export interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  host: string;
  category: string;
  uploadDate: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface Mentor {
  id: string;
  name: string;
  role: string;
  department: string;
  expertise: string[];
  avatar: string;
  email: string;
  contact: string;
  availableTime: string[];
}

// Added missing optional properties to UserProfile to support Profile and Auth flows
export interface UserProfile {
  name: string;
  major: string;
  year: number;
  dailyGoalMinutes: number;
  completedMinutesToday: number;
  currentRank: number;
  skills: string[];
  xp?: number;
  totalModules?: number;
  certificates?: number;
}

export interface RecoveryPath {
  concept: string;
  steps: {
    title: string;
    description: string;
    resourceType: 'video' | 'article' | 'quiz';
  }[];
}

export type View = 'dashboard' | 'courses' | 'course-player' | 'quizzes' | 'mentors' | 'tutorials' | 'profile';
