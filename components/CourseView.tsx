import React, { useState, useEffect } from 'react';
import { MOCK_COURSES } from '../constants';
import { View, Course } from '../types';
import { 
  Filter, 
  Sparkles, 
  RefreshCcw, 
  BrainCircuit, 
  Activity, 
  ChevronRight, 
  Info, 
  Play, 
  Youtube,
  X
} from 'lucide-react';
import { 
  recommendCourses, 
  findRecoveryVideos, 
  getYouTubeID,
  getRecoveryPath 
} from '../services/geminiService';
import { supabase } from '../lib/supabase';

interface CourseViewProps {
  onNavigate: (view: View, course?: Course) => void;
  initialSearch?: string;
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

interface RecoveryStep {
  title: string;
  description: string;
  youtubeLink: string;
}

const CourseView: React.FC<CourseViewProps> = ({ onNavigate, initialSearch = '' }) => {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [filter, setFilter] = useState('All');

  // Sync prop changes to local state
  useEffect(() => {
    setSearchTerm(initialSearch);
  }, [initialSearch]);

  // FETCH REAL DATA FROM SUPABASE
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.from('courses').select('*');
        
        if (error) throw error;

        if (data && data.length > 0) {
          // MAP DB DATA TO FRONTEND INTERFACE
          const mappedCourses: Course[] = data.map((item: any) => ({
            id: item.id,
            title: item.title,
            category: item.category,
            thumbnail: item.thumbnail,
            description: item.description,
            // Check both snake_case (DB) and camelCase
            videoUrl: item.video_url || item.videoUrl || "", 
            duration: item.duration,
            skills: item.skills || [],
            // ✅ FIX: Added progress property to satisfy TypeScript
            progress: item.progress || 0
          }));
          setCourses(mappedCourses);
        }
      } catch (err) {
        console.error("Using Mock Data due to DB error:", err);
      } finally {
        setIsLoadingDB(false);
      }
    };

    fetchCourses();
  }, []);

  // AI State
  const [aiGoal, setAiGoal] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [deepDives, setDeepDives] = useState<Record<string, DeepDiveVideo>>({});
  const [recoveryPath, setRecoveryPath] = useState<RecoveryStep[] | null>(null);
  const [videoLoadingId, setVideoLoadingId] = useState<string | null>(null);

  const categories = ['All', 'CS Core', 'Technical', 'Soft Skills', 'Aptitude'];

  // FILTER LOGIC
  const filteredCourses = courses.filter(course => {
    const matchesCategory = filter === 'All' || course.category === filter;
    
    const term = searchTerm.toLowerCase();
    const matchesSearch = !term || 
      course.title.toLowerCase().includes(term) ||
      course.skills.some(skill => skill.toLowerCase().includes(term));

    return matchesCategory && matchesSearch;
  });

  const saveSearchHistory = async (query: string) => {
    const timestamp = new Date().toISOString();
    
    // Local Storage Backup
    try {
      const localHistory = JSON.parse(localStorage.getItem('search_history') || '[]');
      const newEntry = { search_query: query, created_at: timestamp };
      const updatedHistory = [newEntry, ...localHistory].slice(0, 10);
      localStorage.setItem('search_history', JSON.stringify(updatedHistory));
    } catch (e) { console.error(e); }

    // Supabase Storage
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const meta = session.user.user_metadata;
        await supabase.from('search_history').insert({
          user_email: session.user.email,
          user_name: meta.full_name || session.user.email?.split('@')[0],
          search_query: query,
          created_at: timestamp
        });
      }
    } catch (e) { console.warn("Supabase save failed:", e); }
  };

  const handleAiSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiGoal.trim()) return;
    
    await saveSearchHistory(aiGoal);
    setIsAiLoading(true);
    setRecommendations([]);
    setDeepDives({}); 
    setRecoveryPath(null);

    try {
      const recsPromise = recommendCourses(aiGoal, courses);
      const pathPromise = getRecoveryPath(aiGoal);
      const [recs, pathData] = await Promise.all([recsPromise, pathPromise]);
      
      setRecommendations(recs);
      if (pathData && pathData.steps) {
        setRecoveryPath(pathData.steps);
      }

    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("System busy. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFetchVideo = async (courseId: string, searchKey: string) => {
    setVideoLoadingId(courseId);
    try {
      const videoData = await findRecoveryVideos(searchKey);
      if (videoData) {
        setDeepDives(prev => ({
          ...prev,
          [courseId]: {
            id: courseId,
            title: videoData.title,
            url: videoData.url,
            rationale: videoData.rationale || 'Bridging the gap with industry standards.'
          }
        }));
      }
    } catch (error) {
      alert("Rate limit reached. Wait 10s.");
    } finally {
      setVideoLoadingId(null);
    }
  };

  const getAiReason = (courseId: string) =>
    recommendations.find(r => r.id === courseId)?.reason;

  const openDeepDive = (video: DeepDiveVideo, course: Course) => {
    const videoId = getYouTubeID(video.url);
    if (!videoId) {
      onNavigate('course-player', course);
      return;
    }
    // Create a virtual course object for the AI video
    const virtualCourse: Course = {
      ...course,
      id: `ai-${video.id}-${Date.now()}`,
      title: `[AI] ${video.title}`,
      description: video.rationale,
      videoUrl: `https://www.youtube.com/embed/${videoId}`,
      category: 'Technical',
      progress: 0 // Added here as well for consistency
    };
    onNavigate('course-player', virtualCourse);
  };

  const recommendedCoursesList = recommendations
    .map(rec => courses.find(c => c.id === rec.id))
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
            </div>
            
            <div className="w-full lg:max-w-xl">
              <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-2xl shadow-2xl relative">
                <form onSubmit={handleAiSearch} className="space-y-6">
                  <div className="relative">
                    <BrainCircuit 
                      className={`absolute left-6 top-6 transition-all duration-500 ${isAiLoading ? 'text-[#E91E63] animate-spin' : 'text-white/20'}`} 
                      size={24} 
                    />
                    <textarea 
                      value={aiGoal}
                      onChange={(e) => setAiGoal(e.target.value)}
                      placeholder="e.g. 'I want to master Python Data Structures'" 
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-16 pr-6 text-sm focus:outline-none focus:border-[#E91E63] focus:bg-white/10 transition-all placeholder:text-white/10 resize-none h-32"
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isAiLoading}
                    className="w-full bg-[#E91E63] text-white py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] hover:opacity-90 transition-all disabled:opacity-50 shadow-xl shadow-[#E91E63]/20 flex items-center justify-center space-x-3"
                  >
                    {isAiLoading ? (
                      <><RefreshCcw size={16} className="animate-spin" /><span>Generating Path...</span></>
                    ) : (
                      <><Sparkles size={16} /><span>Generate Recovery Path</span></>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-20">
        
        {/* === SEARCH FILTER INDICATOR === */}
        {searchTerm && (
          <div className="mb-8 animate-slide-up flex items-center gap-4">
             <div className="bg-black text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-xl">
               <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Filtering by:</span>
               <span className="font-bold text-[#E91E63]">"{searchTerm}"</span>
               <button onClick={() => setSearchTerm('')} className="hover:text-red-400 transition-colors ml-2">
                 <X size={14} />
               </button>
             </div>
          </div>
        )}

        {/* === RECOVERY PATH SECTION === */}
        {recoveryPath && (
          <div className="mb-20 animate-slide-up">
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-black">Your Action Plan</h3>
              <div className="h-px bg-gray-200 flex-1 mx-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recoveryPath.map((step, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-lg flex flex-col relative overflow-hidden group hover:-translate-y-2 transition-transform duration-500">
                  <div className="absolute top-0 right-0 p-4 opacity-10 font-black text-6xl text-gray-200 select-none">
                    {idx + 1}
                  </div>
                  
                  <div className="w-10 h-10 bg-[#1A0616] rounded-full flex items-center justify-center text-white font-bold mb-4 shadow-md z-10">
                    {idx + 1}
                  </div>
                  
                  <h4 className="font-bold text-lg leading-tight mb-2 z-10">{step.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed mb-6 flex-1 z-10">{step.description}</p>
                  
                  <a 
                    href={step.youtubeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors z-10"
                  >
                    <Youtube size={14} />
                    <span>Watch Tutorial</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Course Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-24 animate-slide-up">
            <div className="flex items-center justify-between mb-8 px-4">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-gray-400">Recommended Modules</h3>
              <button 
                onClick={() => { setRecommendations([]); setDeepDives({}); setRecoveryPath(null); }}
                className="text-[10px] font-bold text-[#E91E63] uppercase tracking-widest flex items-center space-x-2 hover:underline"
              >
                <RefreshCcw size={12} />
                <span>Reset</span>
              </button>
            </div>
            
            <div className="space-y-12">
              {recommendedCoursesList.map((course, idx) => {
                const reason = getAiReason(course.id);
                const deepDive = deepDives[course.id];
                const isLoadingVideo = videoLoadingId === course.id;
                
                return (
                  <div key={course.id} className="relative group bg-white border border-gray-100 p-8 rounded-[48px] shadow-xl flex flex-col xl:flex-row gap-8">
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white shrink-0">
                          <span className="text-xl font-black">{idx + 1}</span>
                        </div>
                        <div>
                          <h4 className="text-2xl font-medium tracking-tight group-hover:text-[#E91E63] transition-colors">{course.title}</h4>
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

                      <div className="flex gap-4 pt-2">
                        <button 
                          onClick={() => onNavigate('course-player', course)}
                          className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-black hover:text-[#E91E63] transition-colors"
                        >
                          <span>Open Local Module</span>
                          <ChevronRight size={14} />
                        </button>

                        {!deepDive && (
                          <button 
                            onClick={() => handleFetchVideo(course.id, course.skills[0] || course.title)} 
                            disabled={isLoadingVideo}
                            className="flex items-center space-x-3 text-xs font-black uppercase tracking-widest text-[#E91E63] hover:opacity-80 transition-colors"
                          >
                            {isLoadingVideo ? <RefreshCcw size={14} className="animate-spin" /> : <Youtube size={14} />}
                            <span>{isLoadingVideo ? "Synthesizing..." : "Show AI Video Case"}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="xl:w-1/2 w-full">
                      {deepDive ? (
                        <div className="h-full flex flex-col space-y-4">
                          <div 
                            onClick={() => openDeepDive(deepDive, course)}
                            className="relative aspect-video rounded-3xl overflow-hidden bg-black shadow-lg cursor-pointer group/video"
                          >
                             {getYouTubeID(deepDive.url) && (
                                <img 
                                  src={`https://img.youtube.com/vi/${getYouTubeID(deepDive.url)}/maxresdefault.jpg`} 
                                  className="w-full h-full object-cover" 
                                  alt={deepDive.title} 
                                />
                             )}
                             <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black shadow-2xl group-hover:scale-110 transition-transform">
                                   <Play size={24} fill="currentColor" />
                                </div>
                             </div>
                             <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black flex items-center space-x-2">
                                <Youtube size={12} />
                                <span>AI SOURCED</span>
                             </div>
                          </div>
                          <div className="px-2">
                            <h5 className="text-sm font-bold text-gray-800 line-clamp-1">{deepDive.title}</h5>
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-1 italic">"{deepDive.rationale}"</p>
                          </div>
                        </div>
                      ) : (
                        <div className="aspect-video bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center p-8 space-y-4">
                          <div className={`w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-300 ${isLoadingVideo ? 'animate-bounce' : ''}`}>
                            <Youtube size={24} />
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                              {isLoadingVideo ? "Calling Gemini API..." : "AI Video Case Available"}
                            </p>
                            {!isLoadingVideo && <p className="text-[9px] text-gray-300">Click button to generate industry deep-dive</p>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Standard Catalog Grid */}
        {recommendations.length === 0 && !recoveryPath && (
          <div>
            {/* Category Filters */}
            <div className="flex flex-wrap gap-4 mb-12">
               {categories.map((cat) => (
                 <button
                   key={cat}
                   onClick={() => setFilter(cat)}
                   className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                     filter === cat 
                       ? 'bg-black text-white shadow-lg' 
                       : 'bg-white border border-gray-200 text-gray-400 hover:border-gray-400'
                   }`}
                 >
                   {cat}
                 </button>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
              {isLoadingDB ? (
                // Loading Skeleton
                [1,2,3].map(i => (
                  <div key={i} className="h-80 bg-gray-100 rounded-[52px] animate-pulse" />
                ))
              ) : filteredCourses.length > 0 ? (
                filteredCourses.map((course, i) => (
                  <div 
                    key={course.id}
                    onClick={() => onNavigate('course-player', course)}
                    className="group cursor-pointer space-y-6 animate-slide-up opacity-0 relative transition-all duration-500 p-4 rounded-[52px]"
                    style={{ animationDelay: `${(i % 3) * 0.1}s` }}
                  >
                    <div className="h-80 rounded-[48px] overflow-hidden relative shadow-lg bg-gray-100">
                      <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute top-6 left-6">
                        <span className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-bold text-gray-400 uppercase shadow-sm">
                          {course.category}
                        </span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-medium tracking-tight group-hover:text-[#E91E63] transition-colors">{course.title}</h3>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20">
                  <p className="text-gray-400 text-sm">No courses found matching "{searchTerm}"</p>
                  <button onClick={() => setSearchTerm('')} className="mt-4 text-[#E91E63] font-bold uppercase text-xs">Clear Search</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseView;