import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  User, 
  ExternalLink, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Users, 
  Mail, 
  X, 
  Check, 
  Lock, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles,
  MessageSquare,
  FileText,
  Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SeedPlayer {
  id: string;
  name: string;
  biography: string;
  region: string;
  classYear: string;
  teamName: string;
  socials: {
    instagram?: string;
    twitter?: string;
  };
}

const SEED_PLAYERS: SeedPlayer[] = [
  {
    id: "demarcus-mcpherson",
    name: "Demarcus Mcpherson",
    biography: "Dominant guard prospect showing advanced footwork, exceptional shooting mechanics, and elite defensive hustle in the London under-13 circuit. Highly scouted for transition offense and playmaking ability.",
    region: "London, United Kingdom (u13)",
    classYear: "2031",
    teamName: "London Elite Academy",
    socials: {
      instagram: "demarcus_u13",
      twitter: "demarcus_mc"
    }
  },
  {
    id: "kahlil-henry",
    name: "Kahlil henry",
    biography: "High-flying athletic wing with lock-down perimeter defense, incredible vertical leap, and exceptional basketball IQ. Active participant in the US Southern recruitment circuits with top-tier transition scoring.",
    region: "Atlanta, Georgia, USA",
    classYear: "2029",
    teamName: "Atlanta Celtics AAU",
    socials: {
      instagram: "kahlil_henry",
      twitter: "kahlil_h"
    }
  }
];

const getPrefilledMessage = (template: string, player: SeedPlayer, recruiterName: string, recruiterOrg: string) => {
  const name = recruiterName || '[Recruiter Name]';
  const org = recruiterOrg || '[College/Organization]';
  
  if (template === 'transcript') {
    return `Dear ${player.name},\n\nI am writing on behalf of ${org}. We have been reviewing your profile and athletic film at ${player.teamName}. To help us complete our formal evaluation, could you please provide your latest unofficial high school transcripts and GPA verification?\n\nThank you and keep up the great work!\n\nBest,\n${name}`;
  }
  if (template === 'camp') {
    return `Dear ${player.name},\n\nI am reaching out from ${org} to officially invite you to our upcoming Elite Prospects Athletic Camp and Showcase. Your performance profile and playmaking ability make you a premier candidate for our invitation-only cohort.\n\nWe would love to have you attend. Let us know if you would like registration and scheduling details sent over.\n\nBest,\n${name}`;
  }
  return `Dear ${player.name},\n\nI am with the athletic recruiting staff at ${org}. We are actively tracking top prospects in the Class of ${player.classYear} and would love to learn more about your athletic goals and academic standing.\n\nPlease let us know the best contact email or phone number for you or your high school athletic director.\n\nBest,\n${name}`;
};

