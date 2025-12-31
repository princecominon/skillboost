
import React, { useState } from 'react';
import { MOCK_MENTORS } from '../constants';
import { Calendar, Mail, Phone, Video, Star, ExternalLink, Filter, Search, BookOpen, Rocket, ArrowUpRight } from 'lucide-react';

const Mentorship: React.FC = () => {
  const [activeDept, setActiveDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const departments = ['All', ...new Set(MOCK_MENTORS.map(m => m.department))];

  const filteredMentors = MOCK_MENTORS.filter(mentor => {
    const matchesDept = activeDept === 'All' || mentor.department === activeDept;
    const matchesSearch = mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mentor.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto px-6">
      {/* Header Section */}
      <div className="bg-[#1A0616] p-10 md:p-16 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-2 h-2 bg-[#E91E63] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#E91E63]">Expert Network</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-medium mb-6 tracking-tighter leading-[0.9]">
            Connect with <br /> <span className="italic font-light text-white/40">Faculty Experts</span>
          </h2>
          <p className="text-white/40 text-lg mb-10 leading-relaxed font-light">
            Directly engage with departmental heads and specialized researchers to bridge your academic insights with deep industrial expertise.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E91E63]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none"></div>
      </div>

      {/* Resource Bridge - NEW SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Syllabus Section */}
        <a 
          href="https://www.ietdavv.edu.in/index.php/academics/syllabus" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
              <BookOpen size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900 tracking-tight mb-4">Syllabus <br/><span className="text-gray-300 italic font-light">Blueprints</span></h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-[280px]">Access official departmental course structures to ensure your core academic alignment.</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
              <span>Visit Official Repository</span>
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50/50 rounded-full blur-[40px] group-hover:bg-blue-100/50 transition-colors"></div>
        </a>

        {/* Skill Boost Section */}
        <a 
          href="https://www.geeksforgeeks.org/nation-skill-up/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group relative bg-[#1A0616] p-10 rounded-[48px] text-white shadow-xl hover:shadow-[#E91E63]/20 transition-all duration-500 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 bg-[#E91E63] text-white rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-[#E91E63]/30">
              <Rocket size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-white tracking-tight mb-4">Skill <br/><span className="text-[#E91E63] italic font-light">Boost Engine</span></h3>
              <p className="text-white/40 text-sm leading-relaxed mb-8 max-w-[280px]">Accelerate your career with GeeksforGeeks Nation Skill-Up — industry vetted content.</p>
            </div>
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-[#E91E63]">
              <span>Nation Skill-Up Portal</span>
              <ArrowUpRight size={14} />
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#E91E63]/10 rounded-full blur-[40px] group-hover:bg-[#E91E63]/20 transition-colors"></div>
        </a>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between pt-8">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 w-full lg:w-auto scrollbar-hide">
          <Filter size={18} className="text-gray-300 mr-2 shrink-0" />
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeDept === dept 
                ? 'bg-black text-white shadow-xl' 
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
        
        <div className="relative w-full lg:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={16} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expertise..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-xs focus:outline-none focus:border-black transition-all"
          />
        </div>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMentors.map((mentor) => (
          <div key={mentor.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col group">
            <div className="flex items-start justify-between mb-8">
              <div className="relative">
                <img src={mentor.avatar} className="w-20 h-20 rounded-3xl object-cover bg-gray-50 p-1 grayscale group-hover:grayscale-0 transition-all duration-700" alt={mentor.name} />
                <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-xl shadow-lg">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                </div>
              </div>
              <div className="flex gap-2">
                <a href={`mailto:${mentor.email}`} className="p-3 bg-gray-50 text-gray-400 hover:text-[#E91E63] hover:bg-[#E91E63]/5 rounded-2xl transition-all" title="Email">
                  <Mail size={16} />
                </a>
                <button className="p-3 bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 rounded-2xl transition-all">
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 space-y-6">
              <div>
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#E91E63] mb-2 block">{mentor.department}</span>
                <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-none mb-2">{mentor.name}</h3>
                <p className="text-gray-400 text-xs font-medium">{mentor.role}</p>
              </div>

              <div className="space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-300">Research Focus</p>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map(exp => (
                    <span key={exp} className="px-3 py-1 bg-gray-50 text-gray-500 text-[9px] rounded-full font-bold uppercase border border-gray-100">
                      {exp}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-gray-50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Phone size={14} />
                    <span className="text-[10px] font-bold">{mentor.contact}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#E91E63]">
                    <Video size={14} />
                    <span className="text-[10px] font-black uppercase tracking-wider">Office Hours</span>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {mentor.availableTime.map(time => (
                    <div key={time} className="px-3 py-1.5 bg-gray-50 text-gray-400 text-[9px] font-black uppercase rounded-lg">
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <button className="w-full mt-8 py-4 bg-black text-white rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl shadow-black/20">
              Book Guidance Session
            </button>
          </div>
        ))}
      </div>

      {/* Feature Section */}
      <div className="bg-gray-50 p-12 md:p-20 rounded-[60px] text-center space-y-8">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-[#E91E63]">
          <Calendar size={32} />
        </div>
        <div className="max-w-2xl mx-auto space-y-4">
          <h3 className="text-3xl font-bold text-gray-900 tracking-tight">Departmental Deep-Dive</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            Need advice on your specific research project? Filter by department and connect with professors who specialize in your area of study.
          </p>
        </div>
        <button className="px-12 py-5 bg-[#1A0616] text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] hover:bg-[#E91E63] transition-all shadow-2xl shadow-[#1A0616]/20">
          Request Departmental Seminar
        </button>
      </div>
    </div>
  );
};

export default Mentorship;
