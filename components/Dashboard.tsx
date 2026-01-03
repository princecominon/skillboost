
import React, { useState } from 'react';
import { MOCK_COURSES } from '../constants';
import { View, Course } from '../types';
import { ChevronRight, Play, Zap, Brain, Target, Users, ArrowUpRight, Youtube, Search, Info, RefreshCw } from 'lucide-react';
import { analyzeLectureVideo, getYouTubeID } from '../services/geminiService';

interface DashboardProps {
  onNavigate: (view: View, course?: Course) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [lectureUrl, setLectureUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lectureUrl.trim()) return;
    
    setIsAnalyzing(true);
    const result = await analyzeLectureVideo(lectureUrl);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  const startIndustrializedCourse = () => {
    const videoId = getYouTubeID(lectureUrl);
    if (!videoId) return;

    const virtualCourse: Course = {
      id: `industrial-${Date.now()}`,
      title: analysis.industrialTitle,
      description: analysis.summary,
      videoUrl: `https://www.youtube.com/embed/${videoId}`,
      category: 'Technical',
      skills: analysis.concepts || [],
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      progress: 0
    };
    onNavigate('course-player', virtualCourse);
  };

  return (
    <div className="overflow-hidden">
      {/* Category 1: The Vision (Hero) */}
      <section className="relative h-[90vh] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#2D0B26]">
          <div className="absolute top-0 right-0 w-[80%] h-full bg-gradient-to-l from-white/5 to-transparent"></div>
          <div className="absolute top-[-20%] left-[-10%] w-full h-[140%] bg-gradient-to-tr from-[#E91E63]/20 via-transparent to-transparent blur-3xl animate-fade-in"></div>
        </div>
        
        <div className="relative z-10 text-center px-6 max-w-5xl space-y-10">
          <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white/60 text-[10px] font-bold uppercase tracking-[0.3em] animate-slide-up opacity-0">
            <span>01 / The Core Mission</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-medium text-white tracking-tighter leading-[0.85] animate-slide-up opacity-0 stagger-1">
            Utilize your <br /> <span className="italic font-light text-[#E91E63]">Lecture Gaps</span>
          </h1>
          
          <p className="text-white/50 text-base md:text-xl max-w-2xl mx-auto font-light leading-relaxed animate-slide-up opacity-0 stagger-2">
            Convert dull university lectures into high-impact industry skills. Paste any YouTube link to find out what's missing.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10 animate-slide-up opacity-0 stagger-3">
            <button 
              onClick={() => onNavigate('courses')}
              className="flex items-center space-x-4 bg-white text-[#2D0B26] px-10 py-5 rounded-full font-bold transition-transform hover:scale-105 group shadow-2xl"
            >
              <span className="text-xs uppercase tracking-widest">Explore Catalog</span>
              <div className="w-8 h-8 bg-[#2D0B26] rounded-full flex items-center justify-center text-white group-hover:rotate-45 transition-transform">
                <ChevronRight size={18} />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Industrializer Section */}
      <section className="bg-gray-50 py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E91E63]">AI Power Tool</span>
              <h2 className="text-5xl md:text-7xl font-medium tracking-tighter">Lecture <br /> <span className="italic font-light text-gray-300">Industrializer</span></h2>
              <p className="text-gray-400 text-lg max-w-md">Paste a YouTube lecture link. We'll identify the academic concepts and show you the exact industry skills needed to bridge the gap.</p>
              
              <form onSubmit={handleAnalyze} className="relative group max-w-md">
                <Youtube className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#E91E63] transition-colors" size={20} />
                <input 
                  type="text" 
                  value={lectureUrl}
                  onChange={(e) => setLectureUrl(e.target.value)}
                  placeholder="Paste YouTube Link..." 
                  className="w-full bg-white border border-gray-200 rounded-2xl py-5 pl-14 pr-32 text-sm focus:outline-none focus:border-[#E91E63] transition-all"
                />
                <button 
                  type="submit"
                  disabled={isAnalyzing}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black text-white px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#E91E63] transition-all disabled:opacity-50"
                >
                  {isAnalyzing ? <RefreshCw size={14} className="animate-spin" /> : 'ANALYZE'}
                </button>
              </form>
            </div>