export default function Showcase() {
  const [selectedPlayer, setSelectedPlayer] = useState<SeedPlayer | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Recruiter fields
  const [recruiterName, setRecruiterName] = useState(() => localStorage.getItem('fsmec_recruiter_name') || '');
  const [recruiterOrg, setRecruiterOrg] = useState(() => localStorage.getItem('fsmec_recruiter_org') || '');
  const [recruiterEmail, setRecruiterEmail] = useState(() => localStorage.getItem('fsmec_recruiter_email') || '');
  const [recruiterPhone, setRecruiterPhone] = useState(() => localStorage.getItem('fsmec_recruiter_phone') || '');
  
  // Message customization
  const [messageTemplate, setMessageTemplate] = useState<'intro' | 'transcript' | 'camp'>('intro');
  const [customMessage, setCustomMessage] = useState('');
  const [isMessageCustomized, setIsMessageCustomized] = useState(false);

  // Form submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Local storage for sent inquiries
  const [sentInquiryPlayerIds, setSentInquiryPlayerIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fsmec_sent_inquiries');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Whenever selectedPlayer, template, or recruiter info changes, auto-update the prefilled message unless the user customized it
  useEffect(() => {
    if (selectedPlayer && !isMessageCustomized) {
      setCustomMessage(getPrefilledMessage(messageTemplate, selectedPlayer, recruiterName, recruiterOrg));
    }
  }, [selectedPlayer, messageTemplate, recruiterName, recruiterOrg, isMessageCustomized]);

  const handleOpenModal = (player: SeedPlayer) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
    setSubmitSuccess(false);
    setIsMessageCustomized(false);
    // Prefill for this specific player
    setCustomMessage(getPrefilledMessage(messageTemplate, player, recruiterName, recruiterOrg));
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
  };

  const handleTemplateChange = (tmpl: 'intro' | 'transcript' | 'camp') => {
    setMessageTemplate(tmpl);
    setIsMessageCustomized(false);
    if (selectedPlayer) {
      setCustomMessage(getPrefilledMessage(tmpl, selectedPlayer, recruiterName, recruiterOrg));
    }
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCustomMessage(e.target.value);
    setIsMessageCustomized(true);
  };

  const handleResetTemplate = () => {
    setIsMessageCustomized(false);
    if (selectedPlayer) {
      setCustomMessage(getPrefilledMessage(messageTemplate, selectedPlayer, recruiterName, recruiterOrg));
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer) return;

    setIsSubmitting(true);

    // Save recruiter info in localStorage
    localStorage.setItem('fsmec_recruiter_name', recruiterName);
    localStorage.setItem('fsmec_recruiter_org', recruiterOrg);
    localStorage.setItem('fsmec_recruiter_email', recruiterEmail);
    localStorage.setItem('fsmec_recruiter_phone', recruiterPhone);

    // Simulate standard scout API / network request
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);

      // Record this inquiry
      const updatedInquiries = [...sentInquiryPlayerIds, selectedPlayer.id];
      localStorage.setItem('fsmec_sent_inquiries', JSON.stringify(updatedInquiries));
      setSentInquiryPlayerIds(updatedInquiries);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>Athlete Showcase | FSMEC Sports Network</title>
        <meta name="description" content="Discover rising stars, elite prospects, and certified training talent on the FSMEC Showcase. Browse player credentials, region, team affiliations, and highlight reels." />
        
        {/* Open Graph / Webgraph SEO Meta Tags */}
        <meta property="og:title" content="Athlete Showcase | FSMEC Sports Network" />
        <meta property="og:description" content="Discover rising stars, elite prospects, and certified training talent on the FSMEC Showcase. Browse player credentials, region, team affiliations, and highlight reels." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://istartu.com/showcase" />
        <meta property="og:image" content="/icon.svg" />
        <meta property="og:site_name" content="FSMEC Sports Network" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Athlete Showcase | FSMEC Sports Network" />
        <meta name="twitter:description" content="Discover rising stars, elite prospects, and certified training talent on the FSMEC Showcase. Browse player credentials, region, team affiliations, and highlight reels." />
        <meta name="twitter:image" content="/icon.svg" />
      </Helmet>

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
            <ShieldCheck className="w-3.5 h-3.5" /> Verified FSMEC Prospects
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Next-Gen Athlete Showcase
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            FSMEC (International Sports Transformation and Athletic ranking training unit) brings you the elite athletic prospects poised for recruiting and collegiate success.
          </p>
        </div>

        {/* Highlight Video Section (Requested YouTube Card) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-1">Featured Scouting Reel</span>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Kahlil Henry - Atlanta Celtics AAU Highlight Reel</h2>
            </div>
            <div className="flex items-center gap-2 bg-red-50 text-red-700 px-3 py-1.5 rounded-2xl text-xs font-bold border border-red-100 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17z"/><path d="m10 15 5-3-5-3z"/></svg>
              Feature Video
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 items-center">
            {/* YouTube Video Player Embed */}
            <div className="lg:col-span-7 bg-black rounded-2xl aspect-video relative overflow-hidden border border-gray-800 shadow-2xl">
              <iframe 
                src="https://www.youtube.com/embed/AlzaBwvPcqM?rel=0&autoplay=0" 
                title="Kahlil Henry Highlight Reel" 
                className="absolute inset-0 w-full h-full rounded-2xl border-0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
            </div>

            {/* Video Meta Info */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                <h3 className="font-bold text-gray-900 text-sm mb-1">Scout Description:</h3>
                <p className="text-gray-600 text-xs leading-relaxed">
                  Elite athleticism and explosive playmaking highlights from the AAU Spring showcase in Dallas, TX. Displays transition dunks, lateral footwork speed, defensive blocks, and elite perimeter catch-and-shoot packages. Verified scout feedback included.
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Athlete Name</span>
                  <span className="font-bold text-gray-900">Kahlil henry</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Class Year</span>
                  <span className="font-bold text-gray-900">2029</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Affiliation</span>
                  <span className="font-bold text-gray-900">Atlanta Celtics AAU</span>
                </div>
              </div>

              <a 
                href="https://youtube.com/watch?v=AlzaBwvPcqMOS" 
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white text-xs font-black tracking-wide transition-all shadow-sm cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" /> Watch directly on YouTube
              </a>
            </div>
          </div>
        </div>

        {/* Player List Section */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Rising Prospects</h2>
            <p className="text-sm text-gray-500">Seed profiles for premium recruiting opportunities.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {SEED_PLAYERS.map((player) => {
              const alreadyContacted = sentInquiryPlayerIds.includes(player.id);
              return (
                <div key={player.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="space-y-4">
                    {/* Avatar Placeholder (No avatar requested) */}
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                        <User className="w-7 h-7 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-black text-lg text-gray-900 leading-tight">{player.name}</h3>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-1 font-semibold">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{player.region}</span>
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-wider">
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-100 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Class {player.classYear}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-100 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {player.teamName}
                      </span>
                      {alreadyContacted && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3.5px]" /> Contacted
                        </span>
                      )}
                    </div>

                    {/* Biography */}
                    <p className="text-gray-600 text-xs leading-relaxed">
                      {player.biography}
                    </p>
                  </div>

                  {/* Social Channels & Action Button */}
                  <div className="mt-6 pt-4 border-t border-gray-100 flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Connect Details</span>
                      <div className="flex items-center gap-3">
                        {player.socials.instagram && (
                          <a 
                            href={`https://instagram.com/${player.socials.instagram}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 bg-gray-50 hover:bg-pink-50 text-gray-700 hover:text-pink-600 rounded-xl border border-gray-200 hover:border-pink-200 transition-all"
                            title="Instagram profile"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                          </a>
                        )}
                        {player.socials.twitter && (
                          <a 
                            href={`https://twitter.com/${player.socials.twitter}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-500 rounded-xl border border-gray-200 hover:border-blue-200 transition-all"
                            title="X (Twitter) profile"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                          </a>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenModal(player)}
                      className={`w-full py-2.5 px-4 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${
                        alreadyContacted 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/80'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow'
                      }`}
                    >
                      {alreadyContacted ? (
                        <>
                          <Check className="w-4 h-4 stroke-[3px]" />
                          <span>Inquiry Sent - Send Another</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Contact Athlete</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recruiter Contact Athlete Form Modal */}
      <AnimatePresence>
        {isModalOpen && selectedPlayer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="relative w-full max-w-2xl bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              {/* Top accent border */}
              <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />

              {/* Modal Header */}
              <div className="p-6 border-b border-gray-100 flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
                      <Sparkles className="w-2.5 h-2.5" /> FSMEC Secured
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100">
                      Partner Garexcell
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                    Direct Athlete Inquiry
                  </h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    Connect directly with <strong className="text-gray-900">{selectedPlayer.name}</strong> (Class of {selectedPlayer.classYear}) and their certified representatives.
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {submitSuccess ? (
                /* Success State Screen */
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 text-center space-y-6 overflow-y-auto"
                >
                  <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <Check className="w-8 h-8 stroke-[3px]" />
                  </div>
                  
                  <div className="space-y-2 max-w-md mx-auto">
                    <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight">Proposal Delivered!</h4>
                    <p className="text-xs text-gray-600 leading-relaxed font-semibold">
                      Your recruiting inquiry has been securely routed and dispatched to <strong className="text-gray-900">{selectedPlayer.name}</strong> and their athletic advisor.
                    </p>
                    <p className="text-[11px] text-gray-500 bg-gray-50 border border-gray-100 p-3.5 rounded-xl mt-3 font-semibold leading-relaxed">
                      A copy of this communication, along with verified scout credentials, has been sent to your work email: <strong className="text-gray-800">{recruiterEmail}</strong>.
                    </p>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={handleCloseModal}
                      className="px-6 py-3 bg-gray-900 hover:bg-black text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow"
                    >
                      Close Portal
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* Form Screen */
                <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
                  {/* Select template */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider block">Inquiry Template Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => handleTemplateChange('intro')}
                        className={`py-2 px-3 rounded-xl border text-center text-[11px] font-bold transition-all ${
                          messageTemplate === 'intro'
                            ? 'bg-blue-50 border-blue-200 text-blue-700 font-black'
                            : 'bg-white border-gray-155 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        Recruiting Intro
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTemplateChange('transcript')}
                        className={`py-2 px-3 rounded-xl border text-center text-[11px] font-bold transition-all ${
                          messageTemplate === 'transcript'
                            ? 'bg-blue-50 border-blue-200 text-blue-700 font-black'
                            : 'bg-white border-gray-155 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        Request Transcript
                      </button>
                      <button
                        type="button"
                        onClick={() => handleTemplateChange('camp')}
                        className={`py-2 px-3 rounded-xl border text-center text-[11px] font-bold transition-all ${
                          messageTemplate === 'camp'
                            ? 'bg-blue-50 border-blue-200 text-blue-700 font-black'
                            : 'bg-white border-gray-155 hover:bg-gray-50 text-gray-600'
                        }`}
                      >
                        Camp Invitation
                      </button>
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Inquiry Message Body</label>
                      {isMessageCustomized && (
                        <button
                          type="button"
                          onClick={handleResetTemplate}
                          className="text-[10px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset to template
                        </button>
                      )}
                    </div>
                    <textarea
                      value={customMessage}
                      onChange={handleMessageChange}
                      rows={6}
                      required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-500 outline-none transition-all leading-relaxed"
                      placeholder="Type your scouting message here..."
                    />
                    <p className="text-[10px] text-gray-400 font-semibold">
                      ⚡ Prefills your recruiter signature details automatically.
                    </p>
                  </div>

                  {/* Recruiter Credentials */}
                  <div className="space-y-3.5 border-t border-gray-100 pt-5">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Recruiter Credentials</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-600 uppercase block">Full Name</label>
                        <input
                          type="text"
                          required
                          value={recruiterName}
                          onChange={(e) => setRecruiterName(e.target.value)}
                          placeholder="e.g. Coach Sarah Jenkins"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-600 uppercase block">University / Athletic Org</label>
                        <input
                          type="text"
                          required
                          value={recruiterOrg}
                          onChange={(e) => setRecruiterOrg(e.target.value)}
                          placeholder="e.g. Stanford University Basketball"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-600 uppercase block">Work Email Address</label>
                        <input
                          type="email"
                          required
                          value={recruiterEmail}
                          onChange={(e) => setRecruiterEmail(e.target.value)}
                          placeholder="e.g. sjenkins@stanford.edu"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-600 uppercase block">Work Phone (Optional)</label>
                        <input
                          type="tel"
                          value={recruiterPhone}
                          onChange={(e) => setRecruiterPhone(e.target.value)}
                          placeholder="e.g. +1 (650) 555-0199"
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-800 focus:bg-white focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Restrict notification banner */}
                  <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                    <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-amber-900 leading-none">Security Compliance Notice</p>
                      <p className="text-[10px] text-amber-700 leading-normal font-semibold">
                        This communication channel is strictly restricted to official recruiters, coaches, and sports scouts. Messages violating school/college compliance guidelines will be flagged.
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="border-t border-gray-100 pt-5 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-black uppercase tracking-wider rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Sending Proposal...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Send Inquiry Proposal</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
