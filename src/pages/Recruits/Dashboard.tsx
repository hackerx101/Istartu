import React, { useEffect, useState } from 'react';
import { useOutletContext, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Users, Search, Plus, ExternalLink, Shield, RotateCw, MessageCircle } from 'lucide-react';

export default function RecruitsDashboard() {
  const { session, profile, subscription } = useOutletContext<any>();
  const navigate = useNavigate();
  const [recentPlayers, setRecentPlayers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    loadCachedOrFetchPlayers();
  }, [profile]);

  const loadCachedOrFetchPlayers = async () => {
    const cacheKey = `recruiter_cached_players_${profile?.id || 'demo'}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentPlayers(parsed);
          return;
        }
      } catch (e) {
        // invalid cache
      }
    }

    await fetchAndCachePlayers();
  };

  const fetchAndCachePlayers = async () => {
    let players: any[] = [];
    try {
      const res = await supabase.from('profiles').select('*').limit(20);
      if (res.data && res.data.length > 0) {
        // Filter players or all registered profiles except current user
        players = res.data
          .filter(p => p.role !== 'recruit' || p.user_id !== session?.user?.id)
          .slice(0, 10)
          .map(p => ({
            ...p,
            IdNumber: p.IdNumber || p.id || ('100' + Math.floor(10000 + Math.random() * 90000).toString())
          }));
      }
    } catch (e) {
      console.warn("Recruiter players fetch error:", e);
    }

    setRecentPlayers(players);
    if (players.length > 0) {
      const cacheKey = `recruiter_cached_players_${profile?.id || 'demo'}`;
      localStorage.setItem(cacheKey, JSON.stringify(players));
    }
  };

  const handleShuffle = async () => {
    setIsShuffling(true);
    let players: any[] = [];
    try {
      const res = await supabase.from('profiles').select('*').limit(30);
      if (res.data && res.data.length > 0) {
        const list = res.data.filter(p => p.role !== 'recruit');
        // Randomly shuffle real database players
        const shuffled = [...list].sort(() => Math.random() - 0.5).slice(0, 10);
        players = shuffled.map(p => ({
          ...p,
          IdNumber: p.IdNumber || p.id || ('100' + Math.floor(10000 + Math.random() * 90000).toString())
        }));
      }
    } catch (e) {
      console.warn("Shuffle error:", e);
    }

    setTimeout(() => {
      setRecentPlayers(players);
      if (players.length > 0) {
        const cacheKey = `recruiter_cached_players_${profile?.id || 'demo'}`;
        localStorage.setItem(cacheKey, JSON.stringify(players));
      }
      setIsShuffling(false);
    }, 300);
  };

  if (!profile) return null;

  // Search filtering
  const filteredPlayers = recentPlayers.filter(p => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.IdNumber && p.IdNumber.includes(q)) ||
      (p.position && p.position.toLowerCase().includes(q)) ||
      (p.sport && p.sport.toLowerCase().includes(q))
    );
  });

  return (
    <div className="w-full max-w-6xl mx-auto px-6 py-8 flex flex-col gap-10">
      
      {/* Header */}
      <div className="flex justify-between items-end flex-wrap gap-4 border-b border-gray-100 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-xs font-bold uppercase tracking-wider rounded-md mb-3 text-gray-500">
            <Shield className="w-4 h-4" />
            Recruiter Portal
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile.full_name || profile.name}</h1>
            <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black px-3 py-1 rounded-full text-xs font-black shadow-sm" title="Gold Verified Scout & Recruiter">
              <svg className="w-4 h-4 fill-black" viewBox="0 0 24 24">
                <path d="M12 2l2.4 2.4 3.4-.2 1.2 3.2 3.2 1.2-.2 3.4L22 12l-2.4 2.4.2 3.4-3.2 1.2-1.2 3.2-3.4-.2L12 22l-2.4-2.4-3.4.2-1.2-3.2-3.2-1.2.2-3.4L2 12l2.4-2.4-.2-3.4 3.2-1.2 1.2-3.2 3.4.2L12 2z"/>
                <path d="M9.5 12.5l2 2 4.5-4.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Gold Verified Scout</span>
            </span>
          </div>
          <div className="text-gray-500 text-sm mt-1">{profile.bio || 'Scout Organization'} • Team ID: {profile.team_id || 'RECRUIT-01'}</div>
        </div>
        <div className="flex gap-2">
          <Link 
            to={`/recruits/team/${profile.team_id || 'default'}`}
            className="flex items-center gap-2 bg-gray-100 text-black border border-gray-200 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
          >
            <Users className="w-4 h-4" />
            My Team Page
          </Link>
          <Link 
            to="/ad/create"
            className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Ad ($5)
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Scout Players (Cached List)</h2>
              <p className="text-xs text-gray-400 mt-0.5">Showing 10 cached player prospects for your account.</p>
            </div>
            
            <button 
              onClick={handleShuffle}
              disabled={isShuffling}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
              title="Shuffle & Load 10 New Players"
            >
              <RotateCw className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
              {isShuffling ? 'Shuffling...' : 'Shuffle Players'}
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search by player name, Player ID (100...), position, or sport..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-black focus:bg-white transition-all"
            />
          </div>

          {/* Player Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredPlayers.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                No players match your search "{searchQuery}". Try a different keyword or click Shuffle Players.
              </div>
            ) : (
              filteredPlayers.map(p => (
                <div key={p.id || p.IdNumber} className="p-4 border border-gray-200 rounded-2xl bg-white flex flex-col justify-between gap-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-gray-400 text-lg">
                          {p.full_name?.charAt(0) || 'P'}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-gray-900 truncate">{p.full_name || p.name}</div>
                      <div className="text-xs text-gray-500 font-medium truncate">
                        {p.position || 'Athlete'} {p.sport ? `• ${p.sport}` : ''}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 italic">
                    "{p.bio || 'Verified prospect on FSMEC network.'}"
                  </p>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-100 gap-2">
                    <span className="text-xs text-gray-500 font-mono font-semibold">ID: {p.IdNumber}</span>
                    <div className="flex items-center gap-2">
                      <Link 
                        to={`/chat?recipient=${encodeURIComponent(p.full_name || p.name)}&id=${p.IdNumber}`} 
                        className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Message
                      </Link>
                      <Link 
                        to={`/player/${p.IdNumber}`} 
                        className="px-3 py-1.5 bg-gray-100 text-gray-800 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors flex items-center gap-1"
                      >
                        Profile <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <div className="bg-gray-50 border border-gray-200 rounded-3xl p-6 flex flex-col gap-4">
            <h3 className="font-bold text-lg text-gray-900">Recruiter Portal</h3>
            {subscription?.plan_name === 'Enterprise' ? (
              <div>
                <div className="text-green-600 font-bold mb-1 flex items-center gap-2 text-sm">
                  <Shield className="w-4 h-4" /> Enterprise Active
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">You have full access to recruit features, player messaging, ads, and team management.</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">Upgrade to unlock unlimited player messaging, team recruitment cards, and official verified scout badges.</p>
                <Link to="/plans/subscription" className="w-full inline-block text-center bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors">Upgrade Plan</Link>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

