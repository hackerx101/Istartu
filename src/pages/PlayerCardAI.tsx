import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Helmet } from 'react-helmet-async';
import { Sparkles, Download, ArrowLeft, Share2, Check, Palette } from 'lucide-react';
import html2canvas from 'html2canvas';

const BACKGROUND_THEMES = [
  { id: 'basketball', name: 'Basketball', bg: 'bg-gradient-to-br from-amber-950 via-zinc-900 to-black', accent: 'border-amber-500/50 text-amber-400', badge: 'bg-amber-500 text-black' },
  { id: 'soccer', name: 'Soccer Pitch', bg: 'bg-gradient-to-br from-emerald-950 via-zinc-900 to-black', accent: 'border-emerald-500/50 text-emerald-400', badge: 'bg-emerald-500 text-black' },
  { id: 'football', name: 'Football Gridiron', bg: 'bg-gradient-to-br from-cyan-950 via-zinc-900 to-black', accent: 'border-cyan-500/50 text-cyan-400', badge: 'bg-cyan-500 text-black' },
  { id: 'baseball', name: 'Baseball Diamond', bg: 'bg-gradient-to-br from-red-950 via-zinc-900 to-black', accent: 'border-red-500/50 text-red-400', badge: 'bg-red-500 text-white' },
  { id: 'cyber', name: 'Cyberpunk Neon', bg: 'bg-gradient-to-br from-fuchsia-950 via-purple-900 to-slate-950', accent: 'border-fuchsia-500/50 text-fuchsia-400', badge: 'bg-fuchsia-500 text-white' },
  { id: 'gold', name: 'Gold Luxury', bg: 'bg-gradient-to-br from-yellow-950 via-zinc-900 to-black', accent: 'border-yellow-500/50 text-yellow-300', badge: 'bg-yellow-400 text-black' },
];