            <div className="relative">
              {isAnalyzing && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-[60px] animate-fade-in">
                  <div className="w-16 h-16 border-4 border-[#E91E63] border-t-transparent rounded-full animate-spin mb-6"></div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E91E63]">Scanning Grounding Context...</p>
                </div>
              )}

              {analysis ? (
                <div className="bg-white p-10 rounded-[60px] shadow-2xl border border-gray-100 animate-slide-up">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <Target size={20} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Analysis Complete</span>
                  </div>
                  
                  <h4 className="text-3xl font-medium mb-4 tracking-tight">{analysis.industrialTitle}</h4>
                  <p className="text-gray-400 text-sm mb-8 leading-relaxed italic">"{analysis.summary}"</p>
                  
                  <div className="space-y-4 mb-10">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#E91E63]">Critical Industry Gaps:</p>
                    {analysis.recoveryPoints.map((point: string, i: number) => (
                      <div key={i} className="flex items-start space-x-3 text-xs text-gray-600">
                        <div className="w-1.5 h-1.5 bg-[#E91E63] rounded-full mt-1.5 shrink-0"></div>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={startIndustrializedCourse}
                    className="w-full bg-black text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-[#E91E63] transition-all"
                  >
                    <span>Industrialize & Watch</span>
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-gray-100 rounded-[60px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-12 text-gray-300">
                  <Search size={48} className="mb-6 opacity-20" />
                  <p className="text-sm font-medium">Ready for input.<br />Waiting for valid YouTube source.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category 2: Momentum Stats */}
      <section className="bg-white py-40 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8 animate-slide-up opacity-0 stagger-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E91E63]">02 / The Momentum</span>
              <h2 className="text-5xl md:text-7xl font-medium tracking-tighter leading-[1.1]">
                Empowering <br /> <span className="text-gray-300 italic">Universities</span> globally.
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed max-w-lg">
                We've helped over 10,000+ students bridge the gap between academic theory and the high-performance culture of top-tier tech firms.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-8">
              {[
                { label: 'Growth rate', val: '45%', icon: <Zap size={20} /> },
                { label: 'Active Learners', val: '12k+', icon: <Users size={20} /> },
                { label: 'Skill Recovery', val: '89%', icon: <Brain size={20} /> },
                { label: 'Goal Reached', val: '94%', icon: <Target size={20} /> },
              ].map((stat, i) => (
                <div key={i} className={`bg-gray-50 p-8 rounded-[40px] hover:bg-white hover:shadow-2xl transition-all duration-500 border border-transparent hover:border-gray-100 group animate-slide-up opacity-0 stagger-${i+5}`}>
                  <div className="text-[#E91E63] mb-6 group-hover:scale-110 transition-transform">{stat.icon}</div>
                  <h4 className="text-4xl font-light mb-2">{stat.val}</h4>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Category 3: The Recovery */}
      <section className="bg-[#2D0B26] py-32 px-6 md:px-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-white/[0.02] -skew-x-12"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mb-20">
            <div className="space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#E91E63]">03 / The Recovery</span>
              <h2 className="text-4xl md:text-6xl font-medium tracking-tighter">Instant <span className="italic font-light text-white/40">Gap Detection</span></h2>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {MOCK_COURSES.map((course, i) => (
              <div 
                key={course.id} 
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[48px] hover:bg-white/10 transition-all group"
              >
                <div className="w-12 h-12 bg-[#E91E63] rounded-full flex items-center justify-center mb-8 shadow-xl shadow-[#E91E63]/20">
                  <Zap size={20} fill="white" className="text-white" />
                </div>
                <h4 className="text-2xl font-medium mb-4">{course.title}</h4>
                <p className="text-white/40 text-sm leading-relaxed mb-8">{course.description}</p>
                <button 
                  onClick={() => onNavigate('course-player', course)}
                  className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest group-hover:text-[#E91E63] transition-colors"
                >
                  <span>START RECOVERY</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
