
import React, { useState } from 'react';
import { MOCK_COURSES } from '../constants';
import { View, Course } from '../types';
import { Filter, ArrowRight, Sparkles, RefreshCcw, BrainCircuit, Activity, ChevronRight, Info, Play, Youtube } from 'lucide-react';
import { recommendCourses, findRecoveryVideos, getYouTubeID } from '../services/geminiService';

interface CourseViewProps {
  onNavigate: (view: View, course?: Course) => void;
}

interface AIRecommendation {
  id: string;
  reason: string;
}

interface DeepDiveVideo {
  id: string;
  title: string;
  url: string;
  rationale: string;
}

const CourseView: React.FC<CourseViewProps> = ({ onNavigate }) => {
  const [filter, setFilter] = useState('All');
  const [aiGoal, setAiGoal] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [deepDives, setDeepDives] = useState<Record<string, DeepDiveVideo>>({});
  
  const categories = ['All', 'CS Core', 'Technical', 'Soft Skills', 'Aptitude'];

  const filteredCourses = filter === 'All' 
    ? MOCK_COURSES 
    : MOCK_COURSES.filter(c => c.category === filter);

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGoal.trim()) return;
    
    setIsAiLoading(true);
    setRecommendations([]);
    setDeepDives({});
    
    const results = await recommendCourses(aiGoal, MOCK_COURSES);
    setRecommendations(results);
    setIsAiLoading(false);

    // Parallel fetch for deep dive videos for better UX
    await Promise.all(results.map(async (rec) => {
      const course = MOCK_COURSES.find(c => c.id === rec.id);
      if (course) {
        const videoData = await findRecoveryVideos(course.skills[0] || course.title);
        // We set the state even if URL is missing to "stop" the loading spinner and show rationale
        setDeepDives(prev => ({
          ...prev,
          [rec.id]: {
            id: rec.id,
            title: videoData?.title || `Deep Dive: ${course.title}`,
            url: videoData?.url || '',
            rationale: videoData?.rationale || "Bridging the gap with industry standards."
          }
        }));
      }
    }));
  };

  const getAiReason = (courseId: string) => {
    return recommendations.find(r => r.id === courseId)?.reason;
  };

  const openDeepDive = (video: DeepDiveVideo, course: Course) => {
    const videoId = getYouTubeID(video.url);
    if (!videoId) {
      // If no video ID, just navigate to the regular course as a fallback
      onNavigate('course-player', course);
      return;
    };

    const virtualCourse: Course = {
      ...course,
      id: `ai-${video.id}-${Date.now()}`,
      title: `[AI] ${video.title}`,
      description: video.rationale,
      videoUrl: `https://www.youtube.com/embed/${videoId}`,
      category: 'Technical'
    };
    onNavigate('course-player', virtualCourse);
  };

  const recommendedCoursesList = recommendations
    .map(rec => MOCK_COURSES.find(c => c.id === rec.id))
    .filter((c): c is Course => !!c);

  return (
    <div className="min-h-screen pb-40">
      {/* Recovery Diagnostic Header */}
      <div className="bg-[#1a0616] text-white pt-24 pb-32 px-6 md:px-12 mb-16 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(233,30,99,0.15),transparent)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-16">
            <div className="space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 mb-2">
                <Activity size={14} className="text-[#E91E63] animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#E91E63]">Recovery Diagnostic Active</span>
              </div>
              <h2 className="text-6xl md:text-8xl font-medium tracking-tighter leading-none">
                Recovery <br /> 
                <span className="italic font-light text-white/40">Pathway</span>
              </h2>
              <p className="text-white/40 text-lg max-w-md font-light">
                Bridging syllabus gaps with industry-vetted YouTube content and expert modules.
              </p>
            </div>
            
            <div className="w-full lg:max-w-xl">
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-2xl shadow-2xl relative">
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#E91E63]/10 blur-[80px] pointer-events-none"></div>
                
                <form onSubmit={handleAiSearch} className="space-y-6">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#E91E63] mb-4">Target Career Aspiration</h4>
                    <div className="relative">
                      <BrainCircuit className={`absolute left-5 top-6 transition-colors duration-500 ${isAiLoading ? 'text-[#E91E63] animate-spin' : 'text-white/20'}`} size={20} />
                      <textarea 
                        value={aiGoal}
                        onChange={(e) => setAiGoal(e.target.value)}
                        placeholder="e.g. 'I want to build highly scalable fintech platforms using Rust'" 
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-sm focus:outline-none focus:border-[#E91E63] focus:bg-white/10 transition-all placeholder:text-white/10 resize-none h-32"
                      />
                    </div>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isAiLoading}
                    className="w-full bg-[#E91E63] text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-[#E91E63]/20 flex items-center justify-center space-x-3"
                  >
                    {isAiLoading ? (
                      <>
                        <RefreshCcw size={16} className="animate-spin" />
                        <span>Generating Roadmap...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Map Gaps to Tutorials</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-20">
        {recommendations.length > 0 && (
          <div className="mb-24 animate-slide-up">
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Your Tailored Recovery Sequence</h3>
              <button 
                onClick={() => { setRecommendations([]); setDeepDives({}); }}
                className="text-[10px] font-bold text-[#E91E63] uppercase tracking-widest flex items-center space-x-2 hover:underline"
              >
                <RefreshCcw size={12} />
                <span>Reset Pathway</span>
              </button>
            </div>
            
            <div className="space-y-12">
              {recommendedCoursesList.map((course, idx) => {
                const reason = getAiReason(course.id);
                const deepDive = deepDives[course.id];
                
                return (
                  <div 
                    key={course.id}
                    className="relative group bg-white border border-gray-100 p-8 rounded-[48px] shadow-xl hover:shadow-2xl transition-all overflow-hidden flex flex-col xl:flex-row gap-8"
                  >
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shrink-0">
                          <span className="text-xl font-black">{idx + 1}</span>
                        </div>
                        <div>
                          <h4 className="text-2xl font-medium tracking-tight leading-tight group-hover:text-[#E91E63] transition-colors">{course.title}</h4>
                          <span className="text-[10px] font-bold text-[#E91E63] uppercase tracking-widest">{course.category}</span>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center space-x-2">
                          <Info size={10} />
                          <span>Strategic Reason</span>
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed italic">"{reason}"</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {course.skills.map(s => (
                          <span key={s} className="px-3 py-1 bg-white border border-gray-200 rounded-full text-[9px] font-bold uppercase text-gray-400">{s}</span>
                        ))}
                      </div>

                      <button 
                        onClick={() => onNavigate('course-player', course)}
                        className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-black hover:text-[#E91E63] transition-colors pt-4"
                      >
                        <span>Open Local Module</span>
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="xl:w-1/2 w-full">
                      {deepDive ? (
                        <div className="h-full flex flex-col space-y-4">
                          {deepDive.url ? (
                            <div 
                              onClick={() => openDeepDive(deepDive, course)}
                              className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-lg cursor-pointer group/video"
                            >
                              <img 
                                src={`https://img.youtube.com/vi/${getYouTubeID(deepDive.url)}/maxresdefault.jpg`} 
                                className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                                alt={deepDive.title}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = course.thumbnail;
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-2xl group-hover:scale-110 transition-transform">
                                  <Play size={24} fill="currentColor" />
                                </div>
                              </div>
                              <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black flex items-center space-x-2">
                                <Youtube size={12} />
                                <span>AI SOURCED TUTORIAL</span>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-video bg-gray-50 rounded-3xl border border-gray-200 flex flex-col items-center justify-center text-center p-8 space-y-4">
                              <Info size={24} className="text-[#E91E63] opacity-20" />
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Direct Link Found</p>
                              <p className="text-[9px] text-gray-300">Proceed with local industrial module</p>
                            </div>
                          )}
                          <div className="px-2">
                            <p className="text-[10px] font-black text-[#E91E63] uppercase tracking-widest mb-1">Recommended Deep Dive</p>
                            <h5 className="text-sm font-bold text-gray-800 line-clamp-1">{deepDive.title}</h5>
                            <p className="text-[11px] text-gray-500 mt-2 line-clamp-2 italic">"{deepDive.rationale}"</p>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-8 space-y-4">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 animate-pulse">
                            <Youtube size={24} />
                          </div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Searching for YouTube Deep Dive...</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 overflow-x-auto pb-12 scrollbar-hide">
          <Filter className="text-gray-300 mr-4" size={20} />
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                filter === cat 
                ? 'bg-black text-white shadow-xl' 
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredCourses.map((course, i) => {
            const isRecommended = recommendations.some(r => r.id === course.id);
            if (isRecommended && recommendations.length > 0) return null; 
            
            return (
              <div 
                key={course.id}
                onClick={() => onNavigate('course-player', course)}
                className="group cursor-pointer space-y-6 animate-slide-up opacity-0 relative transition-all duration-500 p-4 rounded-[52px]"
                style={{ animationDelay: `${(i % 3) * 0.1}s` }}
              >
                <div className="h-80 rounded-[48px] overflow-hidden relative shadow-lg bg-gray-100">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black scale-50 group-hover:scale-100 transition-transform">
                      <Play size={24} fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-400 uppercase shadow-sm">
                      {course.category}
                    </span>
                  </div>
                </div>
                
                <div className="px-4 pb-4">
                  <h3 className="text-2xl font-medium tracking-tight group-hover:text-[#E91E63] transition-colors mb-4">{course.title}</h3>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest group-hover:text-black transition-colors">Start Module</span>
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all">
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseView;
