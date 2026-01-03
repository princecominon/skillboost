import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

// 1. Define the Prop Type so App.tsx can pass a function
interface SearchBarProps {
  onSearch?: (query: string) => void; 
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('search_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (data) setHistory(data);
  };

  // ---------------------------------------------------------
  // 2. THIS IS THE MISSING/UPDATED FUNCTION
  // ---------------------------------------------------------
  const handleSearch = async (e: React.KeyboardEvent) => {
    // Only run if key is Enter and query is not empty
    if (e.key === 'Enter' && query.trim()) {
      setShowDropdown(false);
      
      // A. Call the Prop (Sends data to App.tsx)
      if (onSearch) {
        onSearch(query);
      }

      // B. Save to Database Logic
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('search_history').insert([{
          user_email: user.email,
          user_name: user.user_metadata?.full_name || 'User',
          search_query: query
        }]);

        if (!error) fetchHistory();
      }
    }
  };

  const deleteHistoryItem = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const { error } = await supabase.from('search_history').delete().eq('id', id);
    if (!error) fetchHistory();
  };

  const handleSelectHistory = (selectedQuery: string) => {
    setQuery(selectedQuery);
    setShowDropdown(false);
    // Trigger search immediately when clicking history
    if (onSearch) onSearch(selectedQuery);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-500 group-focus-within:text-[#E91E63] transition-colors" />
        </div>
        <input
          type="text"
          className="block w-full pl-11 pr-4 py-3 bg-[#121212] border border-gray-800 rounded-2xl text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#E91E63] focus:ring-1 focus:ring-[#E91E63] transition-all"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // 3. Attach the function here
          onKeyDown={handleSearch} 
          onFocus={() => setShowDropdown(true)}
        />
      </div>

      {showDropdown && history.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1E1E1E] border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-4 py-2 bg-[#252525] border-b border-gray-700 flex justify-between items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recent Searches</span>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {history.map((item) => (
              <div 
                key={item.id}
                className="group flex items-center justify-between px-4 py-3 hover:bg-[#2A2A2A] cursor-pointer transition-colors border-b border-gray-800 last:border-0"
                onClick={() => handleSelectHistory(item.search_query)}
              >
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-gray-500 group-hover:text-[#E91E63] transition-colors" />
                  <span className="text-sm text-gray-300 group-hover:text-white">{item.search_query}</span>
                </div>
                
                <button 
                  onClick={(e) => deleteHistoryItem(e, item.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded-full text-gray-500 hover:text-red-500 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;