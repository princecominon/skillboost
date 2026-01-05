import React, { useEffect, useState } from 'react';
import { Rocket, Zap, Sparkles } from 'lucide-react';

interface SplashViewProps {
  onFinish: () => void;
}

const SplashView: React.FC<SplashViewProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Trigger entrance animation
    setIsVisible(true);

    // 2. Wait for 2.5 seconds, then tell App.tsx we are done
    const timer = setTimeout(() => {
      setIsVisible(false); // Trigger exit animation (optional)
      setTimeout(onFinish, 500); // Wait for exit animation
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-[9999] bg-[#1a0616] flex flex-col items-center justify-center transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#E91E63] rounded-full blur-[120px] opacity-20 animate-pulse pointer-events-none"></div>

      <div className={`relative z-10 flex flex-col items-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#E91E63] blur-2xl opacity-40 animate-pulse"></div>
          <Rocket size={64} className="text-white relative z-10" strokeWidth={1.5} />
          <Sparkles size={24} className="text-[#E91E63] absolute -top-2 -right-4 animate-bounce" />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4">
          SKILL<span className="text-[#E91E63]">BOOST</span>
        </h1>

        {/* Tagline / Loading Bar */}
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
            <Zap size={12} className="text-[#E91E63] fill-[#E91E63]" />
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em]">System Initializing</span>
          </div>

          {/* Loading Progress Bar */}
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-[#E91E63] animate-[loading_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Footer Version */}
      <div className="absolute bottom-12 text-white/20 text-[10px] font-mono tracking-widest">
        v2.5.0 // SYNTHESIS ENGINE
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default SplashView;