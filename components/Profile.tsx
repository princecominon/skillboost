
import React from 'react';
import { UserProfile } from '../types';
import { Zap, Target, Award, Settings, LogOut, ShieldCheck, Cpu, Database, Layout, Globe, ArrowRight, Star } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const displayUser = {
    ...user,
    xp: user.xp || 0,
    totalModules: user.totalModules || 0,
    certificates: user.certificates || 0,
  };

  const skillCategories = [
    { name: 'Architecture', val: displayUser.skills.length > 2 ? 85 : 15, icon: <Layout size={14} />, color: 'bg-blue-500' },
    { name: 'Core Eng', val: displayUser.skills.length > 0 ? 72 : 5, icon: <Cpu size={14} />, color: 'bg-[#E91E63]' },
    { name: 'Cloud Ops', val: displayUser.skills.includes('Docker') ? 40 : 2, icon: <Globe size={14} />, color: 'bg-purple-500' },
    { name: 'Data Flow', val: displayUser.skills.includes('GraphQL') ? 64 : 0, icon: <Database size={14} />, color: 'bg-green-500' },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12 pb-40">
      {/* Hero Profile Section */}
      <div className="bg-[#1A0616] rounded-[60px] p-10 md:p-20 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-12 shadow-2xl">
        <div className="relative group shrink-0">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#E91E63] to-purple-500 blur-[20px] opacity-40 group-hover:opacity-80 transition-opacity"></div>
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${displayUser.name}`} 
            className="w-48 h-48 rounded-[48px] border-4 border-white/10 relative z-10 object-cover shadow-2xl bg-[#2D0B26]" 
            alt={displayUser.name} 
          />
          <div className="absolute -bottom-4 -right-4 bg-white p-3 rounded-2xl shadow-xl z-20">
            <ShieldCheck size={24} className="text-[#E91E63]" />
          </div>
        </div>

        <div className="flex-1 text-center md:text-left space-y-4">
          <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mb-4">
            <div className="w-1.5 h-1.5 bg-[#E91E63] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E91E63]">Industrial Rank #{displayUser.currentRank}</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-medium tracking-tighter leading-none">{displayUser.name}</h1>
          <p className="text-white/40 text-lg md:text-2xl font-light italic">{displayUser.major} • Year {displayUser.year}</p>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-6">
            <button className="bg-white text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center space-x-3">
              <Settings size={14} />
              <span>Settings</span>
            </button>
            <button 
              onClick={onLogout}
              className="bg-white/5 border border-white/10 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center space-x-3"
            >
              <LogOut size={14} />
              <span>Secure Logout</span>
            </button>
          </div>
        </div>
        
        {/* Background Decorative */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E91E63]/5 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Total XP', val: displayUser.xp.toLocaleString(), icon: <Zap className="text-yellow-400" />, sub: displayUser.xp > 0 ? '+450 recently' : 'Start learning to earn XP' },
          { label: 'Global Rank', val: `#${displayUser.currentRank}`, icon: <Target className="text-[#E91E63]" />, sub: 'Industrial tier: Emerging' },
          { label: 'Certificates', val: displayUser.certificates, icon: <Award className="text-blue-500" />, sub: 'Vetted by Industry' },
          { label: 'Goal Status', val: `${Math.round((displayUser.completedMinutesToday/displayUser.dailyGoalMinutes)*100)}%`, icon: <Star className="text-purple-500" />, sub: 'Daily streak: 1d' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
            <h4 className="text-4xl font-light tracking-tighter text-gray-900 mb-1">{stat.val}</h4>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{stat.label}</p>
            <p className="text-[11px] font-bold text-gray-300 italic">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Skills & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Skill Matrix */}
        <div className="lg:col-span-7 bg-gray-50 p-12 rounded-[60px] space-y-10">
          <div className="flex items-center justify-between">
            <h3 className="text-3xl font-medium tracking-tight">Industrial <span className="text-gray-300 italic">Skill Matrix</span></h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#E91E63]">Real-time Sync</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {skillCategories.map(skill => (
              <div key={skill.name} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 ${skill.color} text-white rounded-xl flex items-center justify-center`}>
                      {skill.icon}
                    </div>
                    <span className="text-xs font-bold text-gray-800">{skill.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-gray-300">{skill.val}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${skill.color} transition-all duration-1000`} style={{ width: `${skill.val}%` }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-8 flex flex-wrap gap-2">
            {displayUser.skills.length > 0 ? displayUser.skills.map(s => (
              <span key={s} className="px-5 py-2 bg-white text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100">
                {s}
              </span>
            )) : (
              <p className="text-xs text-gray-300 italic">No skills analyzed yet. Start a course to populate your matrix.</p>
            )}
          </div>
        </div>

        {/* Milestone Tracker */}
        <div className="lg:col-span-5 bg-white border border-gray-100 p-12 rounded-[60px] shadow-sm flex flex-col justify-between">
          <div className="space-y-6">
            <h3 className="text-3xl font-medium tracking-tight">Recent <br/><span className="text-[#E91E63] italic">Milestones</span></h3>
            <div className="space-y-8">
              {displayUser.totalModules > 0 ? (
                [
                  { title: 'Full Stack Arch I', date: 'Just now', status: 'COMPLETED' },
                ].map((m, i) => (
                  <div key={i} className="flex items-start justify-between group cursor-pointer">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-gray-800 group-hover:text-[#E91E63] transition-colors">{m.title}</p>
                      <p className="text-[10px] font-medium text-gray-300 uppercase tracking-widest">{m.date}</p>
                    </div>
                    <span className="text-[9px] font-black text-green-500 bg-green-50 px-3 py-1 rounded-lg uppercase tracking-widest">{m.status}</span>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center space-y-4">
                   <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-200">
                      <Target size={20} />
                   </div>
                   <p className="text-xs text-gray-300">Your roadmap is waiting to be established.</p>
                </div>
              )}
            </div>
          </div>

          <button className="mt-12 w-full bg-black text-white py-5 rounded-[28px] text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-3 hover:bg-[#E91E63] transition-all group">
            <span>View Learning History</span>
            <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
