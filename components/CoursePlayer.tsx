import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { 
  ArrowLeft, 
  CheckCircle2, 
  MessageSquare, 
  HelpCircle, 
  Sparkles, 
  Youtube, 
  Info, 
  PlayCircle,
  AlertTriangle
} from 'lucide-react';

interface CoursePlayerProps {
  course: Course;
  onBack: () => void;
}

const CoursePlayer: React.FC<CoursePlayerProps> = ({ course, onBack }) => {
  const [activeTab, setActiveTab] = useState<'syllabus' | 'quiz' | 'notes'>('syllabus');
  
  // DEBUGGING: Log the URL to the console immediately
  useEffect(() => {
    console.log("--------------------------------");
    console.log("PLAYER LOADED FOR COURSE:", course.title);
    console.log("RAW VIDEO URL:", course.videoUrl);
    console.log("IS YOUTUBE detected?:", course.videoUrl?.includes('youtu'));
    console.log("--------------------------------");
  }, [course]);

  // Detect if this is an AI-generated recovery path
  const isAiSourced = course.id.toString().startsWith('ai-') || course.id.toString().startsWith('industrial-');

  // 1. HELPER: Detect if it's YouTube
  const isYouTube = (url: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // 2. HELPER: Get Embed URL for YouTube
  const getYouTubeEmbed = (url: string) => {
    if (!url) return '';
    if (url.includes('embed')) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|.*\/)([^&?]*))/);
    return match && match[1] ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  // 3. RENDERER: Decides which player to use
  const renderPlayer = () => {
    const url = course.videoUrl;

    // ERROR STATE: No URL found
    if (!url) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white space-y-4">
          <AlertTriangle size={48} className="text-red-500 opacity-80" />
          <p className="text-xs font-mono font-bold text-red-400">VIDEO SOURCE MISSING</p>
          <p className="text-[10px] text-gray-500 max-w-xs text-center">
            The database has no link for this course. Please check the 'video_url' column in Supabase.
          </p>
        </div>
      );
    }

    // YOUTUBE STATE
    if (isYouTube(url)) {
      return (
        <iframe 
          width="100%" 
          height="100%" 
          src={`${getYouTubeEmbed(url)}?autoplay=0&modestbranding=1&rel=0`} 
          title={course.title}
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen
          className="w-full h-full"
        />
      );
    }

    // DIRECT FILE STATE (Supabase/MP4)
    return (
      <video 
        controls 
        controlsList="nodownload"
        width="100%" 
        height="100%"
        className="w-full h-full object-contain bg-black"
        key={url} // Force React to reload if URL changes
      >
        <source src={url} type="video/mp4" />
        <p className="text-white text-center pt-20">
          Your browser does not support the video tag.
        </p>
      </video>
    );
  };

  const syllabusItems = [
    { title: "Foundational Context", duration: "05:00", completed: true },
    { title: "Industrial Bridge Analysis", duration: "12:30", completed: false },
    { title: "Core Skill Implementation", duration: course.duration || "15:00", completed: false },
    { title: "Knowledge Gap Assessment", duration: "Quiz", completed: false },
  ];

  const currentProgress = course.progress || 0;

  return (
    <div className="min-h-screen bg-[#FDFCFE] animate-in fade-in duration-700">
      
      {/* Cinematic Player Layout */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
        <button 
          onClick={onBack}
          className="group flex items-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-black mb-8 transition-colors"
        >
          <ArrowLeft size={16} className="mr-3 group-hover:-translate-x-1 transition-transform" /> 
          Return to Pathway
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl relative group">
              
              {/* --- THE HYBRID PLAYER COMPONENT --- */}
              {renderPlayer()}
              {/* ----------------------------------- */}
              
              {isAiSourced && (
                <div className="absolute top-6 left-6 pointer-events-none">
                  <div className="bg-red-600/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center space-x-2 text-white text-[9px] font-black tracking-widest uppercase shadow-lg">
                    <Youtube size={12} />
                    <span>External Discovery</span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    {isAiSourced ? (
                        <>
                            <Sparkles size={16} className="text-[#E91E63]" />
                            <span className="text-[10px] font-bold text-[#E91E63] uppercase tracking-[0.2em]">Current Recovery Module</span>
                        </>
                    ) : (
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{course.category} Module</span>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-medium tracking-tight text-gray-900 leading-tight">
                    {course.title}
                  </h1>
                </div>
                
                {/* Linked Progress Bar */}
                <div className="flex items-center space-x-3">
                   <div className="h-2 w-32 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#E91E63] transition-all duration-1000" 
                        style={{ width: `${currentProgress}%` }}
                      ></div>
                   </div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase min-w-[30px]">
                     {currentProgress}%
                   </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {course.skills.map(skill => (
                  <span key={skill} className="px-4 py-1.5 bg-gray-50 text-gray-500 text-[10px] font-bold uppercase tracking-widest rounded-full border border-gray-100">
                    {skill}
                  </span>
                ))}
              </div>

              <div className="prose prose-sm max-w-none text-gray-500 leading-relaxed font-light">
                <p>{course.description}</p>
              </div>

              {isAiSourced && (
                <div className="p-6 bg-[#E91E63]/5 rounded-3xl border border-[#E91E63]/10 flex items-start space-x-4">
                  <div className="w-10 h-10 bg-[#E91E63] rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#E91E63]/20">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#E91E63] uppercase tracking-widest mb-1">AI Strategic Intelligence</h4>
                    <p className="text-xs text-gray-600 italic leading-relaxed">This video was selected as the optimal recovery path for your career goal. It covers professional nuances often omitted in academic settings.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Interaction Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full min-h-[500px]">
              <div className="flex border-b border-gray-50 bg-gray-50/50 p-2">
                {(['syllabus', 'quiz', 'notes'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-[30px] ${
                      activeTab === tab ? 'bg-white text-[#E91E63] shadow-sm' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === 'syllabus' && (
                  <div className="space-y-6">
                    {syllabusItems.map((item, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start group cursor-pointer ${item.completed ? 'opacity-50' : ''}`}
                      >
                        <div className="mr-4 mt-1">
                          {item.completed ? (
                            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                              <CheckCircle2 size={12} />
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-gray-200 rounded-full flex items-center justify-center text-gray-200 group-hover:border-[#E91E63] group-hover:text-[#E91E63] transition-colors">
                              <div className="w-2 h-2 bg-transparent rounded-full group-hover:bg-[#E91E63]"></div>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-bold text-gray-800 tracking-tight leading-tight">{item.title}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{item.duration}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Keep quiz and notes tabs standard */}
                {activeTab === 'quiz' && (
                  <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                      <HelpCircle size={32} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-widest text-gray-800">Gap Check</h4>
                      <p className="text-[11px] text-gray-400 mt-2 max-w-[200px] mx-auto">Complete the video to unlock industry-standard verification.</p>
                    </div>
                  </div>
                )}

                {activeTab === 'notes' && (
                  <div className="flex flex-col h-full space-y-6">
                    <div className="p-4 bg-yellow-50/50 rounded-2xl border border-yellow-100/50">
                      <p className="text-[10px] text-yellow-700 font-medium">Tip: Jot down industry terms you don't recognize. We'll define them later.</p>
                    </div>
                    <textarea 
                      placeholder="Start capturing your industrial notes..."
                      className="flex-1 w-full bg-gray-50 border-none rounded-2xl p-4 text-xs text-gray-600 focus:ring-1 focus:ring-[#E91E63]/20 resize-none font-light italic focus:outline-none"
                    />
                    <button className="w-full py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center space-x-3 hover:bg-[#E91E63] transition-all">
                      <MessageSquare size={14} />
                      <span>Sync to Profile</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursePlayer;