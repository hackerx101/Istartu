import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Trophy, 
  UserCheck, 
  Tv, 
  BookOpen, 
  Target, 
  MessageSquare, 
  FileText, 
  CheckCircle2, 
  Flame, 
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const RECRUITING_TIPS = [
  {
    icon: <Target className="w-6 h-6 text-red-500" />,
    title: "What College Recruiters Actually Look For",
    description: "Beyond raw athleticism, college scouts evaluate specific key pillars of performance and mindset:",
    bullets: [
      "Coachability & Character: Scouts watch how you react when subbed off, how you interact with teammates, and how you receive criticism.",
      "Sports IQ & Game Awareness: Making smart off-ball runs, positioning defensively, and maintaining situational awareness are highly valued.",
      "Raw Athletic Potential: Agility, wingspan, acceleration speed, and physical resilience are critical foundational markers.",
      "Consistent Work Ethic: Game stats matter, but evidence of continuous development, defensive grit, and hustle plays (diving for loose balls) gets you noticed."
    ]
  },
  {
    icon: <UserCheck className="w-6 h-6 text-blue-500" />,
    title: "Perfecting Your FSMEC Profile",
    description: "Your digital profile is your primary business card. Make sure it contains these high-impact elements:",
    bullets: [
      "Verified IdNumber / Identity: Ensure you complete verification to build trust with scouts.",
      "Clear, High-Res Avatar: Use a professional profile photo or action shot. Avoid dark, blurry, or low-quality selfies.",
      "Accurate Academic Data: Keep your GPA, graduating class, and school info fully updated. Scouts search by academic eligibility tiers first.",
      "Contact Info: Ensure your parent/guardian details and contact email are accurate so scouts can officially reach out under recruiting rules."
    ]
  },
  {
    icon: <Tv className="w-6 h-6 text-pink-500" />,
    title: "Crafting the Perfect Highlight Reel",
    description: "Scouts review hundreds of highlights daily. Structure your video for immediate impact:",
    bullets: [
      "The 30-Second Rule: Put your absolute best 3-4 plays at the very beginning. If you don't grab their attention in 30 seconds, they will swipe to the next player.",
      "Visual Cues: Use subtle arrow/spotlight overlays or circles to show where you are on the court or field before the play starts.",
      "Keep it Short & Sweet: A recruiting highlight reel should be 2.5 to 4 minutes maximum. Focus on high-quality clips over quantity.",
      "Show Multiple Dimensions: Don't just show scoring. Show off-ball defense, smart passing, communication, and rebound battles."
    ]
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-emerald-500" />,
    title: "Direct Scout Outreach & Communication",
    description: "When messaging recruiters or college coaches, be concise and professional:",
    bullets: [
      "Personalized Subject Lines: Use standard formats: '[Name] - [Class] - [Sport/Position] - [GPA] Highlight Reel'.",
      "Include Your FSMEC URL: Link directly to your verified profile and FSMEC player card so they can instantly see your full portfolio.",
      "Keep it Brief: Introduce yourself, share your primary athletic stats, and explain why you're interested in their specific athletic program.",
      "Timely Follow-ups: Send updates after major tournaments or when you get new academic reports."
    ]
  },
  {
    icon: <BookOpen className="w-6 h-6 text-purple-500" />,
    title: "Academic Eligibility Tiers",
    description: "Athletics gets you recruited, but academics keeps you on the team. Pay close attention to rules:",
    bullets: [
      "NCAA Eligibility Center: Register as early as your sophomore year of high school to stay on track for Division I or II.",
      "Core Courses Checklist: Track your mandatory high school core courses (English, Math, Natural Sciences, Social Sciences) meticulously.",
      "GPA Standards: Aim for a minimum GPA of 2.3 for Division II and 2.5 for Division I to avoid academic redshirt status."
    ]
  }
];

