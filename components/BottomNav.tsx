import React from 'react';
import { View } from '../types';
import {
  Search,
  Clock,
  Zap,
  Users,
  PlayCircle,
  ArrowLeft
} from 'lucide-react';

interface BottomNavProps {
  activeView: View;
  onNavigate: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {

  /* ================= PROFILE MODE ================= */
  if (activeView === 'profile') {
    return (
      <div className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center px-4 animate-slide-up">
        <button
          onClick={() => onNavigate('dashboard')}
          className="bg-black text-white px-8 py-4 rounded-full flex items-center gap-3 shadow-xl hover:scale-105 transition-all"
        >
          <ArrowLeft size={18} />
          <span className="text-xs font-black uppercase tracking-widest">
            Back to Overview
          </span>
        </button>
      </div>
    );
  }

  /* ================= NORMAL NAV ================= */
  const navItems = [
    { id: 'dashboard', icon: <Clock size={22} />, label: 'Overview' },
    { id: 'courses', icon: <Search size={22} />, label: 'Search' },
    { id: 'quizzes', icon: <Zap size={22} />, label: 'Gaps' },
    { id: 'mentors', icon: <Users size={22} />, label: 'Mentors' },
    { id: 'tutorials', icon: <PlayCircle size={22} />, label: 'Vault' }
  ];

  return (
    <div className="fixed bottom-8 left-0 right-0 z-[100] flex justify-center px-4 animate-slide-up stagger-4 pointer-events-none">
      <div className="pointer-events-auto bg-white/40 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-3 px-3 rounded-[40px] flex items-center gap-3">

        {navItems.map((item) => {
          const isActive =
            activeView === item.id ||
            (item.id === 'courses' && activeView === 'course-player');

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as View)}
              className="relative group flex items-center justify-center"
            >
              <div
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center
                  transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
                  ${
                    isActive
                      ? 'bg-black text-white scale-110 shadow-lg'
                      : 'bg-white text-gray-400 hover:bg-gray-50 active:scale-95'
                  }
                `}
              >
                {item.icon}
              </div>

              {/* Tooltip */}
              <span className="absolute -top-10 scale-0 group-hover:scale-100 transition-transform bg-black text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full pointer-events-none">
                {item.label}
              </span>

              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -bottom-1 w-1.5 h-1.5 bg-[#E91E63] rounded-full animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
