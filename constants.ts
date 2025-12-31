
import { Course, Mentor, UserProfile, TutorialVideo } from './types';

export const COLORS = {
  primary: '#2D0B26', // Deep Plum
  secondary: '#E91E63', // Magenta accent
  accent: '#7B1FA2', // Purple
  background: '#FFFFFF',
  text: '#1A1A1A',
};

export const MOCK_USER: UserProfile = {
  name: "Alex Rivera",
  major: "Computer Engineering",
  year: 3,
  dailyGoalMinutes: 60,
  completedMinutesToday: 45,
  currentRank: 12,
  skills: ["Python", "Algorithms", "React", "System Design"],
};

export const MOCK_TUTORIALS: TutorialVideo[] = [
  {
    id: "t1",
    title: "The Industrial Mindset: Beyond the Syllabus",
    description: "In this exclusive host-uploaded masterclass, we dive into what recruiters actually look for in junior engineers.",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
    duration: "14:20",
    host: "SkillBoost Lead",
    category: "Career Planning",
    uploadDate: "2 days ago"
  },
  {
    id: "t2",
    title: "System Design for Internships",
    description: "Learn how to approach system design questions during your internship interviews at FAANG companies.",
    videoUrl: "https://www.youtube.com/embed/SqcXyztPa1w",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
    duration: "22:15",
    host: "Host Expert",
    category: "Technical",
    uploadDate: "1 week ago"
  },
  {
    id: "t3",
    title: "Mastering Soft Skills in Standups",
    description: "How to effectively communicate your progress and blockers during agile scrum meetings.",
    videoUrl: "https://www.youtube.com/embed/z9C9R_t4u_0",
    thumbnail: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=800",
    duration: "08:45",
    host: "Career Coach",
    category: "Soft Skills",
    uploadDate: "3 days ago"
  },
  {
    id: "t4",
    title: "Rust for Performance Critical Systems",
    description: "A quick deep-dive into why industry is moving from C++ to Rust for safety and performance.",
    videoUrl: "https://www.youtube.com/embed/zF3st-8_Gq4",
    thumbnail: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=800",
    duration: "18:30",
    host: "Host Expert",
    category: "Technical",
    uploadDate: "5 days ago"
  }
];

export const MOCK_COURSES: Course[] = [
  {
    id: "1",
    title: "Modern Full Stack Architecture",
    description: "Bridging the gap between University Web-Dev and Industry scalable systems.",
    category: "Technical",
    progress: 65,
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    skills: ["Next.js", "GraphQL", "Docker"],
  },
  {
    id: "2",
    title: "Advanced Data Structures in Java",
    description: "Syllabus-aligned deep dive into Trees and Graphs for high-tier interviews.",
    category: "CS Core",
    progress: 20,
    thumbnail: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/fNZaTrGNooE",
    skills: ["Graphs", "Recursion", "Big-O"],
  },
  {
    id: "3",
    title: "Interview Communication Mastery",
    description: "Soft skills specifically tailored for engineering behavioral rounds.",
    category: "Soft Skills",
    progress: 0,
    thumbnail: "https://images.unsplash.com/photo-1620121692029-d088224efc74?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/Y0A-L7i2S1E",
    skills: ["Communication", "Storytelling", "Leadership"],
  }
];

