import React, { useState } from 'react';
import { Play, Clock, User, Share2, MoreHorizontal, X, ChevronRight, Lock, Crown } from 'lucide-react';

// 1. Define Type Locally
interface TutorialVideo {
  id: string;
  title: string;
  description: string;
  host: string;
  category: string;
  duration: string;
  uploadDate: string;
  thumbnail: string;
  videoUrl: string;
}

// 2. The Video Data (Pointing to your local file)
const VAULT_CONTENT: TutorialVideo[] = [
  {
    id: '1',
    title: 'C or C++? What coding language should you learn?',
    description: 'A deep dive into the foundational differences between C and C++, exploring memory management, object-oriented concepts, and which one builds a stronger engineering base for beginners.',
    host: 'Apni Kaksha',
    category: 'Career Guidance',
    duration: '03:06',
    uploadDate: 'Today',
    thumbnail: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1000&auto=format&fit=crop',
    // ✅ THIS POINTS TO YOUR LOCAL FILE IN PUBLIC FOLDER
    videoUrl: '/demo.mp4' 
  }
];

const Tutorials: React.FC = () => {
  const [selectedVideo, setSelectedVideo] = useState<TutorialVideo | null>(VAULT_CONTENT[0]);
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div className="animate-in fade-in duration-700 space-y-12 max-w-7xl mx-auto px-6 md:px-12 py-12 pb-32">
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tight text-[#1A1A1A] mb-2">
          The Vault
        </h1>
        <p className="text-gray-500">Curated masterclasses and technical deep dives.</p>
      </div>

      {/* Main Theater Player */}
      {selectedVideo && (
        <div className="bg-[#1A0616] rounded-[40px] overflow-hidden shadow-2xl border border-white/5 relative group/player">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Video Area */}
            <div className="lg:col-span-8 aspect-video bg-black relative">
              {/* ✅ HTML5 Video Tag for Local File */}
              <video 
                controls 
                className="w-full h-full object-cover"
                poster={selectedVideo.thumbnail}
                src={selectedVideo.videoUrl}
              >
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Info Area */}
            <div className="lg:col-span-4 p-8 flex flex-col justify-center space-y-6 bg-gradient-to-br from-[#2D0B26] to-black text-white">
              <div className="space-y-4">
                <span className="bg-[#E91E63] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {selectedVideo.category}
                </span>
                <h3 className="text-2xl font-bold leading-tight">{selectedVideo.title}</h3>
                <p className="text-white/40 text-xs leading-relaxed font-light">
                  {selectedVideo.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/10">
                <div className="flex items-center space-x-3">
                  <User size={14} className="text-[#E91E63]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Host</span>
                    <span className="text-xs font-bold">{selectedVideo.host}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock size={14} className="text-[#E91E63]" />
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Time</span>
                    <span className="text-xs font-bold">{selectedVideo.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button className="flex-1 bg-white text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center space-x-2">
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
                <button className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all">
                  <MoreHorizontal size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unlock Premium Section */}
      <div className="relative bg-[#1A0616] rounded-[40px] p-10 md:p-20 overflow-hidden text-center border border-gray-900 shadow-2xl">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[600px] h-[400px] bg-[#E91E63] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#E91E63] to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-[#E91E63]/20 rotate-3">
            <Crown size={32} className="text-white" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6 leading-[0.9]">
            Unlock <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E63] to-purple-400">Premium Tutorials</span>
          </h2>

          <p className="text-white/40 text-lg mb-10 leading-relaxed">
            Get instant access to 500+ hours of advanced system design, architectural patterns, and CTO-level masterclasses.
          </p>

          <button 
            onClick={() => setShowPopup(true)}
            className="px-10 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-2"
          >
            <span>Get Premium Access</span>
            <ChevronRight size={14} />
          </button>

          <div className="mt-12 flex items-center justify-center gap-8 opacity-30">
             <div className="flex items-center gap-2">
                <Lock size={14} className="text-white" />
                <span className="text-white text-xs font-bold uppercase tracking-widest">System Design</span>
             </div>
             <div className="flex items-center gap-2">
                <Lock size={14} className="text-white" />
                <span className="text-white text-xs font-bold uppercase tracking-widest">Cloud Arch</span>
             </div>
          </div>
        </div>
      </div>

      {/* Contact Popup */}
      {showPopup && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center px-6 animate-in fade-in duration-200"
          onClick={() => setShowPopup(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[32px] p-8 max-w-sm w-full relative shadow-2xl animate-in zoom-in-95 duration-200"
          >
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors"
            >
              <X size={20} />
            </button>

            <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Lock size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Work in Progress</h3>
                <p className="text-sm text-gray-500 leading-relaxed px-4">
                  We are currently onboarding industry partners. For early access or inquiries, please contact:
                </p>
                <div className="bg-gray-50 py-3 px-4 rounded-xl border border-gray-100">
                    <p className="text-xs font-bold text-[#E91E63] select-all">prince.com.in.on@gmail.com</p>
                </div>
                <button 
                    onClick={() => setShowPopup(false)}
                    className="w-full py-3 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-gray-800"
                >
                    Got it
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tutorials;