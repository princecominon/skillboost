import React, { useState, useEffect } from 'react';
// FIX: Added 'X' to the imports below
import { Trophy, CheckCircle2, Search, RefreshCw, ArrowRight, Sparkles, LogOut, Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import { LEADERBOARD } from '../constants';
import { generateTopicQuiz, saveQuizResult, getLeaderboard } from '../services/geminiService';
import { supabase } from '../lib/supabase';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

const MicroLearning: React.FC = () => {
  // --- AUTH STATE ---
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- APP STATE ---
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);

  // 1. CHECK SESSION ON LOAD
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. AUTO-SAVE TO LEADERBOARD
  useEffect(() => {
    if (showResults && quizQuestions.length > 0 && user) {
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

  // --- AUTH FUNCTIONS ---
  
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) alert(error.message);
      else alert("Account created! You are logged in.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveQuiz(false);
    setShowResults(false);
    setTopic('');
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setIsGenerating(true);
    
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
    if (index === quizQuestions[currentStep].correctAnswer) setScore(prev => prev + 1);
    if (currentStep < quizQuestions.length - 1) setCurrentStep(prev => prev + 1);
    else setShowResults(true);
  };

  // --- LOGIN SCREEN UI ---
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black p-4 font-sans text-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
             <div className="mx-auto h-12 w-12 rounded-full bg-white flex items-center justify-center mb-6">
                <Sparkles className="text-black" size={24} />
             </div>
             <h2 className="text-3xl font-bold tracking-tight">
               {isSignUp ? "Create Account" : "Welcome Back"}
             </h2>
             <p className="mt-2 text-sm text-gray-400">
               {isSignUp ? "Sign up to start your journey" : "Please enter your details to sign in"}
             </p>
          </div>

          <form className="space-y-6" onSubmit={handleEmailAuth}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-[#1A1A1A] py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white sm:text-sm transition-all outline-none"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-white/10 bg-[#1A1A1A] py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white sm:text-sm transition-all outline-none"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-600 bg-[#1A1A1A] text-white focus:ring-white" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">Remember me</label>
              </div>
              <div className="text-sm">
                <button type="button" onClick={() => setIsSignUp(!isSignUp)} className="font-medium text-white hover:underline">
                  {isSignUp ? "Already have an account?" : "Need an account?"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-xl bg-white py-4 text-sm font-bold text-black shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
            >
              {loading ? "Processing..." : (isSignUp ? "Sign Up" : "Log In")}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-black px-4 text-gray-500 uppercase tracking-widest text-[10px] font-bold">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#1A1A1A] py-3 text-sm font-medium text-white hover:bg-[#252525] transition-all"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .533 5.333.533 12S5.867 24 12.48 24c3.44 0 6.053-1.147 8.16-2.933 2.16-1.787 3-4.507 3-6.96 0-.667-.053-1.333-.133-2.027h-10.96V10.92z"/></svg>
              <span>Google</span>
            </button>
            <button className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-[#1A1A1A] py-3 text-sm font-medium text-white hover:bg-[#252525] transition-all opacity-50 cursor-not-allowed">
              <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.88-3.08.4-.38-.18-1.07-.49-2.07-.49-.98 0-1.63.29-2.02.47-1.04.49-2.13.56-3.11-.4-4.25-4.14-3.56-10-1.42-12.06 1.05-1 2.87-1.64 3.93-1.64.93 0 1.77.26 2.36.46.61.2 1.54.67 2.76.67 1.63 0 2.92-1.34 2.94-1.37-.02.02 1.83 1.07 1.83 3.23 0 2.27-2.06 3.23-2.09 3.24-1.63.66-2.6 1.93-2.6 3.09 0 2.5 2.18 3.34 2.22 3.35-.02.07-.34 1.16-1.12 2.29-.78 1.13-1.59 2.26-2.65 2.26zM12.05 3.37c.78-.95 1.3-2.27 1.16-3.37-1.11.05-2.45.74-3.25 1.68-.72.85-1.34 2.22-1.17 3.42 1.24.1 2.48-.78 3.26-1.73z"/></svg>
              <span>Apple ID</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP ---
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
              <p className="text-gray-400 mt-2 font-medium">Player: <span className="text-black font-bold">{user.user_metadata.full_name || user.email?.split('@')[0]}</span></p>
            </div>
            <div className="flex justify-center space-x-12">
              <div className="text-center"><p className="text-4xl font-black text-black">{score}/{quizQuestions.length}</p><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Correct</p></div>
              <div className="text-center"><p className="text-4xl font-black text-[#E91E63]">+{score * 50}</p><p className="text-[10px] font-black uppercase tracking-widest text-gray-400">XP Earned</p></div>
            </div>
            <div className="pt-8 border-t border-gray-50 flex gap-4">
               <button onClick={() => { setActiveQuiz(false); setShowResults(false); setTopic(''); setQuizQuestions([]); }} className="flex-1 py-4 bg-gray-50 text-gray-500 font-bold rounded-2xl hover:bg-gray-100 transition-all uppercase tracking-widest text-[10px]">New Topic</button>
               <button onClick={() => { setShowResults(false); setCurrentStep(0); setScore(0); }} className="flex-1 py-4 bg-black text-white font-bold rounded-2xl hover:bg-[#E91E63] transition-all uppercase tracking-widest text-[10px]">Retake Quiz</button>
            </div>
          </div>
        ) : activeQuiz ? (
          <div className="bg-white p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-2xl relative overflow-hidden animate-slide-up">
             <div className="flex items-center justify-between mb-12">
              <div className="space-y-1"><span className="text-[10px] font-black text-[#E91E63] uppercase tracking-[0.3em]">Module Active</span><p className="text-xs font-bold text-gray-400 uppercase">Question {currentStep + 1} of {quizQuestions.length}</p></div>
              <button onClick={() => { setActiveQuiz(false); setShowResults(false); setTopic(''); setQuizQuestions([]); }} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-black transition-colors"><X size={18} /></button>
            </div>
            <div className="h-1.5 w-full bg-gray-50 rounded-full mb-12 overflow-hidden"><div className="h-full bg-[#E91E63] transition-all duration-700 ease-out" style={{ width: `${((currentStep + 1) / quizQuestions.length) * 100}%` }}></div></div>
            <h3 className="text-2xl md:text-3xl font-medium text-gray-900 mb-10 tracking-tight leading-tight">{quizQuestions[currentStep].question}</h3>
            <div className="space-y-4">{quizQuestions[currentStep].options.map((opt, i) => (<button key={i} onClick={() => handleAnswerSelect(i)} className="w-full p-6 text-left border border-gray-100 bg-white hover:border-[#E91E63] hover:shadow-xl hover:shadow-[#E91E63]/5 rounded-[24px] transition-all group relative overflow-hidden"><div className="flex items-center relative z-10"><div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-[#E91E63] group-hover:text-white flex items-center justify-center text-xs font-black mr-6 transition-all">{String.fromCharCode(65 + i)}</div><span className="text-gray-600 font-medium group-hover:text-black transition-colors leading-relaxed">{opt}</span></div></button>))}</div>
          </div>
        ) : (
          <div className="bg-[#1A0616] p-10 md:p-16 rounded-[48px] text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center space-x-3"><Sparkles size={24} className="text-[#E91E63] animate-pulse" /><span className="text-[10px] font-black tracking-[0.4em] uppercase text-[#E91E63]">Synthesis Engine v2.5</span></div>
                 <button onClick={handleLogout} className="text-white/40 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest"><LogOut size={14} /><span>Sign Out</span></button>
              </div>
              <h2 className="text-5xl md:text-7xl font-medium mb-6 tracking-tighter leading-[0.9]">Welcome, <br /> <span className="italic font-light text-[#E91E63]">{user.user_metadata.full_name?.split(' ')[0] || user.email?.split('@')[0]}</span></h2>
              <p className="text-white/40 text-lg mb-12 max-w-md font-light leading-relaxed">What topic are we mastering today?</p>
              <form onSubmit={handleGenerate} className="max-w-xl space-y-4">
                <div className="relative group"><Search className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors duration-500 ${isGenerating ? 'text-[#E91E63] animate-spin' : 'text-white/20'}`} size={20} /><input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Enter topic: e.g. Smart Grids" className="w-full bg-white/5 border border-white/10 rounded-[28px] py-6 pl-16 pr-8 text-sm focus:outline-none focus:border-[#E91E63] focus:bg-white/10 transition-all placeholder:text-white/10" /></div>
                <button type="submit" disabled={isGenerating || !topic.trim()} className="w-full md:w-auto px-12 py-5 bg-[#E91E63] text-white font-black rounded-[24px] hover:opacity-90 transition-all shadow-2xl shadow-[#E91E63]/20 flex items-center justify-center space-x-4 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest text-[11px]">{isGenerating ? (<><RefreshCw size={18} className="animate-spin" /><span>Synthesizing...</span></>) : (<><span>Launch Assessment</span><ArrowRight size={18} /></>)}</button>
              </form>
            </div>
          </div>
        )}
        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8"><div className="flex items-center justify-between"><h3 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Industry Milestones</h3></div><div className="grid grid-cols-2 sm:grid-cols-4 gap-6">{[{ label: 'Fast Starter', color: 'bg-blue-50 text-blue-500' }, { label: 'Deep Thinker', color: 'bg-purple-50 text-purple-500' }, { label: 'Gap Closer', color: 'bg-green-50 text-green-500' }, { label: 'Mastery', color: 'bg-orange-50 text-orange-500' }].map((badge, i) => (<div key={i} className="flex flex-col items-center p-6 bg-gray-50 rounded-[32px] border border-gray-100 hover:scale-105 transition-transform"><div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-sm ${badge.color}`}><CheckCircle2 size={24} /></div><span className="text-[9px] text-gray-400 font-black uppercase text-center tracking-widest">{badge.label}</span></div>))}</div></div>
      </div>
      <div className="space-y-6">
        <div className="bg-white p-8 md:p-10 rounded-[48px] border border-gray-100 shadow-xl overflow-hidden relative">
          <div className="flex items-center justify-between mb-10 relative z-10"><h3 className="text-[11px] font-black text-gray-900 uppercase tracking-widest">Department Ranks</h3><Trophy className="text-yellow-500" size={20} /></div>
          <div className="space-y-5 relative z-10">{(leaderboardData.length > 0 ? leaderboardData : LEADERBOARD).map((user, idx) => (<div key={idx} className={`flex items-center justify-between p-4 rounded-[28px] transition-all ${idx === 0 ? 'bg-[#1A0616] text-white shadow-xl shadow-[#1A0616]/20' : 'hover:bg-gray-50'}`}><div className="flex items-center space-x-4"><span className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${idx === 0 ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-200' : idx === 1 ? 'bg-gray-200 text-gray-600' : idx === 2 ? 'bg-orange-100 text-orange-500' : 'bg-gray-50 text-gray-400'}`}>{idx + 1}</span><div><p className={`text-xs font-bold tracking-tight ${idx === 0 ? 'text-white' : 'text-gray-900'}`}>{user.name || `Student ${idx + 1}`}</p><p className="text-[9px] font-black uppercase tracking-widest opacity-40">{user.topic || "Engineering"}</p></div></div><div className="text-right"><p className="text-xs font-black">{user.score}</p><p className="text-[8px] font-black uppercase tracking-widest opacity-40">XP</p></div></div>))}</div>
          <button className="w-full mt-10 py-5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-[24px] hover:bg-black hover:text-white transition-all">Expand Rankings</button>
        </div>
      </div>
    </div>
  );
};

export default MicroLearning;