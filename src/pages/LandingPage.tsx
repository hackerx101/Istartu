import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, User, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';

const FAQS = [
  { question: "How do I get recruited?", answer: "Create a complete profile, upload your best highlights, and engage with scouts directly through our messaging platform." },
  { question: "Is the platform free?", answer: "We offer a free starter tier. Premium tiers unlock advanced features like unlimited messaging and enhanced player cards." },
  { question: "Who can see my profile?", answer: "All player profiles are public to help maximize your exposure to global scouts and coaches." },
  { question: "Can I use FSMEC to live stream games?", answer: "Yes! FSMEC TV provides ultra-low latency live streaming directly through the app, allowing scouts to watch you in real-time." },
  { question: "Are my highlights safe?", answer: "Absolutely. FSMEC uses industry-leading data storage, so your videos, stats, and achievements are securely preserved." },
  { question: "How does the partner program work?", answer: "Partners have verified checkmarks and can collaborate with FSMEC. You can apply via the Partner Request link." }
];

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const navigate = useNavigate();
  const searchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('IdNumber, user_id, full_name, avatar_url, position, is_upgraded, role')
          .or(`full_name.ilike.%${searchQuery}%,IdNumber.ilike.%${searchQuery}%`)
          .limit(10);

        const list = (data && !error) ? data : [];
        setSuggestions(list);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Suggestion fetch error:", err);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setShowSuggestions(false);
    setIsSearching(true);
    let results: any[] = [];
    try {
      let query = supabase.from('profiles').select('IdNumber, user_id, full_name, avatar_url, position, is_upgraded, role, is_public');
      if (/^\d+$/.test(searchQuery)) {
        query = query.eq('IdNumber', searchQuery);
      } else {
        query = query.ilike('full_name', `%${searchQuery}%`);
      }
      const { data, error } = await query;
      if (data && !error) results = data;
    } catch (err) {
      console.warn("Search query caught:", err);
    }

    setSearchResults(results);
    setIsSearching(false);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 gap-16 sm:gap-24">
      <Helmet>
        <title>FSMEC Global Athletic Scouting & Recruiting Platform</title>
        <meta name="description" content="Discover top youth & high school basketball and soccer recruits, view verified athletic player cards, watch live court streams, and connect with college scouts." />
        <meta property="og:title" content="FSMEC Global Scouting Platform" />
        <meta property="og:description" content="Connecting elite basketball and soccer recruits directly with professional scouts and college recruiters." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center max-w-4xl gap-6 sm:gap-8 mt-6 sm:mt-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-500">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          The Global Scouting Network
        </div>
        
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter leading-[1] text-gray-900">
          Connect. Get <br className="hidden sm:block" /> Recognized.
        </h1>
        <p className="text-base sm:text-xl text-gray-500 leading-relaxed max-w-2xl font-medium">
          FSMEC is the premier platform connecting athletes, coaches, and scouts globally. Get recognized for elite recruitment opportunities.
        </p>
        
        {/* Glowing Search Bar */}
        <div ref={searchRef} className="w-full max-w-lg relative mt-4 sm:mt-6 flex flex-col gap-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur opacity-20"></div>
          <form onSubmit={handleSearch} className="relative z-10 bg-white rounded-full flex items-center p-1.5 sm:p-2 shadow-2xl border border-gray-100">
            <Search className="w-5 h-5 text-gray-400 ml-3 sm:ml-4" />
            <input 
              type="text" 
              placeholder="Player Name or ID..." 
              value={searchQuery}
              aria-label="Search players by name or ID"
              title="Enter athlete name or ID number"
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (searchQuery.length >= 2) setShowSuggestions(true);
              }}
              className="flex-1 bg-transparent border-none outline-none px-3 sm:px-4 text-sm sm:text-base text-gray-900 placeholder:text-gray-400 font-medium"
            />
            <button type="submit" className="bg-black text-white px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-tighter hover:bg-gray-800 transition-all active:scale-95">
              {isSearching ? '...' : 'Search'}
            </button>
          </form>

          <AnimatePresence mode="wait">
            {showSuggestions && searchQuery.length >= 2 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 z-[70] mt-2 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden p-2 max-h-[60vh] overflow-y-auto"
              >
                {suggestions.length > 0 ? (
                  suggestions.map((suggestion) => (
                    <button
                      key={suggestion.IdNumber || suggestion.user_id}
                      onClick={() => {
                        setSearchQuery(suggestion.full_name);
                        setShowSuggestions(false);
                        navigate(`/player/${suggestion.IdNumber || suggestion.user_id}`);
                      }}
                      className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                          {suggestion.avatar_url ? (
                            <img src={suggestion.avatar_url} alt={suggestion.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-5 h-5 m-auto text-gray-400 mt-2.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-gray-900 truncate">{suggestion.full_name}</div>
                          <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{suggestion.position || 'Athlete'} • ID: {suggestion.IdNumber || suggestion.user_id}</div>
                        </div>
                      </div>

                      <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${suggestion.is_upgraded || suggestion.role === 'recruit' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {suggestion.is_upgraded || suggestion.role === 'recruit' ? '🏆 Ranked Prospect' : '👤 Profile'}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-8 text-center flex flex-col items-center gap-3">
                    <User className="w-8 h-8 text-gray-200" />
                    <p className="text-gray-500 text-sm font-medium">No players found matching "{searchQuery}"</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search Results */}
          {!showSuggestions && isSearching === false && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-4 bg-white border border-gray-100 rounded-3xl p-4 shadow-2xl flex flex-col gap-2 z-50 max-h-[70vh] overflow-y-auto">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 px-2">Matching Player Profiles</div>
              {searchResults.map((player) => (
                <div 
                  key={player.IdNumber || player.user_id} 
                  onClick={() => navigate(`/player/${player.IdNumber || player.user_id}`)}
                  className="flex items-center justify-between p-3 rounded-2xl hover:bg-gray-50 cursor-pointer transition-all border border-transparent hover:border-gray-100"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden shrink-0 border border-gray-200">
                      {player.avatar_url ? <img src={player.avatar_url} className="w-full h-full object-cover" /> : <User className="w-5 h-5 text-gray-400" />}
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="font-black text-gray-900 truncate">{player.full_name}</div>
                      <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">{player.position || 'Athlete'} • ID: {player.IdNumber || player.user_id}</div>
                    </div>
                  </div>

                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full shrink-0 ${player.is_upgraded || player.role === 'recruit' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                    {player.is_upgraded || player.role === 'recruit' ? '🏆 Ranked Prospect' : '👤 Profile'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Access CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-2 sm:mt-4 w-full">
          <button 
            onClick={() => navigate('/rankings')}
            className="w-full sm:w-auto px-10 py-4 bg-yellow-400 hover:bg-yellow-500 text-black font-black rounded-full shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
          >
            <Trophy className="w-5 h-5" />
            View Rankings
          </button>
          <button 
            onClick={() => navigate('/auth/signup')}
            className="w-full sm:w-auto px-10 py-4 bg-black hover:bg-gray-800 text-white font-black rounded-full shadow-lg transition-all text-xs uppercase tracking-widest"
          >
            Join Network
          </button>
        </div>
      </section>

      {/* Scams Section */}
      <section className="w-full max-w-6xl flex flex-col items-center gap-12 sm:gap-16 my-4">
        
        <div className="text-center max-w-2xl flex flex-col gap-4">
          <div className="inline-block self-center bg-red-50 text-red-600 text-[10px] font-black uppercase px-4 py-1 rounded-full tracking-[0.2em] border border-red-100">
            Industry Intelligence
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-gray-900 tracking-tighter leading-tight">
            Avoid Legacy <br className="sm:hidden" /> Recruiting Scams
          </h2>
          <p className="text-gray-500 text-sm sm:text-lg font-medium leading-relaxed">
            Don't waste thousands on fake promises and generic evaluations. FSMEC exposes how legacy agencies trick families.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {/* Scam 1 */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all hover:border-red-100 group">
            <div className="text-4xl font-black text-gray-100 group-hover:text-red-50 transition-colors">01</div>
            <h3 className="font-black text-gray-900 text-xl tracking-tight leading-tight">The $150 "Copy-Paste" Writeup Trap</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Shady blogs charge $150 for a 3-sentence "evaluation" that says generic lines like "solid upside." They never watch film—it is copy-pasted automatically.
            </p>
            <div className="mt-auto pt-4 border-t border-gray-50 text-[10px] font-black text-red-600 uppercase tracking-widest">
              ❌ FSMEC uses verifiable data
            </div>
          </div>

          {/* Scam 2 */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all hover:border-red-100 group">
            <div className="text-4xl font-black text-gray-100 group-hover:text-red-50 transition-colors">02</div>
            <h3 className="font-black text-gray-900 text-xl tracking-tight leading-tight">"Guaranteed D1 Offer" Promises</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Agencies promise "Guaranteed D1 Scholarships" for $2,000 upfront. NCAA rules strictly prohibit paid scholarship guarantees.
            </p>
            <div className="mt-auto pt-4 border-t border-gray-50 text-[10px] font-black text-red-600 uppercase tracking-widest">
              ❌ Transparency over hype
            </div>
          </div>

          {/* Scam 3 */}
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 flex flex-col gap-4 shadow-sm hover:shadow-xl transition-all hover:border-red-100 group">
            <div className="text-4xl font-black text-gray-100 group-hover:text-red-50 transition-colors">03</div>
            <h3 className="font-black text-gray-900 text-xl tracking-tight leading-tight">Automated Mass Email Spam</h3>
            <p className="text-sm text-gray-500 leading-relaxed font-medium">
              Platforms claim to "email 5,000 coaches." In reality, they spam outdated inboxes. Coaches route these generic emails straight to junk.
            </p>
            <div className="mt-auto pt-4 border-t border-gray-50 text-[10px] font-black text-red-600 uppercase tracking-widest">
              ❌ Direct Scout Messaging
            </div>
          </div>
        </div>
      </section>

      {/* Call To Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-10">
        <div className="bg-gray-50 rounded-3xl p-8 flex flex-col items-center text-center gap-4 border border-gray-100">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">🏃</div>
          <h3 className="text-xl font-bold">For Athletes</h3>
          <p className="text-gray-600 text-sm">Build your digital portfolio and get discovered by top-tier programs.</p>
        </div>
        <div className="bg-gray-50 rounded-3xl p-8 flex flex-col items-center text-center gap-4 border border-gray-100">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">📋</div>
          <h3 className="text-xl font-bold">For Coaches</h3>
          <p className="text-gray-600 text-sm">Manage your team and scout for incoming talent seamlessly.</p>
        </div>
        <div className="bg-gray-50 rounded-3xl p-8 flex flex-col items-center text-center gap-4 border border-gray-100">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-2">👁️</div>
          <h3 className="text-xl font-bold">For Scouts</h3>
          <p className="text-gray-600 text-sm">Access a global database of verified athletes and detailed analytics.</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full max-w-3xl flex flex-col gap-8 mb-10">
        <h2 className="text-3xl font-bold text-center">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
              <button 
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold">{faq.question}</span>
                {openFaq === i ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              <AnimatePresence>
                {openFaq === i && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6 text-gray-600 text-sm leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Recruits CTA */}
      <section className="w-full max-w-3xl flex flex-col items-center mb-20 text-center gap-4">
        <div className="text-gray-500">Are you a recruiter, scout, or coach?</div>
        <button 
          onClick={() => navigate('/recruits')}
          className="px-8 py-3.5 bg-transparent border-2 border-black text-black rounded-full font-bold hover:bg-black hover:text-white transition-colors"
        >
          Register as a Recruit
        </button>
      </section>

    </div>
  );
}
