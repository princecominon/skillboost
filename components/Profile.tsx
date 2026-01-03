import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import {
  Zap,
  Target,
  Award,
  Settings,
  LogOut,
  ShieldCheck,
  Mail,
  Activity,
  TrendingUp,
  Camera,
  History,
  Clock,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [greeting, setGreeting] = useState('');
  const [mounted, setMounted] = useState(false);
  
  // FIX: Initialize as null
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // SEARCH HISTORY STATE
  const [searchHistory, setSearchHistory] = useState<
    { search_query: string; created_at: string }[]
  >([]);

  const resolveName = () => {
    if (user.name?.trim().toUpperCase() === 'ADMIN') return 'ADMINE';
    return user.name || '';
  };
  const displayName = resolveName();

  useEffect(() => {
    const url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName || 'User'}`;
    setProfileImage(url);
  }, [displayName]);

  useEffect(() => {
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // --- UPDATED FETCH LOGIC (Hybrid) ---
  useEffect(() => {
    const fetchHistory = async () => {
      let historyItems: any[] = [];

      // 1. Get Local Storage First (Fast & Guaranteed)
      try {
        const local = JSON.parse(localStorage.getItem('search_history') || '[]');
        historyItems = [...local];
      } catch (e) {
        console.warn("Local storage read error", e);
      }

      // 2. Try getting Supabase Data (Merge if available)
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user?.email) {
          const { data, error } = await supabase
            .from('search_history')
            .select('search_query, created_at')
            .eq('user_email', session.user.email)
            .order('created_at', { ascending: false })
            .limit(10);

          if (!error && data && data.length > 0) {
            // If Supabase has data, use it (it might be fresher or synced)
            // Or you can merge them. Here we prefer Supabase if valid.
            historyItems = data;
          }
        }
      } catch (e) {
        console.warn("Supabase fetch failed", e);
      }

      setSearchHistory(historyItems);
    };

    fetchHistory();
  }, []);

  return (
    <div className={`min-h-screen bg-[#FDFCFE] pb-32 transition-opacity duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* HEADER SECTION */}
      <div className="bg-[#1A0616] pt-32 pb-24 px-6 md:px-12 rounded-b-[60px] relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(233,30,99,0.3),transparent)] pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto relative z-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-white/10 p-1 bg-white/5 relative overflow-hidden">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10 animate-pulse rounded-full" />
              )}
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer rounded-full"
              >
                <Camera size={24} className="text-white" />
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
            </div>
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-[#E91E63] rounded-full border-4 border-[#1A0616] flex items-center justify-center">
              <Zap size={14} className="text-white fill-current" />
            </div>
          </div>

          <div className="text-center md:text-left space-y-2">
            <p className="text-[#E91E63] font-bold uppercase tracking-[0.2em] text-xs mb-2">{greeting}</p>
            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter">
              {displayName}
            </h1>
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
              <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-bold text-white/60 uppercase tracking-widest border border-white/5">
                {user.major || 'Computer Science'}
              </span>
              <span className="px-4 py-1.5 bg-[#E91E63]/20 rounded-full text-[10px] font-bold text-[#E91E63] uppercase tracking-widest border border-[#E91E63]/20">
                Level {user.year || '1'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="max-w-4xl mx-auto px-6 -mt-12 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-3 group-hover:scale-110 transition-transform">
              <Target size={20} />
            </div>
            <span className="text-2xl font-black text-gray-900">{user.dailyGoalMinutes}m</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Daily Goal</span>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 mb-3 group-hover:scale-110 transition-transform">
              <Activity size={20} />
            </div>
            <span className="text-2xl font-black text-gray-900">{user.completedMinutes}m</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Focus Time</span>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp size={20} />
            </div>
            <span className="text-2xl font-black text-gray-900">{user.streakDays}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Day Streak</span>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 flex flex-col items-center justify-center text-center group hover:-translate-y-1 transition-transform">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 mb-3 group-hover:scale-110 transition-transform">
              <Award size={20} />
            </div>
            <span className="text-2xl font-black text-gray-900">{user.xp}</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total XP</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT SPLIT */}
      <div className="max-w-4xl mx-auto px-6 mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        
        {/* ACCOUNT SETTINGS */}
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <Settings size={14} /> Account Settings
            </h3>
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm">
                    <Mail size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</span>
                    <span className="text-sm font-bold text-gray-900">{user.email || 'guest@skillboost.app'}</span>
                  </div>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm">
                    <ShieldCheck size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Status</span>
                    <span className="text-sm font-bold text-gray-900">Active Student</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={onLogout}
                className="w-full py-4 border-2 border-red-50 text-red-500 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-50 hover:border-red-100 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* SEARCH HISTORY */}
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
              <History size={14} /> Recent Searches
            </h3>
            
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100 h-[340px] overflow-y-auto scrollbar-hide">
              {searchHistory.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4">
                  <SearchIconPlaceholder />
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-300">No history found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {searchHistory.map((item, index) => (
                    <div key={index} className="group p-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors border border-gray-100 hover:border-gray-200">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-gray-900 line-clamp-1">{item.search_query}</span>
                        <ArrowRight size={12} className="text-gray-300 group-hover:text-black transition-colors" />
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                        <Clock size={10} />
                        <span>{new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// Simple Icon for empty state
const SearchIconPlaceholder = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-20">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export default Profile;