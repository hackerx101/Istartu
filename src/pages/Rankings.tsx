import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, Search, MapPin, Trophy, ChevronDown, CheckCircle2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const CLASSES = ["All Classes", "2027", "2028", "2029", "2030", "2031", "2032", "2033", "2034", "2035"];
const SPORTS = ["All Sports", "Basketball", "Soccer"];
const LOCATIONS = [
  "All Locations", 
  "Canada", 
  "United Kingdom", 
  "Europe", 
  "Michigan", 
  "California", 
  "Texas", 
  "Florida", 
  "New York", 
  "Illinois", 
  "Pennsylvania", 
  "Ohio", 
  "Georgia", 
  "North Carolina"
];

const EUROPEAN_COUNTRIES = [
  "All European Countries",
  "United Kingdom",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Netherlands",
  "Ireland",
  "Sweden",
  "Poland",
  "Portugal",
  "Belgium",
  "Switzerland",
  "Austria",
  "Norway",
  "Denmark",
  "Finland",
  "Greece"
];

export default function Rankings() {
  const [selectedClass, setSelectedClass] = useState("All Classes");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedState, setSelectedState] = useState("All Locations");
  const [selectedEuropeanCountry, setSelectedEuropeanCountry] = useState("All European Countries");
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPlayers();
  }, [selectedClass, selectedSport, selectedState, selectedEuropeanCountry]);

  const fetchPlayers = async () => {
    setLoading(true);
    let dbPlayers: any[] = [];
    try {
      const res = await supabase.from('profiles').select('*').limit(50);
      if (res.data && !res.error) dbPlayers = res.data;
    } catch (e) {
      console.warn("Rankings profiles query error:", e);
    }

    // Exactly 1 demo seed player for Rankings alone
    const demoSeedPlayer = {
      IdNumber: '10027189',
      full_name: 'demo',
      position: 'Point Guard / Midfielder',
      sport: 'Basketball & Soccer',
      state: 'Michigan',
      class: '2027',
      graduation_year: '2027',
      avatar_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      bio: '#1 ranked prospect in Michigan (Class of 2027). Dual-sport athlete in Basketball & Soccer with elite vision and stats.',
      is_upgraded: true,
      rank: 1
    };

    const combined = [demoSeedPlayer, ...dbPlayers];

    // Filter by location/country, sport, and class
    let filtered = combined.filter(p => {
      const pState = p.state || p.location || (p.full_name === 'demo' ? 'Michigan' : '');
      const pClass = p.class || p.graduation_year || (p.full_name === 'demo' ? '2027' : '');
      const pSport = p.sport || (p.full_name === 'demo' ? 'Basketball & Soccer' : 'Basketball');

      // Location / State / Region matching logic
      let matchesState = false;
      if (selectedState === "All Locations" || selectedState === "All States") {
        matchesState = true;
      } else if (selectedState === "Canada") {
        matchesState = pState.toLowerCase().includes("canada");
      } else if (selectedState === "United Kingdom") {
        matchesState = pState.toLowerCase().includes("united kingdom") || pState.toLowerCase().includes("uk") || pState.toLowerCase().includes("london") || pState.toLowerCase().includes("britain");
      } else if (selectedState === "Europe") {
        if (selectedEuropeanCountry === "All European Countries") {
          const isEurope = pState.toLowerCase().includes("europe") || 
            EUROPEAN_COUNTRIES.some(c => c !== "All European Countries" && pState.toLowerCase().includes(c.toLowerCase()));
          matchesState = isEurope;
        } else {
          matchesState = pState.toLowerCase().includes(selectedEuropeanCountry.toLowerCase());
        }
      } else {
        matchesState = pState.toLowerCase().includes(selectedState.toLowerCase());
      }

      const matchesClass = selectedClass === "All Classes" || (pClass && pClass.toString() === selectedClass);
      const matchesSport = selectedSport === "All Sports" || (pSport && pSport.toLowerCase().includes(selectedSport.toLowerCase()));

      return matchesState && matchesClass && matchesSport;
    });

    // Ensure demo stays rank #1 if present
    filtered.sort((a, b) => {
      if (a.full_name === 'demo') return -1;
      if (b.full_name === 'demo') return 1;
      return 0;
    });

    setPlayers(filtered);
    setLoading(false);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-8 sm:gap-10">
      <Helmet>
        <title>NFSMEC Rankings | FSMEC Sports Network</title>
        <meta name="description" content="Explore official NFSMEC athletic recruit rankings for basketball and soccer prospects with verified stats and player profiles." />
        <meta property="og:title" content="NFSMEC Recruit Rankings | FSMEC Sports Network" />
        <meta property="og:description" content="Official NFSMEC recruitment rankings for Basketball & Soccer prospects, complete with verified stats and player profiles." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mb-1 shadow-inner">
          <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">National Rankings</h1>
        <p className="text-gray-500 max-w-2xl text-xs sm:text-base font-medium">
          Official recruitment rankings by class and state. Top verified recruits receive Gold Badges for scouts.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-2 rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto p-2 scrollbar-hide">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">Class:</span>
          {CLASSES.map(c => (
            <button 
              key={c}
              onClick={() => setSelectedClass(c)}
              className={`px-4 py-2 rounded-full text-[10px] font-black whitespace-nowrap transition-all uppercase tracking-tight ${selectedClass === c ? 'bg-black text-white shadow-lg shadow-gray-900/20' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
            >
              {c}
            </button>
          ))}
        </div>
        
        <div className="flex flex-row items-center gap-2 w-full md:w-auto p-2 border-t md:border-t-0 md:border-l border-gray-100">
          <select 
            className="flex-1 md:flex-none px-4 py-2.5 rounded-full bg-gray-50 text-[10px] font-black uppercase tracking-tight text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-black/5 cursor-pointer appearance-none text-center"
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
          >
            {SPORTS.map(sp => (
              <option key={sp} value={sp}>{sp}</option>
            ))}
          </select>

          <select 
            className="flex-1 md:flex-none px-4 py-2.5 rounded-full bg-gray-50 text-[10px] font-black uppercase tracking-tight text-gray-800 outline-none focus:bg-white focus:ring-2 focus:ring-black/5 cursor-pointer appearance-none text-center"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              if (e.target.value !== "Europe") {
                setSelectedEuropeanCountry("All European Countries");
              }
            }}
          >
            {LOCATIONS.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>

          {selectedState === "Europe" && (
            <select 
              className="flex-1 md:flex-none px-4 py-2.5 rounded-full bg-blue-50 border border-blue-200 text-[10px] font-black uppercase tracking-tight text-blue-900 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none text-center shadow-sm"
              value={selectedEuropeanCountry}
              onChange={(e) => setSelectedEuropeanCountry(e.target.value)}
            >
              {EUROPEAN_COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Rankings List */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="text-center text-gray-400 py-20 text-xs font-bold uppercase tracking-widest">Loading rankings...</div>
        ) : players.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200 px-6">
            <p className="text-sm font-bold text-gray-500">No players found matching these criteria.</p>
          </div>
        ) : (
          players.map((player, index) => (
            <div key={player.IdNumber || player.id} className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div 
                className="p-4 sm:p-6 flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === player.IdNumber ? null : player.IdNumber)}
              >
                <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                  <div className="text-lg sm:text-2xl font-black text-gray-300 w-6 sm:w-8 text-center flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                    {player.avatar_url ? (
                      <img src={player.avatar_url} alt={player.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 m-auto mt-3 sm:mt-4 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-black text-base sm:text-xl text-gray-900 truncate">{player.full_name}</h3>
                      {player.is_upgraded && (
                        <span className="inline-flex items-center gap-0.5 bg-gradient-to-r from-amber-300 to-amber-500 text-black px-2 py-0.5 rounded-full text-[8px] font-black shadow-sm shrink-0 uppercase" title="Verified Member">
                          <svg className="w-2.5 h-2.5 fill-black" viewBox="0 0 24 24">
                            <path d="M12 2l2.4 2.4 3.4-.2 1.2 3.2 3.2 1.2-.2 3.4L22 12l-2.4 2.4.2 3.4-3.2 1.2-1.2 3.2-3.4-.2L12 22l-2.4-2.4-3.4.2-1.2-3.2-3.2-1.2.2-3.4L2 12l2.4-2.4-.2-3.4 3.2-1.2 1.2-3.2 3.4.2L12 2z"/>
                          </svg>
                          <span>Gold</span>
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1.5 mt-0.5 font-bold uppercase tracking-tight overflow-hidden">
                      <span className="text-gray-900 truncate">{player.position || 'Recruit'}</span>
                      <span className="text-gray-300">•</span>
                      <span className="truncate">{player.state || 'National'}</span>
                      <span className="text-gray-300">•</span>
                      <span>'{(player.class || '2027').toString().slice(-2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 sm:gap-4 ml-2">
                  <div className="hidden xs:flex flex-col items-end shrink-0">
                    <div className="text-[9px] font-black text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100 uppercase tracking-tighter">
                      Rank #{index + 1}
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform flex-shrink-0 ${expandedId === player.IdNumber ? 'rotate-180' : ''}`} />
                </div>
              </div>
              
              {/* Expanded Info */}
              {expandedId === player.IdNumber && (
                <div className="bg-gray-50 px-5 py-6 sm:px-8 border-t border-gray-100 flex flex-col sm:flex-row gap-6">
                  <div className="flex-1">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Scout Evaluation</h4>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">{player.bio || 'Verified athlete prospect in national recruiting network. Evaluations based on verified stats and court footage.'}</p>
                  </div>
                  
                  <div className="flex flex-col gap-3 min-w-[160px]">
                    <Link 
                      to={`/player/${player.IdNumber}`}
                      className="bg-black text-white text-center rounded-2xl py-3 text-xs font-black uppercase tracking-tighter hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10 active:scale-95"
                    >
                      View Profile
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

