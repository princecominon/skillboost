import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, User, BookOpen, GraduationCap, CheckCircle2, Apple, Search } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Import real Supabase client
import { UserProfile } from '../types';

interface AuthFlowProps {
  onLogin: (userData?: UserProfile) => void;
}

type AuthState = 'login' | 'signup' | 'forgotPassword';

const AuthFlow: React.FC<AuthFlowProps> = ({ onLogin }) => {
  const [state, setState] = useState<AuthState>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccessPopupVisible, setIsSuccessPopupVisible] = useState(false);
  const [loading, setLoading] = useState(false); // General loading state
  const [loadingSocial, setLoadingSocial] = useState<'google' | 'apple' | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [year, setYear] = useState('1');

  // Styles
  const inputClasses = "w-full bg-[#121212] border border-gray-800 rounded-xl py-4 pl-12 pr-12 text-gray-300 focus:outline-none focus:border-[#E91E63]/50 focus:ring-1 focus:ring-[#E91E63]/50 transition-all placeholder:text-gray-600";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 text-gray-600";
  const toggleClasses = "absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 cursor-pointer";

  // --- 1. HANDLE REAL LOGIN ---
  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      // Login Success
      triggerSuccessAnimation(data.user);
    }
  };

  // --- 2. HANDLE REAL SIGNUP ---
  const handleSignup = async () => {
    if (!email || !password || !fullName) {
      alert("Please fill in all fields");
      return;
    }
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          major: major || "Undecided",
          year: year || "1"
        }
      }
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    } else {
      // Signup Success
      triggerSuccessAnimation(data.user);
    }
  };

  // --- 3. HANDLE GOOGLE LOGIN ---
  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    if (provider === 'apple') {
      alert("Apple Login requires additional configuration. Please use Google for now.");
      return;
    }
    
    setLoadingSocial(provider);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    
    if (error) {
      alert(error.message);
      setLoadingSocial(null);
    }
    // Note: OAuth will redirect the page, so no need to stop loading manually
  };

  // --- 4. SUCCESS ANIMATION & DATA MAPPING ---
  const triggerSuccessAnimation = (user: any) => {
    setIsSuccessPopupVisible(true);
    setLoading(false);
    
    // Construct User Profile from Supabase Data
    const meta = user?.user_metadata || {};
    
    const finalUserData: UserProfile = {
      name: meta.full_name || user?.email?.split('@')[0] || "Learner",
      major: meta.major || "Undecided",
      year: parseInt(meta.year) || 1,
      dailyGoalMinutes: 60,
      completedMinutesToday: 0,
      currentRank: 500,
      skills: [],
      xp: 0,
      totalModules: 0,
    };

    setTimeout(() => {
      onLogin(finalUserData);
    }, 2000);
  };

  // --- RENDERERS ---

  const renderLogin = () => (
    <div className="flex flex-col w-full animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-12">
        <div className="flex items-center space-x-2 bg-gray-900/50 px-3 py-1.5 rounded-full border border-gray-800">
          <div className="w-2 h-2 bg-[#E91E63] rounded-full animate-pulse"></div>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Secure Access</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-[#E91E63] rounded flex items-center justify-center text-white font-bold text-xs">S</div>
          <span className="text-white font-bold">SkillBoost</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
      <p className="text-gray-500 text-sm mb-10">Login to bridge your industry skill gap.</p>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
          <div className="relative">
            <Mail size={18} className={iconClasses} />
            <input 
              type="email" 
              placeholder="Enter your email" 
              className={inputClasses} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
          <div className="relative">
            <Lock size={18} className={iconClasses} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Enter your password" 
              className={inputClasses} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div onClick={() => setShowPassword(!showPassword)} className={toggleClasses}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-2">
          <label className="flex items-center space-x-2 text-gray-500 cursor-pointer select-none">
            <input type="checkbox" className="w-4 h-4 rounded border-gray-800 bg-[#121212] checked:bg-[#E91E63]" />
            <span>Remember me</span>
          </label>
          <button 
            onClick={() => setState('forgotPassword')}
            className="text-gray-500 hover:text-[#E91E63] transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        <button 
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Log In"}
        </button>

        <div className="relative flex items-center justify-center py-4">
          <div className="absolute inset-0 flex items-center px-2">
            <div className="w-full border-t border-gray-800"></div>
          </div>
          <span className="relative z-10 bg-black px-4 text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">Or continue with</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            disabled={!!loadingSocial}
            onClick={() => handleSocialLogin('google')}
            className={`flex items-center justify-center space-x-2 py-3.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all active:scale-95 ${loadingSocial === 'google' ? 'opacity-50' : ''}`}
          >
            <Search size={18} className="text-red-500" />
            <span className="text-xs font-bold text-black">Google</span>
          </button>
          <button 
            disabled={!!loadingSocial}
            onClick={() => handleSocialLogin('apple')}
            className={`flex items-center justify-center space-x-2 py-3.5 bg-black border border-gray-800 rounded-xl hover:bg-zinc-900 transition-all active:scale-95 ${loadingSocial === 'apple' ? 'opacity-50' : ''}`}
          >
            <Apple size={18} className="text-white" />
            <span className="text-xs font-bold text-white">Apple ID</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 pt-6">
          Don't have an account? <button onClick={() => setState('signup')} className="text-white font-bold hover:text-[#E91E63] underline transition-colors">Create an account</button>
        </p>
      </div>
    </div>
  );

  const renderSignup = () => (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={() => setState('login')}
          className="w-10 h-10 bg-gray-900/50 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-[#E91E63] rounded flex items-center justify-center text-white font-bold text-xs">S</div>
          <span className="text-white font-bold">SkillBoost</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
      <p className="text-gray-500 text-sm mb-10">Start your journey to industry readiness.</p>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
          <div className="relative">
            <User size={18} className={iconClasses} />
            <input 
              type="text" 
              placeholder="e.g. Alex Rivera" 
              className={inputClasses} 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Major</label>
            <div className="relative">
              <BookOpen size={18} className={iconClasses} />
              <input 
                type="text" 
                placeholder="e.g. CS" 
                className={inputClasses} 
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Year</label>
            <div className="relative">
              <GraduationCap size={18} className={iconClasses} />
              <select 
                className={`${inputClasses} appearance-none`}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
          <div className="relative">
            <Mail size={18} className={iconClasses} />
            <input 
              type="email" 
              placeholder="Enter your email" 
              className={inputClasses} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Password</label>
          <div className="relative">
            <Lock size={18} className={iconClasses} />
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Create a password" 
              className={inputClasses} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div onClick={() => setShowPassword(!showPassword)} className={toggleClasses}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </div>
          </div>
        </div>

        <button 
          onClick={handleSignup}
          disabled={loading}
          className="w-full py-4 bg-[#E91E63] text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg mt-4 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="text-center text-xs text-gray-500 pt-4">
          Already have an account? <button onClick={() => setState('login')} className="text-white font-bold hover:text-[#E91E63] underline transition-colors">Login</button>
        </p>
      </div>
    </div>
  );

  const renderForgot = () => (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center justify-between mb-12">
        <button 
          onClick={() => setState('login')}
          className="w-10 h-10 bg-gray-900/50 rounded-full border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 bg-[#E91E63] rounded flex items-center justify-center text-white font-bold text-xs">S</div>
          <span className="text-white font-bold">SkillBoost</span>
        </div>
      </div>

      <h2 className="text-3xl font-bold text-white mb-2">Forgot Password</h2>
      <p className="text-gray-500 text-sm mb-10">Reset your password to resume learning.</p>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
          <div className="relative">
            <Mail size={18} className={iconClasses} />
            <input 
              type="email" 
              placeholder="Enter your email" 
              className={inputClasses} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button 
          onClick={() => alert("Check your email for reset instructions.")}
          className="w-full py-4 bg-[#E91E63] text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-[0.98]"
        >
          Send Code
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center px-6 md:px-0 relative overflow-hidden">
      {/* Success Popup Bar */}
      {isSuccessPopupVisible && (
        <div className="fixed top-8 left-0 right-0 z-[200] flex justify-center px-6 animate-slide-up">
          <div className="bg-white/10 backdrop-blur-3xl border border-white/20 shadow-2xl py-4 px-6 rounded-[30px] flex items-center gap-4 max-w-md w-full">
            <div className="w-10 h-10 bg-[#E91E63] rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-[#E91E63]/30">
              <CheckCircle2 size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-white text-sm font-bold uppercase tracking-widest leading-none mb-1">Authenticated</h4>
              <p className="text-white/60 text-xs font-medium">Link established. Syncing your curriculum...</p>
            </div>
          </div>
        </div>
      )}

      {/* Social Loading Overlay */}
      {loadingSocial && (
        <div className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-fade-in">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#E91E63] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-white font-bold uppercase tracking-widest text-sm">Connecting to {loadingSocial === 'google' ? 'Google' : 'Apple'}...</p>
          </div>
        </div>
      )}

      <div className={`max-w-[420px] w-full py-12 md:py-0 transition-all duration-500 ${isSuccessPopupVisible ? 'opacity-20 scale-95 blur-sm' : 'opacity-100 scale-100'}`}>
        {state === 'login' && renderLogin()}
        {state === 'signup' && renderSignup()}
        {state === 'forgotPassword' && renderForgot()}
      </div>
    </div>
  );
};

export default AuthFlow;