export const MOCK_MENTORS: Mentor[] = [
  // Computer Engineering
  {
    id: "comp-1",
    name: "Dr. Ashish Kumar Jain",
    role: "Professor & Head",
    department: "Computer Engineering",
    expertise: ["Mobile Ad Hoc Network", "Network Security"],
    email: "ajain@ietdavv.edu.in",
    contact: "91 93295 39402",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ashish",
    availableTime: ["Mon 10-12 AM", "Wed 2-4 PM"],
  },
  {
    id: "comp-2",
    name: "Dr. Meena Sharma",
    role: "Professor",
    department: "Computer Engineering",
    expertise: ["Software Engineering", "Software Quality"],
    email: "msharma@ietdavv.edu.in",
    contact: "91 98269 27378",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Meena",
    availableTime: ["Tue 11-1 PM"],
  },
  {
    id: "comp-3",
    name: "Dr. G.L. Prajapati",
    role: "Professor",
    department: "Computer Engineering",
    expertise: ["DSA", "Machine Learning", "AI"],
    email: "glprajapati@ietdavv.edu.in",
    contact: "91 98266 69205",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gopal",
    availableTime: ["Fri 3-5 PM"],
  },
  // IT
  {
    id: "it-1",
    name: "Dr. Hemant Makwana",
    role: "Professor & Head",
    department: "Information Technology",
    expertise: ["Computer Graphics"],
    email: "hmakwana@ietdavv.edu.in",
    contact: "91 98260 46442",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hemant",
    availableTime: ["Mon 4-5 PM"],
  },
  {
    id: "it-2",
    name: "Dr. Vrinda Tokekar",
    role: "Professor",
    department: "Information Technology",
    expertise: ["Wireless Networks", "Information Security"],
    email: "vtokekar@ietdavv.edu.in",
    contact: "91 94253 17939",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vrinda",
    availableTime: ["Wed 10-12 AM"],
  },
  {
    id: "it-3",
    name: "Dr. Pratosh Bansal",
    role: "Professor",
    department: "Information Technology",
    expertise: ["Digital Forensics", "Cloud Computing"],
    email: "pbansal@ietdavv.edu.in",
    contact: "91 99816-43512",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pratosh",
    availableTime: ["Thu 2-4 PM"],
  },
  // E&I
  {
    id: "ei-1",
    name: "Dr. Ajay Verma",
    role: "Professor & Head",
    department: "Electronics & Instrumentation",
    expertise: ["Image Processing", "Network Communication"],
    email: "averma@ietdavv.edu.in",
    contact: "91 96178 01687",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ajay",
    availableTime: ["Mon 9-11 AM"],
  },
  {
    id: "ei-2",
    name: "Dr. Shashi Prakash",
    role: "Professor",
    department: "Electronics & Instrumentation",
    expertise: ["Photonics Instrumentation", "Optical Networks"],
    email: "sprakash@ietdavv.edu.in",
    contact: "91 99771 86156",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Shashi",
    availableTime: ["Tue 2-4 PM"],
  },
  // E&T
  {
    id: "et-1",
    name: "Dr. Sanjiv Tokekar",
    role: "Professor & Head",
    department: "Electronics & Telecommunication",
    expertise: ["Computer Networking", "Microcontrollers"],
    email: "stokekar@ietdavv.edu.in",
    contact: "91 94253 22306",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sanjiv",
    availableTime: ["Wed 3-5 PM"],
  },
  // Mechanical
  {
    id: "mech-1",
    name: "Dr. Ashesh Tiwari",
    role: "Professor & Head",
    department: "Mechanical Engineering",
    expertise: ["Machine Design", "Vibration", "Fault Diagnosis"],
    email: "atiwari@ietdavv.edu.in",
    contact: "91 98269 41506",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ashesh",
    availableTime: ["Mon 12-2 PM"],
  },
  // CSBS
  {
    id: "csbs-1",
    name: "Dr. C.P. Patidar",
    role: "Associate Professor & Head",
    department: "Computer Science & Business Systems",
    expertise: ["OOP", "GPUs", "Machine Learning"],
    email: "cpatidar@ietdavv.edu.in",
    contact: "91 98264 90631",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CP",
    availableTime: ["Fri 11-1 PM"],
  }
];

export const LEADERBOARD = [
  { name: "Priya S.", score: 2450, rank: 1 },
  { name: "Michael K.", score: 2310, rank: 2 },
  { name: "Satoshi N.", score: 2200, rank: 3 },
  { name: "Alex Rivera (You)", score: 1850, rank: 12 },
  { name: "Jessica L.", score: 1720, rank: 15 },
];