export default function PlayerCardAI() {
  const { PlayerId } = useParams();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [profile, setProfile] = useState<any>(null);
  const [generating, setGenerating] = useState(true);
  const [loadingText, setLoadingText] = useState('Generating');
  const [progress, setProgress] = useState(0);

  // Form State Pre-filled from profile
  const [name, setName] = useState('');
  const [playerClass, setPlayerClass] = useState('Class of 2026');
  const [position, setPosition] = useState('Point Guard');
  const [teamName, setTeamName] = useState('Garexcell Eagles');
  const [rankingScore, setRankingScore] = useState('95 OVR');
  const [theme, setTheme] = useState(BACKGROUND_THEMES[0]);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
    simulateAI();
  }, [PlayerId]);

  const fetchProfile = async () => {
    let fetched = null;
    if (localStorage.getItem('demo_mode') === 'true') {
      fetched = JSON.parse(localStorage.getItem('demo_profile') || '{}');
    } else {
      try {
        const { data } = await supabase.from('profiles').select('*').eq('IdNumber', PlayerId).single();
        fetched = data;
      } catch (e) {
        console.warn("Profiles fetch error:", e);
      }
    }
    if (!fetched) {
      fetched = {
        IdNumber: PlayerId || '10027189',
        full_name: 'Pro Athlete',
        name: 'Pro Athlete',
        position: 'Point Guard',
        is_upgraded: true
      };
    }
    setProfile(fetched);
    setName(fetched.full_name || fetched.name || 'Athlete');
    if (fetched.position) setPosition(fetched.position);
  };

  const simulateAI = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);
      
      if (currentProgress > 30 && currentProgress < 70) {
        setLoadingText('Thinking');
      } else if (currentProgress >= 70) {
        setLoadingText('Finalizing player report');
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        setGenerating(false);
      }
    }, 80);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${name} - Official Player Card`,
          text: `Check out ${name}'s AI generated trading card on FSMEC Sports!`,
          url: shareUrl,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setSaving(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${name.replace(/\s+/g, '_')}_PlayerCard.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to render card image:", err);
      alert("Could not export card as image.");
    } finally {
      setSaving(false);
    }
  };

  if (!profile && !generating) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 flex flex-col items-center min-h-[85vh]">
      <Helmet>
        <title>AI Player Card | {name || 'Athlete'}</title>
      </Helmet>

      {generating ? (
        <div className="flex flex-col items-center justify-center h-full flex-1 gap-8 w-full max-w-md my-auto py-20">
          <Sparkles className="w-16 h-16 text-purple-600 animate-pulse" />
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">{loadingText}...</h2>
          
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 h-full rounded-full transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-gray-500 text-sm text-center">AI Agent is analyzing athletic benchmarks & formatting digital trading card...</p>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-8 animate-[fadeIn_0.4s_ease-out]">
          <div className="flex justify-between items-center">
            <button onClick={() => navigate('/home')} className="flex items-center gap-2 text-gray-600 hover:text-black font-medium text-sm">
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <div className="text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-700 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI Trading Card Studio
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Customizer Sidebar */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
              <h3 className="font-bold text-lg border-b border-gray-100 pb-3 flex items-center justify-between">
                <span>Card Configuration</span>
                <span className="text-xs text-gray-400 font-normal">Pre-filled</span>
              </h3>

              <div className="flex flex-col gap-4 text-sm">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Class</label>
                    <input 
                      type="text" 
                      value={playerClass} 
                      onChange={e => setPlayerClass(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Position</label>
                    <input 
                      type="text" 
                      value={position} 
                      onChange={e => setPosition(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Team Name</label>
                    <input 
                      type="text" 
                      value={teamName} 
                      onChange={e => setTeamName(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Ranking Score</label>
                    <input 
                      type="text" 
                      value={rankingScore} 
                      onChange={e => setRankingScore(e.target.value)} 
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2 flex items-center gap-1">
                    <Palette className="w-3.5 h-3.5" /> Sport Background Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {BACKGROUND_THEMES.map(t => (
                      <button 
                        key={t.id}
                        type="button"
                        onClick={() => setTheme(t)}
                        className={`p-2.5 rounded-xl text-xs font-bold border text-center transition-all ${theme.id === t.id ? 'border-black bg-black text-white shadow-sm' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={handleSaveImage}
                  disabled={saving}
                  className="flex-1 bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm text-sm"
                >
                  <Download className="w-4 h-4" /> {saving ? 'Generating PNG...' : 'Save Card'}
                </button>
                <button 
                  onClick={handleShare}
                  className="flex-1 bg-gray-100 text-gray-900 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                  {copied ? 'Copied Link!' : 'Share'}
                </button>
              </div>
            </div>

            {/* Live Trading Card Preview Container */}
            <div className="lg:col-span-7 flex flex-col items-center">
              <div 
                id="player-card-export" 
                ref={cardRef}
                className={`w-full max-w-md ${theme.bg} rounded-3xl p-7 text-white shadow-2xl border-2 ${theme.accent} flex flex-col gap-6 relative overflow-hidden`}
              >
                {/* Background Watermark/Grid overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none"></div>

                {/* Card Header */}
                <div className="flex justify-between items-start border-b border-white/10 pb-5 z-10">
                  <div className="flex flex-col">
                    <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded ${theme.badge} self-start mb-2`}>
                      OFFICIAL CARD
                    </span>
                    <h2 className="text-2xl font-black tracking-tight leading-tight uppercase font-sans">{name}</h2>
                    <p className="text-gray-400 text-xs font-mono mt-0.5">{position} • {playerClass}</p>
                    <p className="text-xs text-gray-300 font-medium mt-1">{teamName}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={name} 
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-xl" 
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold uppercase">
                        {name.charAt(0)}
                      </div>
                    )}
                    <span className="text-xs font-extrabold text-white bg-white/10 px-2.5 py-1 rounded-full border border-white/20">
                      {rankingScore}
                    </span>
                  </div>
                </div>

                {/* Attributes Radar Grid */}
                <div className="grid grid-cols-4 gap-2 text-center z-10">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                    <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">SPD</div>
                    <div className="font-black text-xl text-white">94</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                    <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">ACC</div>
                    <div className="font-black text-xl text-white">91</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                    <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">IQ</div>
                    <div className="font-black text-xl text-white">96</div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                    <div className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">POT</div>
                    <div className="font-black text-xl text-white">98</div>
                  </div>
                </div>

                {/* AI Summary Section */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm z-10">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Scouting Summary
                    </span>
                    <span className="text-[10px] text-gray-500 font-mono">VERIFIED</span>
                  </div>
                  <p className="text-gray-300 leading-relaxed text-xs">
                    Demonstrates elite court perception, high athletic agility, and exceptional spatial decision-making. High-volume competitor with high recruiting potential in national collegiate leagues.
                  </p>
                </div>

                {/* Footer Bar */}
                <div className="flex justify-between items-center text-[10px] font-mono text-gray-400 border-t border-white/10 pt-4 z-10">
                  <span>ID: {profile?.IdNumber || '10027189'}</span>
                  <span>FSMEC SCOUTING NETWORK</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