export default function TipsPage() {
  const navigate = useNavigate();
  
  // Interactive Checklist State to let athletes track their recruitment readiness
  const [checklist, setChecklist] = useState([
    { id: 1, text: "Verify identity and set high-res athlete profile photo", checked: false },
    { id: 2, text: "Generate and save FSMEC / Garexcell Player Card", checked: false },
    { id: 3, text: "Upload 3-minute highlight reel with best plays in the first 30 seconds", checked: false },
    { id: 4, text: "Input verified current GPA and target graduating class", checked: false },
    { id: 5, text: "Follow @garexcell on Instagram & @garexcell on Twitter", checked: false },
    { id: 6, text: "Draft a concise, professional outreach message template", checked: false },
    { id: 7, text: "Check NCAA / NAIA core course eligibility status", checked: false }
  ]);

  const toggleChecklistItem = (id: number) => {
    setChecklist(prev => prev.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const checkedCount = checklist.filter(item => item.checked).length;
  const progressPercent = Math.round((checkedCount / checklist.length) * 100);

  return (
    <div className="bg-white min-h-screen">
      <Helmet>
        <title>Athlete Recruiting Tips & Scout Playbook | FSMEC</title>
        <meta name="description" content="Discover what college athletic recruiters and scouts look for in prospects, how to optimize your profile, highlight tips, and how to get noticed globally." />
      </Helmet>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-16 px-6 sm:py-24 sm:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.15),transparent_50%)]"></div>
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20">
            <Trophy className="w-3.5 h-3.5" /> Scout & Recruiter Playbook
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-none">
            Get Discovered, <br className="hidden sm:block" /> Get Recruited
          </h1>
          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto leading-relaxed">
            The ultimate guide to standing out in the digital recruitment landscape. Learn what scouts actually want, how to optimize your FSMEC profile, and maximize your exposure.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/create/player-card')}
              className="px-6 py-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full font-black text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2"
            >
              <span>Build Player Card</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#readiness-checklist"
              className="px-6 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-full font-black text-xs uppercase tracking-wider transition-colors"
            >
              Readiness Check
            </a>
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-16 sm:space-y-24">
        
        {/* Playbook Tips Grid */}
        <div className="space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-950 uppercase">Recruiting Playbook Sections</h2>
            <p className="text-sm text-gray-500 max-w-lg mx-auto">Expert advice compiled directly from our verified partner network and athletic college scouts.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {RECRUITING_TIPS.map((tip, idx) => (
              <div 
                key={idx} 
                className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-gray-100 flex flex-col gap-5 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-150 flex items-center justify-center shrink-0 shadow-sm">
                    {tip.icon}
                  </div>
                  <h3 className="font-black text-gray-900 text-lg sm:text-xl tracking-tight leading-tight">
                    {tip.title}
                  </h3>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                  {tip.description}
                </p>

                <ul className="space-y-3 mt-1 flex-1">
                  {tip.bullets.map((bullet, bIdx) => {
                    const [head, body] = bullet.split(':');
                    return (
                      <li key={bIdx} className="flex gap-2.5 items-start text-xs text-gray-500 leading-relaxed">
                        <ChevronRight className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span>
                          <strong className="text-gray-800 block font-bold">{head}:</strong>
                          {body}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Sponsor/Network Partner Highlight banner */}
        <div className="bg-slate-950 text-white rounded-[2.5rem] p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,rgba(239,68,68,0.1),transparent_40%)]"></div>
          <div className="flex-1 space-y-4 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/15 border border-red-500/20 px-3 py-1 rounded-full inline-block">
              Network Sponsor Highlight
            </span>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight uppercase leading-none">
              Maximize Your Outreach <br /> with Garexcell Elite Sports
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-xl">
              FSMEC is officially sponsored by Garexcell. By including Garexcell brand sponsors on your personalized player card, you increase your chances of being featured directly on FSMEC TV, our worldwide live-stream recruiting channels, and exclusive showcase invitation pools.
            </p>
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-slate-300 font-bold">
              <span>Instagram: @garexcell</span>
              <span>•</span>
              <span>Twitter: @garexcell</span>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full md:w-80 space-y-4 shrink-0 text-center relative z-10">
            <Flame className="w-10 h-10 text-red-500 mx-auto animate-pulse" />
            <h4 className="font-black text-sm uppercase tracking-wide">Ready to design?</h4>
            <p className="text-slate-400 text-xs leading-normal">
              Create a free custom athletic trading card with your stats, photos, and sponsors in seconds.
            </p>
            <button
              onClick={() => navigate('/create/player-card')}
              className="w-full py-3 bg-white hover:bg-slate-100 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-colors"
            >
              Launch Creator
            </button>
          </div>
        </div>

        {/* Recruiting Readiness Checklist */}
        <div id="readiness-checklist" className="bg-slate-50 border border-gray-100 rounded-[2.5rem] p-6 sm:p-10 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Interactive Tool</span>
              <h3 className="text-xl sm:text-2xl font-black text-gray-950 uppercase tracking-tight">
                Athlete Recruitment Readiness
              </h3>
              <p className="text-xs text-gray-500">Track your essential milestones. Check them off as you complete each task!</p>
            </div>

            {/* Progress Circular representation */}
            <div className="flex items-center gap-3 bg-white border border-gray-150 px-4.5 py-3 rounded-2xl shadow-sm">
              <div className="text-right">
                <span className="text-xs font-black text-gray-900 block">{progressPercent}% Ready</span>
                <span className="text-[9px] text-gray-400 font-bold uppercase">{checkedCount} of {checklist.length} milestones</span>
              </div>
              <div className="relative w-11 h-11 flex items-center justify-center rounded-full bg-slate-50">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="22" cy="22" r="18" fill="transparent" stroke="#f1f5f9" strokeWidth="3" />
                  <circle cx="22" cy="22" r="18" fill="transparent" stroke="#ef4444" strokeWidth="3" 
                    strokeDasharray={113}
                    strokeDashoffset={113 - (113 * progressPercent) / 100}
                    className="transition-all duration-500 ease-out"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-gray-950">🏆</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleChecklistItem(item.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex gap-3.5 items-center ${
                  item.checked 
                    ? 'bg-red-50/30 border-red-200/50 text-gray-800' 
                    : 'bg-white border-gray-150 hover:bg-slate-50/50 text-gray-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                  item.checked 
                    ? 'bg-red-500 border-red-500 text-white' 
                    : 'border-gray-300'
                }`}>
                  {item.checked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3px]" />}
                </div>
                <span className={`text-xs font-semibold leading-snug ${item.checked ? 'line-through text-gray-400' : ''}`}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>

          <div className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-gray-700">All data entered in your FSMEC profile remains secured.</span>
            </div>
            <button
              onClick={() => navigate('/settings')}
              className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0"
            >
              Update My Profile
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
