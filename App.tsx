import React, { useState, useEffect } from 'react';
import { View, Course, UserProfile } from './types';
import Dashboard from './components/Dashboard';
import CourseView from './components/CourseView';
import CoursePlayer from './components/CoursePlayer';
import Mentorship from './components/Mentorship';
import MicroLearning from './components/MicroLearning';
import Tutorials from './components/Tutorials';
import Profile from './components/Profile';
import AuthFlow from './components/AuthFlow';
import BottomNav from './components/BottomNav';
import { supabase } from './lib/supabase';
import SearchBar from './components/SearchBar';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState(''); 

  /* ================= SESSION CHECK ================= */
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const meta = session.user.user_metadata;
        const mappedUser: UserProfile = {
          name: meta.full_name || session.user.email?.split('@')[0] || 'Learner',
          // email: session.user.email,
          major: meta.major || '',
          year: meta.year || '',
          dailyGoalMinutes: 60,
          completedMinutesToday: 0,
          currentRank: 500,
          skills: [],
          xp: 0,
          // streakDays: 0,
          totalModules: 0,
          certificates: 0
        };

        setUser(mappedUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  /* ================= NAVIGATION ================= */
  const navigateTo = (view: View, course?: Course) => {
    setCurrentView(view);
    
    if (view !== 'courses') {
      setSearchQuery('');
    }

    if (course) setSelectedCourse(course);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ================= AUTH ================= */
  const handleLogin = (userData?: UserProfile) => {
    if (!userData) return;
    setUser(userData);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('dashboard');
  };

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-bold">
        Loading SkillBoost...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthFlow onLogin={handleLogin} />;
  }

  /* ================= VIEW RENDER ================= */
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;

      case 'courses':
        return (
          <CourseView 
            onNavigate={navigateTo} 
            // @ts-ignore
            initialSearch={searchQuery} 
          />
        );

      case 'course-player':
        return selectedCourse ? (
          <CoursePlayer
            course={selectedCourse}
            onBack={() => setCurrentView('courses')}
          />
        ) : null;

      case 'quizzes':
        // ✅ UPDATED: Passing user prop here
        return <MicroLearning user={user} />;

      case 'mentors':
        return <Mentorship />;

      case 'tutorials':
        return <Tutorials />;

      case 'profile':
        return (
          <Profile
            user={user}
            onLogout={handleLogout}
            onBack={() => setCurrentView('dashboard')} 
          />
        );

      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      {/* ================= HEADER ================= */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <div
            className="text-xl font-black tracking-tighter cursor-pointer"
            onClick={() => navigateTo('dashboard')}
          >
            SKILL<span className="text-[#E91E63]">BOOST</span>
          </div>

          <nav className="hidden lg:flex space-x-8 text-xs font-medium uppercase text-gray-400">
            <button onClick={() => navigateTo('dashboard')} className={currentView === 'dashboard' ? 'text-black' : ''}>Overview</button>
            <button onClick={() => navigateTo('courses')} className={currentView === 'courses' ? 'text-black' : ''}>Catalog</button>
            <button onClick={() => navigateTo('quizzes')} className={currentView === 'quizzes' ? 'text-black' : ''}>Gaps</button>
            <button onClick={() => navigateTo('mentors')} className={currentView === 'mentors' ? 'text-black' : ''}>Mentors</button>
            <button onClick={() => navigateTo('tutorials')} className={currentView === 'tutorials' ? 'text-black' : ''}>Vault</button>
          </nav>
        </div>

        <div className="flex items-center space-x-6">
          
          <div className="hidden md:block w-64 lg:w-80">
            <SearchBar 
              onSearch={(q) => {
                setSearchQuery(q);   
                navigateTo('courses'); 
              }} 
            />
          </div>

          <img
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            className={`w-10 h-10 rounded-full border-2 cursor-pointer ${
              currentView === 'profile'
                ? 'border-[#E91E63]'
                : 'border-gray-100 hover:border-gray-300'
            }`}
            alt="Profile"
            onClick={() => navigateTo('profile')}
          />
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <main className="pt-20 pb-32">
        {renderView()}
      </main>

      {/* ================= BOTTOM NAV ================= */}
      <BottomNav activeView={currentView} onNavigate={navigateTo} />
    </div>
  );
};

export default App;