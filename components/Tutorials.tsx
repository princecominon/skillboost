
import React, { useState } from 'react';
import { MOCK_TUTORIALS } from '../constants';
import { TutorialVideo } from '../types';
import { Play, Clock, User, Tag, Calendar, ChevronRight, Layout, Video, Share2, MoreHorizontal } from 'lucide-react';

const Tutorials: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(MOCK_TUTORIALS[0]);
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', ...new Set(MOCK_TUTORIALS.map(v => v.category))];

  const filteredVideos = activeCategory === 'All' 
    ? MOCK_TUTORIALS 
    : MOCK_TUTORIALS.filter(v => v.category === activeCategory);

  return (
    <div className="animate-in fade-in duration-700 space-y-12 max-w-7xl mx-auto px-6 md:px-12 pb-24">
      {/* Host Vault Header */}
      <div className="pt-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-1.5 h-6 bg-[#E91E63] rounded-full"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400">Host Uploaded Vault</span>
        </div>
        <h2 className="text-5xl md:text-7xl font-medium tracking-tighter leading-none mb-4">
          Expert <span className="italic font-light text-gray-300">Tutorials</span>
        </h2>
        <p className="text-gray-400 max-w-2xl font-light text-lg">
          Deep-dives curated specifically for SkillBoost students. High-performance techniques, directly from industry leads.
        </p>
      </div>

      {/* Main Theater Player */}
      {selectedVideo && (
        <div className="bg-[#1A0616] rounded-[60px] overflow-hidden shadow-2xl border border-white/5 relative group/player">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-8 aspect-video">
              <iframe 
                width="100%" 
                height="100%" 
                src={`${selectedVideo.videoUrl}?autoplay=0&modestbranding=1&rel=0`} 
                title={selectedVideo.title}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>
            <div className="lg:col-span-4 p-8 lg:p-12 flex flex-col justify-center space-y-8 bg-gradient-to-br from-[#2D0B26] to-black text-white">
              <div className="space-y-4">
                <span className="bg-[#E91E63] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{selectedVideo.category}</span>
                <h3 className="text-3xl font-medium tracking-tight leading-tight">{selectedVideo.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed font-light italic">"{selectedVideo.description}"</p>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10">
                <div className="flex items-center space-x-3">
                  <User size={16} className="text-[#E91E63]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Instructor</span>
                    <span className="text-xs font-bold">{selectedVideo.host}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock size={16} className="text-[#E91E63]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Duration</span>
                    <span className="text-xs font-bold">{selectedVideo.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <button className="flex-1 bg-white text-black py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center space-x-2">
                  <Share2 size={14} />
                  <span>Share Resource</span>
                </button>
                <button className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories & Navigation */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-12">
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 w-full md:w-auto scrollbar-hide">
          <Layout size={18} className="text-gray-300 mr-2" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeCategory === cat ? 'bg-black text-white shadow-xl' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center space-x-4 shrink-0">
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{filteredVideos.length} Tutorials Found</span>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredVideos.map((video) => (
          <div 
            key={video.id}
            onClick={() => { setSelectedVideo(video); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`group cursor-pointer space-y-5 p-4 rounded-[40px] border transition-all duration-500 ${selectedVideo?.id === video.id ? 'bg-[#E91E63]/5 border-[#E91E63]/20 shadow-xl' : 'bg-white border-transparent hover:border-gray-100'}`}
          >
            <div className="aspect-[4/3] rounded-[32px] overflow-hidden relative shadow-md">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black scale-50 group-hover:scale-100 transition-transform">
                  <Play size={20} fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-white">
                {video.duration}
              </div>
            </div>

            <div className="px-2 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#E91E63]">{video.category}</span>
                <span className="text-[9px] font-bold text-gray-300 uppercase">{video.uploadDate}</span>
              </div>
              <h4 className="text-base font-bold text-gray-900 line-clamp-2 leading-tight group-hover:text-[#E91E63] transition-colors">
                {video.title}
              </h4>
              <div className="flex items-center space-x-3 pt-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <User size={12} className="text-gray-400" />
                </div>
                <span className="text-[10px] font-bold text-gray-500">{video.host}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Upload Placeholder for the Host */}
        <div className="border-2 border-dashed border-gray-100 rounded-[40px] flex flex-col items-center justify-center p-8 space-y-4 hover:border-[#E91E63] hover:bg-gray-50 transition-all cursor-pointer group">
          <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-200 group-hover:text-[#E91E63] group-hover:bg-[#E91E63]/5 transition-all">
            <Video size={28} />
          </div>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-black transition-colors">Host Upload</p>
            <p className="text-[9px] text-gray-300 mt-1 uppercase font-bold tracking-tighter">Click to add tutorial</p>
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-[#1A0616] p-12 md:p-20 rounded-[60px] text-white flex flex-col lg:flex-row items-center gap-16 relative overflow-hidden">
        <div className="space-y-6 relative z-10 flex-1">
          <h3 className="text-4xl md:text-5xl font-medium tracking-tighter leading-none">The <span className="text-[#E91E63]">Vault</span> Protocols</h3>
          <p className="text-white/40 text-lg font-light leading-relaxed max-w-lg">
            These tutorials are non-academic, industrial deep-dives. They focus on scalability, production-readiness, and professional standards.
          </p>
          <div className="flex items-center space-x-6 pt-4">
             <div className="flex items-center space-x-2">
                <Calendar size={18} className="text-[#E91E63]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Updates Weekly</span>
             </div>
             <div className="flex items-center space-x-2">
                <Tag size={18} className="text-[#E91E63]" />
                <span className="text-[10px] font-black uppercase tracking-widest">Pro Only</span>
             </div>
          </div>
        </div>
        <div className="flex-shrink-0 relative z-10">
          <button className="bg-white text-black px-12 py-5 rounded-[24px] text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-transform flex items-center space-x-4">
            <span>Unlock Premium Tutorials</span>
            <ChevronRight size={18} />
          </button>
        </div>
        {/* Background glow */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#E91E63]/20 blur-[100px] pointer-events-none"></div>
      </div>
    </div>
  );
};

export default Tutorials;
