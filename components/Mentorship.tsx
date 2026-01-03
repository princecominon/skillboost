import React, { useState } from 'react';
import { MOCK_MENTORS } from '../constants';
import {
  Calendar,
  Mail,
  Phone,
  Video,
  Star,
  ExternalLink,
  Filter,
  Search,
  BookOpen,
  Rocket,
  ArrowUpRight,
  X
} from 'lucide-react';

const Mentorship: React.FC = () => {
  const [activeDept, setActiveDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRequestPopup, setShowRequestPopup] = useState(false); // ✅ ADD ONLY

  const departments = ['All', ...new Set(MOCK_MENTORS.map(m => m.department))];

  const filteredMentors = MOCK_MENTORS.filter(mentor => {
    const matchesDept = activeDept === 'All' || mentor.department === activeDept;
    const matchesSearch =
      mentor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mentor.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-7xl mx-auto px-6">

      {/* ================= HEADER ================= */}
      <div className="bg-[#1A0616] p-10 md:p-16 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center space-x-3 mb-6">
            <div className="w-2 h-2 bg-[#E91E63] rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#E91E63]">
              Expert Network
            </span>
          </div>
          <h2 className="text-5xl md:text-7xl font-medium mb-6 tracking-tighter leading-[0.9]">
            Connect with <br />
            <span className="italic font-light text-white/40">Faculty Experts</span>
          </h2>
          <p className="text-white/40 text-lg mb-10 leading-relaxed font-light">
            Directly engage with departmental heads and specialized researchers to bridge your academic insights with deep industrial expertise.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E91E63]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[120px] pointer-events-none"></div>
      </div>

      {/* ================= RESOURCE BRIDGE (RESTORED) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Syllabus */}
        <a
          href="https://www.ietdavv.edu.in/index.php/academics/syllabus"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-8">
              <BookOpen size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Syllabus <span className="text-gray-300 italic font-light">Blueprints</span>
              </h3>
              <p className="text-gray-400 text-sm mb-8">
                Access official departmental course structures to ensure your core academic alignment.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-500">
              Visit Official Repository <ArrowUpRight size={14} />
            </div>
          </div>
        </a>

        {/* Certificate / Skill Boost */}
        <a
          href="https://www.geeksforgeeks.org/nation-skill-up/"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative bg-[#1A0616] p-10 rounded-[48px] text-white shadow-xl hover:shadow-[#E91E63]/20 transition-all duration-500 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col h-full">
            <div className="w-14 h-14 bg-[#E91E63] rounded-2xl flex items-center justify-center mb-8">
              <Rocket size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-3xl font-bold mb-4">
                Skill <span className="text-[#E91E63] italic font-light">Boost Engine</span>
              </h3>
              <p className="text-white/40 text-sm mb-8">
                Accelerate your career with GeeksforGeeks Nation Skill-Up — industry vetted certification.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#E91E63]">
              Nation Skill-Up Portal <ArrowUpRight size={14} />
            </div>
          </div>
        </a>
      </div>

      {/* ================= FILTER & SEARCH ================= */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between pt-8">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          <Filter size={18} className="text-gray-300 mr-2" />
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setActiveDept(dept)}
              className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                activeDept === dept
                  ? 'bg-black text-white'
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search expertise..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-12 pr-6 text-xs"
          />
        </div>
      </div>

      {/* ================= MENTORS GRID ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMentors.map(mentor => (
          <div key={mentor.id} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex justify-between mb-6">
              <img src={mentor.avatar} className="w-20 h-20 rounded-3xl" />
              <a href={`mailto:${mentor.email}`} className="p-3 bg-gray-50 rounded-xl">
                <Mail size={16} />
              </a>
            </div>
            <h3 className="font-bold">{mentor.name}</h3>
            <p className="text-xs text-gray-400">{mentor.role}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <Phone size={14} /> {mentor.contact}
            </div>
          </div>
        ))}
      </div>

      {/* ================= FEATURE SECTION ================= */}
      <div className="bg-gray-50 p-12 md:p-20 rounded-[60px] text-center space-y-8">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto text-[#E91E63]">
          <Calendar size={32} />
        </div>
        <h3 className="text-3xl font-bold">Departmental Deep-Dive</h3>
        <p className="text-gray-400 text-sm">
          Need advice on your specific research project? Filter by department and connect with professors.
        </p>

        {/* 🔴 ONLY ADDITION */}
        <button
          onClick={() => setShowRequestPopup(true)}
          className="px-12 py-5 bg-[#1A0616] text-white rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em]"
        >
          Request Departmental Seminar
        </button>
      </div>

      {/* ================= POPUP ================= */}
      {showRequestPopup && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-[200]"
          onClick={() => setShowRequestPopup(false)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-white rounded-[40px] p-10 max-w-md w-full relative"
          >
            <button
              onClick={() => setShowRequestPopup(false)}
              className="absolute top-4 right-4"
            >
              <X size={20} />
            </button>

            <p className="text-sm text-gray-700 leading-relaxed">
              Contact <strong>ADMINE</strong> through email for further queries or problem or request related to this.
            </p>

            <div className="mt-4 flex items-center gap-2 bg-gray-50 p-4 rounded-xl">
              <Mail size={18} className="text-[#E91E63]" />
              <strong>prince.com.in.on@gmail.com</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mentorship;
