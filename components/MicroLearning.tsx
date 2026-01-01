import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle2, Search, RefreshCw, ArrowRight, Sparkles, LogOut, X } from 'lucide-react';
import { LEADERBOARD } from '../constants';
import { generateTopicQuiz, saveQuizResult, getLeaderboard } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import AuthFlow from './AuthFlow'; // Import the new Login Component

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

const MicroLearning: React.FC = () => {
  // --- AUTH STATE ---
  // We replaced 'username' string with the full Supabase 'user' object
  const [user, setUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // --- APP STATE ---
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  // 1. CHECK SESSION ON LOAD (Logic to handle Login persistence)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. AUTO-SAVE TO LEADERBOARD
  useEffect(() => {
    if (showResults && quizQuestions.length > 0 && user) {
      // LOGIC: Get the real name from the logged-in user's metadata
      const displayName = user.user_metadata.full_name || user.email?.split('@')[0] || "Student";
      
      saveQuizResult(displayName, topic, score, quizQuestions.length);
      
      setTimeout(() => {
        getLeaderboard().then(data => setLeaderboardData(data));
      }, 1000);
    }
  }, [showResults, user]);

  useEffect(() => {
    getLeaderboard().then(data => {
      if (data && data.length > 0) setLeaderboardData(data);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveQuiz(false);
    setShowResults(false);
    setTopic('');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    // VALIDATION REMOVED: We don't need to check !username because user is already logged in.

    setIsGenerating(true);
    // Note: service uses gemini-3-flash-preview as requested
    const questions = await generateTopicQuiz(topic);
    
    if (questions && questions.length > 0) {
      setQuizQuestions(questions);
      setActiveQuiz(true);
      setCurrentStep(0);
      setScore(0);
      setShowResults(false);
    } else {
      alert("Failed to synthesize quiz. Please try a different topic.");
    }
    setIsGenerating(false);
  };

  const handleAnswerSelect = (index: number) => {
    if (index === quizQuestions[currentStep].correctAnswer) {
      setScore(prev => prev + 1);
    }

    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetAll = () => {
    setActiveQuiz(false);
    setShowResults(false);
    setTopic('');
    setQuizQuestions([]);
  };

  // --- RENDER LOGIC ---

  // 1. Loading Screen (while checking if user is logged in)
  if (loadingSession) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  // 2. IF NOT LOGGED IN -> SHOW NEW AUTH FLOW
  if (!user) {
    return <AuthFlow onLogin={() => {}} />;
  }

  // 3. IF LOGGED IN -> SHOW DASHBOARD
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      <div className="lg:col-span-2 space-y-6">
        {showResults ? (
          <div className="bg-white p-12 rounded-[40px] border border-gray-100 shadow-xl text-center space-y-8 animate-slide-up">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-lg shadow-green-100/50">
              <Trophy size={48} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Quiz Complete!</h2>
              {/* DISPLAY REAL NAME IN RESULTS */}
              <p className="text-gray-400 mt-2 font-medium">Player: <span className="text-black font-bold">{user.user_metadata.full_name || user.email?.split('@')[0]}</span></p>
            </div>
            
            <div className="flex justify-center space-x-12">
              <div className="text-center">
                <p className="text-4xl font-black text-black">{score}/{quizQuestions.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Correct Answers</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-black text-[#E91E63]">+{score * 50}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">XP Earned</p>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50 flex gap-4">
              <button 
                onClick={resetAll}
                className="flex-1 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-[10px]"
              >
                New Topic
              </button>
              <button 
                onClick={() => { setShowResults(false); setCurrentStep(0); setScore(0); }}
                className="flex-1 py-4 bg-black text-white font-bold rounded-2xl hover:bg-[#E91E63] transition-all uppercase tracking-widest text-[10px]"
              >
                Retake Quiz
              </button>
            </div>
          </div>
        ) : activeQuiz ? (
          <div className="bg-white p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-2xl relative overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between mb-12">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#E91E63] uppercase tracking-[0.3em]">Module Active</span>
                <p className="text-xs font-bold text-gray-400 uppercase">Question {currentStep + 1} of {quizQuestions.length}</p>
              </div>
              <button onClick={resetAll} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-black transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="h-1.5 w-full bg-gray-50 rounded-full mb-12 overflow-hidden">
              <div 
                className="h-full bg-[#E91E63] transition-all duration-700 ease-out"
                style={{ width: `${((currentStep + 1) / quizQuestions.length) * 100}%` }}
              ></div>
            </div>

            <h3 className="text-2xl md:text-3xl font-medium text-gray-900 mb-10 tracking-tight leading-tight">
              {quizQuestions[currentStep].question}
            </h3>
            
            <div className="space-y-4">
              {quizQuestions[currentStep].options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => handleAnswerSelect(i)}
                  className="w-full p-6 text-left border border-gray-100 bg-white hover:border-[#E91E63] hover:shadow-xl hover:shadow-[#E91E63]/5 rounded-[24px] transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center relative z-10">
                    <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#E91E63] group-hover:text-white flex items-center justify-center text-xs font-black mr-6 transition-all">
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="text-gray-600 font-medium group-hover:text-black transition-colors leading-relaxed">{opt}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#E91E63]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-[#1A0616] p-10 md:p-16 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3">
                    <Sparkles size={24} className="text-[#E91E63] animate-pulse" />
                    <span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#E91E63]">Synthesis Engine v2.5</span>
                 </div>
                 {/* Logout Button */}
                 <button onClick={handleLogout} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                    <LogOut size={14} />
                    <span>Sign Out</span>
                 </button>
              </div>
              
              <h2 className="text-5xl md:text-7xl font-medium mb-6 tracking-tighter leading-[0.9]">
                Welcome, <br /> <span className="italic font-light text-[#E91E63]">{user.user_metadata.full_name?.split(' ')[0] || user.email?.split('@')[0]}</span>
              </h2>
              
              <p className="text-white/40 text-lg mb-12 max-w-md font-light leading-relaxed">
                What topic are we mastering today?
              </p>
              
              <form onSubmit={handleGenerate} className="max-w-xl space-y-4">
                {/* --- NAME BOX REMOVED (User is logged in) --- */}

                <div className="relative group">
                  <Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isGenerating ? 'text-[#E91E63] animate-spin' : 'text-white/20'}`} size={20} />
                  <input 
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic: e.g. Kubernetes Cluster Autoscaling"
                    className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 pl-16 pr-8 text-sm focus:outline-none focus:border-[#E91E63] focus:bg-white/10 transition-all placeholder:text-white/10"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isGenerating || !topic.trim()}
                  className="w-full md:w-auto px-12 py-5 bg-[#E91E63] text-white font-black rounded-[24px] hover:opacity-90 transition-all shadow-2xl shadow-[#E91E63]/20 flex items-center justify-center space-x-4 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest text-[11px]"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Synthesizing Quiz...</span>
                    </>
                  ) : (
                    <>
                      <span>Launch Assessment</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#E91E63]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] pointer-events-none"></div>
          </div>
        )}

        {/* LEADERBOARD SECTION */}
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Industry Milestones</h3>
            <span className="text-[10px] font-black text-[#E91E63] uppercase cursor-pointer hover:underline">View All</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'Fast Starter', color: 'bg-blue-50 text-blue-500' },
              { label: 'Deep Thinker', color: 'bg-purple-50 text-purple-500' },
              { label: 'Gap Closer', color: 'bg-green-50 text-green-500' },
              { label: 'Mastery', color: 'bg-orange-50 text-orange-500' }
            ].map((badge, i) => (
              <div key={i} className="flex flex-col items-center p-6 bg-gray-50 rounded-[32px] border border-gray-100 hover:scale-105 transition-transform cursor-pointer">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm ${badge.color}`}>
                  <CheckCircle2 size={24} />
                </div>
                <span className="text-[9px] text-gray-400 font-black uppercase text-center tracking-widest">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-8 md:p-10 rounded-[48px] border border-gray-100 shadow-xl overflow-hidden relative">
          <div className="flex items-center justify-between mb-10 relative z-10">
            <h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Department Ranks</h3>
            <Trophy className="text-yellow-500" size={20} />
          </div>
          
          <div className="space-y-5 relative z-10">
            {(leaderboardData.length > 0 ? leaderboardData : LEADERBOARD).map((user, idx) => (
              <div key={idx} className={`flex items-center justify-between p-4 rounded-[28px] transition-all ${idx === 0 ? 'bg-[#1A0616] text-white shadow-xl shadow-[#1A0616]/20' : 'hover:bg-gray-50'}`}>
                <div className="flex items-center space-x-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${idx === 0 ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-500' : 'bg-gray-50 text-gray-400'}`}>
                    {idx + 1}
                  </span>
                  <div>
                    {/* Shows Real Name */}
                    <p className={`text-xs font-bold tracking-tight ${idx === 0 ? 'text-white' : 'text-gray-900'}`}>
                      {user.name || `Student ${idx + 1}`}
                    </p>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-40">
                      {user.topic || "Engineering"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black">{user.score}</p>
                  <p className="text-[8px] font-black uppercase tracking-widest opacity-40">XP</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-10 py-5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-[24px] hover:bg-black hover:text-white transition-all">
            Expand Rankings
          </button>
          
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#E91E63]/5 rounded-full blur-[40px] pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

export default MicroLearning;