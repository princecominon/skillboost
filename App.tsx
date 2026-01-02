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
import { ChevronRight, LogOut } from 'lucide-react';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. CHECK SESSION ON APP LOAD
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Map session to UserProfile
        const meta = session.user.user_metadata;
        const mappedUser: UserProfile = {
          name: meta.full_name || session.user.email?.split('@')[0] || 'Learner',
          major: meta.major || '',
          year: meta.year || '',
          dailyGoalMinutes: 60,
          completedMinutesToday: 0,
          currentRank: 500,
          skills: [],
          xp: 0,
          totalModules: 0,
          certificates: 0
        };
        
        setUser(mappedUser);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkSession();

    // Listen for auth changes (e.g. token expiry)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigateTo = (view: View, course?: Course) => {
    setCurrentView(view);
    if (course) setSelectedCourse(course);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = (userData?: UserProfile) => {
    if (userData) {
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
    setCurrentView('dashboard');
  };

  // --- RENDER LOGIC ---

  if (loading) {
    return <div className="min-h-screen bg-white flex items-center justify-center text-black font-bold">Loading SkillBoost...</div>;
  }

  if (!isAuthenticated || !user) {
    return <AuthFlow onLogin={handleLogin} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={navigateTo} />;
      case 'courses':
        return <CourseView onNavigate={navigateTo} />;
      case 'course-player':
        return selectedCourse ? <CoursePlayer course={selectedCourse} onBack={() => setCurrentView('courses')} /> : null;
      case 'quizzes':
        return <MicroLearning />;
      case 'mentors':
        return <Mentorship />;
      case 'tutorials':
        return <Tutorials />;
      case 'profile':
        return <Profile user={user} onLogout={handleLogout} />;
      default:
        return <Dashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-gray-100 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-12">
          <div className="text-xl font-black tracking-tighter cursor-pointer" onClick={() => navigateTo('dashboard')}>
            SKILL<span className="text-[#E91E63]">BOOST</span>
          </div>
          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-8 text-[13px] font-medium tracking-tight uppercase text-gray-400">
            <button onClick={() => navigateTo('dashboard')} className={`${currentView === 'dashboard' ? 'text-black' : 'hover:text-black transition-colors'}`}>Overview</button>
            <button onClick={() => navigateTo('courses')} className={`${currentView === 'courses' ? 'text-black' : 'hover:text-black transition-colors'}`}>Catalog</button>
            <button onClick={() => navigateTo('quizzes')} className={`${currentView === 'quizzes' ? 'text-black' : 'hover:text-black transition-colors'}`}>Gaps</button>
            <button onClick={() => navigateTo('mentors')} className={`${currentView === 'mentors' ? 'text-black' : 'hover:text-black transition-colors'}`}>Mentors</button>
            <button onClick={() => navigateTo('tutorials')} className={`${currentView === 'tutorials' ? 'text-black' : 'hover:text-black transition-colors'}`}>Vault</button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-6">
          <button 
            onClick={handleLogout}
            className="hidden md:flex items-center space-x-2 bg-[#2D0B26] text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-black transition-all group"
          >
            <span>LOGOUT</span>
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/40 transition-all">
              <ChevronRight size={12} />
            </div>
          </button>
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
            className={`w-10 h-10 rounded-full border-2 object-cover cursor-pointer transition-all ${currentView === 'profile' ? 'border-[#E91E63]' : 'border-gray-100 hover:border-gray-300'}`} 
            alt="Profile"
            onClick={() => navigateTo('profile')}
          />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 pb-32">
        <div className="w-full">
          {renderView()}
        </div>
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav activeView={currentView} onNavigate={navigateTo} />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="text-2xl font-black tracking-tighter">SKILLBOOST</div>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Elevating students to industry heights through measurable success and long-term growth.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Explore</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="hover:text-black cursor-pointer">Academic Tracks</li>
              <li className="hover:text-black cursor-pointer">Case Studies</li>
              <li className="hover:text-black cursor-pointer">Industry Gaps</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Platform</h4>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="hover:text-black cursor-pointer">Mentorship</li>
              <li className="hover:text-black cursor-pointer">Micro-Learning</li>
              <li className="hover:text-black cursor-pointer">Vault</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-widest mb-6">Contact</h4>
            <div className="bg-gray-50 p-6 rounded-2xl">
              <p className="text-sm font-bold mb-2">Next Cohort Starts June</p>
              <button className="text-[#E91E63] text-sm font-bold hover:underline">Apply Now &rarr;</button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-20 mt-20 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase font-bold tracking-widest text-gray-400">
          <p>© 2024 SKILLBOOST ACADEMY. ALL RIGHTS RESERVED.</p>
          <div className="flex space-x-8 mt-4 md:mt-0">
            <span className="cursor-pointer hover:text-black">Privacy Policy</span>
            <span className="cursor-pointer hover:text-black">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;