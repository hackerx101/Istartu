import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useOutletContext, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  Sparkles, 
  User, 
  Check, 
  Palette, 
  RotateCcw, 
  Maximize2, 
  MapPin,
  Flame,
  Info,
  Share2,
  Printer,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// High-fidelity background presets defined entirely in CSS Tailwind classes for instant, CORS-safe rendering
const CARD_BACKGROUNDS = [
  {
    id: 'crimson_elite',
    name: 'Garexcell Crimson Force',
    bgClass: 'bg-gradient-to-br from-red-950 via-zinc-900 to-black',
    borderColor: 'border-red-600',
    accentColor: 'text-red-500',
    badgeBg: 'bg-red-600 text-white',
    subtext: 'High-octane scarlet athletic glow',
    textColor: 'text-white'
  },
  {
    id: 'neon_cyberpunk',
    name: 'Cyber Gridiron',
    bgClass: 'bg-gradient-to-br from-violet-950 via-slate-900 to-emerald-950',
    borderColor: 'border-fuchsia-500',
    accentColor: 'text-fuchsia-400',
    badgeBg: 'bg-fuchsia-500 text-white',
    subtext: 'Synthetic neon cyber mesh',
    textColor: 'text-white'
  },
  {
    id: 'fsmec_gold',
    name: 'FSMEC Premium Gold',
    bgClass: 'bg-gradient-to-br from-yellow-950 via-neutral-900 to-stone-950',
    borderColor: 'border-yellow-500',
    accentColor: 'text-yellow-400',
    badgeBg: 'bg-yellow-500 text-black',
    subtext: 'Luxurious champion carbon marble',
    textColor: 'text-white'
  },
  {
    id: 'toxic_green',
    name: 'Toxic Green Velocity',
    bgClass: 'bg-gradient-to-br from-emerald-950 via-stone-900 to-black',
    borderColor: 'border-emerald-400',
    accentColor: 'text-emerald-400',
    badgeBg: 'bg-emerald-400 text-black',
    subtext: 'Intense radioactive energy wave',
    textColor: 'text-white'
  },
  {
    id: 'electric_blue',
    name: 'Electric Blizzard Blue',
    bgClass: 'bg-gradient-to-br from-blue-950 via-slate-900 to-black',
    borderColor: 'border-blue-400',
    accentColor: 'text-blue-400',
    badgeBg: 'bg-blue-400 text-white',
    subtext: 'High-voltage subzero shockwave',
    textColor: 'text-white'
  },
  {
    id: 'classic_light',
    name: 'Classic Platinum',
    bgClass: 'bg-gradient-to-br from-slate-50 via-zinc-100 to-slate-200',
    borderColor: 'border-slate-800',
    accentColor: 'text-slate-800',
    badgeBg: 'bg-slate-800 text-white',
    subtext: 'Crisp minimal high-contrast white',
    textColor: 'text-slate-900'
  }
];

export default function CreatePlayerCard() {
  const { session } = useOutletContext<any>();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  // Form input states
  const [playerName, setPlayerName] = useState('Prospect Name');
  const [playerClass, setPlayerClass] = useState('Class of 2027');
  const [teamName, setTeamName] = useState('Elite Academy');
  const [sportName, setSportName] = useState('Basketball');
  const [selectedBg, setSelectedBg] = useState(CARD_BACKGROUNDS[0]);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [format, setFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  
  // Advanced position/zoom adjustment for the uploaded avatar image
  const [zoom, setZoom] = useState(1);
  const [offsetY, setOffsetY] = useState(0);
  const [offsetX, setOffsetX] = useState(0);

  // Free card creation limits (guest users can make 2 free cards)
  const [savedCount, setSavedCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [limitWarning, setLimitWarning] = useState(false);
  const [isIgModalOpen, setIsIgModalOpen] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);

  useEffect(() => {
    const count = parseInt(localStorage.getItem('garexcell_free_cards_saved_count') || '0', 10);
    setSavedCount(count);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
        // Reset scale and offsets when new image is loaded
        setZoom(1);
        setOffsetY(0);
        setOffsetX(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;

    // Check limits if NOT logged in
    const isLoggedIn = !!session?.user;
    if (!isLoggedIn && savedCount >= 2) {
      setLimitWarning(true);
      return;
    }

    setIsDownloading(true);

    try {
      // Small pause to allow state to settle
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Premium ultra-high print-ready resolution
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      const mimeTypes = {
        png: 'image/png',
        jpeg: 'image/jpeg',
        webp: 'image/webp'
      };

      const dataUrl = canvas.toDataURL(mimeTypes[format]);
      const link = document.createElement('a');
      link.download = `${playerName.replace(/\s+/g, '_')}_GarexcellCard.${format}`;
      link.href = dataUrl;
      link.click();

      // Only increment counts on success if NOT logged in
      if (!isLoggedIn) {
        const newCount = savedCount + 1;
        localStorage.setItem('garexcell_free_cards_saved_count', newCount.toString());
        setSavedCount(newCount);
      }
    } catch (err) {
      console.error('Failed to render or download player card:', err);
      alert('An error occurred while rendering your card. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePdfDownload = async () => {
    if (!cardRef.current) return;

    // Check limits if NOT logged in
    const isLoggedIn = !!session?.user;
    if (!isLoggedIn && savedCount >= 2) {
      setLimitWarning(true);
      return;
    }

    setIsDownloading(true);

    try {
      // Small pause to allow state to settle
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Premium ultra-high print-ready resolution
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Card aspect ratio is w=360, h=520
      const pdfWidth = 120; // mm
      const pdfHeight = (520 / 360) * pdfWidth; // mm
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [pdfWidth, pdfHeight]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${playerName.replace(/\s+/g, '_')}_GarexcellCard.pdf`);

      // Only increment counts on success if NOT logged in
      if (!isLoggedIn) {
        const newCount = savedCount + 1;
        localStorage.setItem('garexcell_free_cards_saved_count', newCount.toString());
        setSavedCount(newCount);
      }
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('An error occurred while rendering your high-resolution PDF. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`Check out my official @Garexcell Athlete Player Card! Created free on the Garexcell/FSMEC platform. Fellow athletes, go create yours now and tag @Garexcell!`);
    const hashtags = 'Garexcell,FSMEC,Recruiting,Athlete';
    const url = encodeURIComponent(window.location.origin + '/showcase');
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}&hashtags=${hashtags}&url=${url}`;
    window.open(twitterUrl, '_blank');
  };

  const handleShareInstagram = async () => {
    if (!cardRef.current) return;

    // Check limits if NOT logged in
    const isLoggedIn = !!session?.user;
    if (!isLoggedIn && savedCount >= 2) {
      setLimitWarning(true);
      return;
    }

    setIsDownloading(true);

    try {
      // Small pause to allow state to settle
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(cardRef.current, {
        scale: 3, // Premium ultra-high resolution
        useCORS: true,
        backgroundColor: null,
        logging: false
      });

      // Save/Download card image first so "keep save" is true
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${playerName.replace(/\s+/g, '_')}_GarexcellCard_Instagram.png`;
      link.href = dataUrl;
      link.click();

      // Copy Instagram caption to clipboard
      const captionText = `Just created my premium recruit player card on @garexcell! Check out my athletic profile and stay tuned. Create yours free today at ${window.location.origin}! @garexcell #garexcell #FSMEC #Recruiting`;
      await navigator.clipboard.writeText(captionText);
      setCopiedCaption(true);

      // Only increment counts on success if NOT logged in
      if (!isLoggedIn) {
        const newCount = savedCount + 1;
        localStorage.setItem('garexcell_free_cards_saved_count', newCount.toString());
        setSavedCount(newCount);
      }

      // Show instruction modal
      setIsIgModalOpen(true);
    } catch (err) {
      console.error('Failed to download or share to Instagram:', err);
      alert('An error occurred while preparing your Instagram post. Please try downloading the card manually.');
    } finally {
      setIsDownloading(false);
    }
  };

  const resetCardAdjustments = () => {
    setZoom(1);
    setOffsetY(0);
    setOffsetX(0);
  };

  const remainingFreeCards = Math.max(0, 2 - savedCount);
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row">
      <Helmet>
        <title>Create Free Custom Athlete Player Card | Sponsored by Garexcell</title>
        <meta name="description" content="Design and customize your premium sports recruiting card for free! Select backgrounds, set your details, and download. Sponsored by Garexcell." />
      </Helmet>

      {/* Control panel (Left) */}
      <div className="w-full md:w-[42%] lg:w-[38%] xl:w-[34%] bg-slate-900 border-r border-slate-800 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto max-h-screen">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')} 
            className="p-2.5 bg-slate-850 hover:bg-slate-800 rounded-xl transition-colors border border-slate-800 text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-1.5 uppercase">
              <Flame className="w-5 h-5 text-red-500 animate-pulse" /> Custom Card Maker
            </h1>
            <p className="text-xs text-slate-400">Design your high-performance recruiting card</p>
          </div>
        </div>

        {/* Free Status Badge */}
        <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Pricing Plan</span>
            <p className="text-sm font-bold text-white">
              {isLoggedIn ? '✨ Unlimited Club Member Access' : `Free Guest Tier: ${remainingFreeCards} free remaining`}
            </p>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {isLoggedIn ? 'Unlimited' : `${savedCount}/2 Used`}
          </span>
        </div>

        {/* Form elements */}
        <div className="space-y-5">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Card Details</h2>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Athlete Name</label>
            <input 
              type="text" 
              maxLength={25}
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-4 py-3.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all placeholder:text-slate-500 font-medium text-white"
              placeholder="e.g. Jordan Cooper"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Sport / Position</label>
              <input 
                type="text" 
                maxLength={20}
                value={sportName}
                onChange={(e) => setSportName(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-4 py-3.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all placeholder:text-slate-500 font-medium text-white"
                placeholder="e.g. Basketball / SG"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Graduating Class</label>
              <input 
                type="text" 
                maxLength={18}
                value={playerClass}
                onChange={(e) => setPlayerClass(e.target.value)}
                className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-4 py-3.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all placeholder:text-slate-500 font-medium text-white"
                placeholder="e.g. Class of 2027"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Team / Academy Name</label>
            <input 
              type="text" 
              maxLength={30}
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full bg-slate-850 border border-slate-700/80 rounded-xl px-4 py-3.5 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/10 outline-none transition-all placeholder:text-slate-500 font-medium text-white"
              placeholder="e.g. West Coast Elite"
            />
          </div>
        </div>

        {/* Upload Avatar */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Athlete Photo</h2>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="w-16 h-16 bg-slate-800 rounded-full border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-500" />
              )}
            </div>

            <label className="flex-1 w-full bg-slate-800 hover:bg-slate-755 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
              <Upload className="w-5 h-5 text-slate-400 mb-1" />
              <span className="text-xs font-bold text-slate-300">Upload high-res action photo</span>
              <span className="text-[10px] text-slate-500 mt-0.5">JPG, PNG or WEBP up to 5MB</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </label>
          </div>

          {avatarUrl && (
            <div className="bg-slate-850 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Fine-tune photo positioning</span>
                <button 
                  onClick={resetCardAdjustments}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors"
                  title="Reset positions"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Zoom slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Zoom / Scale</span>
                  <span>{zoom.toFixed(1)}x</span>
                </div>
                <input 
                  type="range" 
                  min="0.5" 
                  max="3" 
                  step="0.1" 
                  value={zoom} 
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full accent-red-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Horizontal slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Horizontal Alignment</span>
                  <span>{offsetX}px</span>
                </div>
                <input 
                  type="range" 
                  min="-150" 
                  max="150" 
                  step="2" 
                  value={offsetX} 
                  onChange={(e) => setOffsetX(parseInt(e.target.value))}
                  className="w-full accent-red-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Vertical slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Vertical Alignment</span>
                  <span>{offsetY}px</span>
                </div>
                <input 
                  type="range" 
                  min="-150" 
                  max="150" 
                  step="2" 
                  value={offsetY} 
                  onChange={(e) => setOffsetY(parseInt(e.target.value))}
                  className="w-full accent-red-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Background picker */}
        <div className="space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Select Theme Background</h2>
          <div className="grid grid-cols-2 gap-2">
            {CARD_BACKGROUNDS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => setSelectedBg(bg)}
                className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between h-20 ${
                  selectedBg.id === bg.id 
                    ? 'border-white bg-slate-850 shadow-lg' 
                    : 'border-slate-800 bg-slate-900/50 hover:bg-slate-850/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black tracking-tight truncate max-w-[80%]">{bg.name}</span>
                  {selectedBg.id === bg.id && (
                    <div className="w-3.5 h-3.5 bg-green-500 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-2.5 h-2.5 text-black stroke-[3px]" />
                    </div>
                  )}
                </div>
                <div className="text-[9px] text-slate-400 truncate w-full">{bg.subtext}</div>
                <div className="w-full h-1 rounded bg-slate-850 overflow-hidden mt-1 flex gap-0.5">
                  <span className={`flex-1 ${bg.bgClass}`}></span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Format Selector & Save Options */}
        <div className="space-y-4">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 pb-2">Export &amp; Share Options</h2>
          
          <div className="flex bg-slate-850 p-1.5 rounded-2xl border border-slate-800">
            {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFormat(fmt)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
                  format === fmt 
                    ? 'bg-white text-black font-black' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                .{fmt}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full bg-white hover:bg-slate-100 text-black rounded-2xl py-3.5 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Rendering Premium Image...' : 'Save & Download Card'}</span>
            </button>

            <button
              onClick={handlePdfDownload}
              disabled={isDownloading}
              className="w-full bg-slate-800 hover:bg-slate-700/80 border border-slate-700/80 text-white rounded-2xl py-3.5 flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              <Printer className="w-4 h-4 text-red-500" />
              <span>{isDownloading ? 'Preparing PDF...' : 'Print / Export High-Res PDF'}</span>
            </button>
          </div>

          {/* Social Share Portal */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Instant Recruit Social Share</span>
            <div className="flex gap-2">
              {/* Share to Twitter */}
              <button
                onClick={handleShareTwitter}
                className="flex-1 bg-slate-900 hover:bg-slate-850 border border-slate-850 hover:border-slate-800 text-white rounded-2xl py-3 px-3 flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Share to X</span>
              </button>

              {/* Share to Instagram */}
              <button
                onClick={handleShareInstagram}
                className="flex-1 bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-2xl py-3 px-3 flex items-center justify-center gap-2 font-black text-[11px] uppercase tracking-wider transition-all cursor-pointer shadow-md animate-pulse hover:animate-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-white"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                <span>Instagram</span>
              </button>
            </div>
          </div>

          {/* Social Tag reminder banner */}
          <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 space-y-2">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 bg-yellow-400/10 text-yellow-400 rounded-lg shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-300 leading-normal font-medium">
                Remember to tag <strong className="text-white">@garexcell</strong> and <strong className="text-white">#FSMEC</strong> when you post your player card on Instagram or Twitter/X to get your profile featured &amp; scouts' attention!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Pane (Right) */}
      <div className="flex-1 bg-slate-950 flex flex-col items-center justify-center p-6 md:p-12 relative min-h-[600px] md:min-h-screen">
        {/* Floating background grids for cinematic look */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_60%)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-20"></div>

        <div className="w-full max-w-md flex flex-col items-center gap-6 z-10">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded-full">
              Live Interactive Canvas Preview
            </span>
            <p className="text-xs text-slate-400 mt-1">Updates in real-time. Render is pixel-perfect.</p>
          </div>

          {/* Interactive responsive scaling wrapper to prevent clipping & look larger on desktops */}
          <div className="w-full flex justify-center items-center overflow-visible py-4 sm:py-6">
            <div className="scale-[0.9] xs:scale-[0.95] sm:scale-100 md:scale-105 lg:scale-115 xl:scale-125 transition-transform duration-300 origin-center">
              {/* The Player Card Element itself, to be captured by html2canvas */}
              <div 
                ref={cardRef}
                id="garexcell-athletic-card"
                className={`w-[360px] h-[520px] rounded-3xl ${selectedBg.bgClass} border-4 ${selectedBg.borderColor} shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col relative shrink-0 select-none ${selectedBg.textColor}`}
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                {/* Holographic scanner diagonal lines layer */}
                <div className="absolute inset-0 opacity-[0.06] bg-[repeating-linear-gradient(45deg,#fff,#fff_10px,transparent_10px,transparent_20px)] pointer-events-none"></div>

                {/* FSMEC Corner Badges */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-xl">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                    <span className="text-[9px] font-black tracking-widest uppercase">FSMEC VERIFIED</span>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center">
                    <span className="text-[8px] font-black tracking-tighter text-yellow-400">PRO</span>
                  </div>
                </div>

                {/* Large background watermarked sport typography */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 text-center text-white/5 font-black text-6xl tracking-widest uppercase select-none pointer-events-none z-0">
                  {sportName || 'ATHLETE'}
                </div>

                {/* Central Athlete Photo Mask with geometric athletic shield */}
                <div className="flex-1 w-full relative overflow-hidden flex items-end justify-center pt-10 z-10">
                  {avatarUrl ? (
                    <div className="w-full h-full relative">
                      <img 
                        src={avatarUrl} 
                        alt={playerName} 
                        className="absolute w-full h-full object-cover origin-center"
                        style={{
                          transform: `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`,
                          filter: 'contrast(1.05) brightness(1.02)'
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/20 gap-2 border-b border-white/5 bg-black/20">
                      <User className="w-20 h-20 opacity-40" />
                      <span className="text-xs font-black uppercase tracking-wider">No Photo Uploaded</span>
                    </div>
                  )}

                  {/* High-contrast stylized athletic gradient shade over bottom of image */}
                  <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-black via-black/85 to-transparent pointer-events-none z-10"></div>
                </div>

                {/* Info and stats overlay at bottom of card */}
                <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 p-5 space-y-4 relative z-20">
                  {/* Athlete Meta */}
                  <div className="space-y-1 text-center">
                    <span className={`text-[10px] font-black uppercase tracking-widest ${selectedBg.accentColor}`}>
                      {sportName || 'Athlete Prospect'}
                    </span>
                    <h3 className="text-xl font-black tracking-tighter uppercase truncate max-w-full drop-shadow-md text-white">
                      {playerName || 'Your Name'}
                    </h3>
                  </div>

                  {/* Mini Stats Badges */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex flex-col justify-center min-w-0">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block truncate">Academy / Team</span>
                      <span className="text-[11px] font-black text-white truncate block">{teamName || 'Independent'}</span>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-xl flex flex-col justify-center min-w-0">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block truncate">Recruiting Class</span>
                      <span className="text-[11px] font-black text-white truncate block">{playerClass || 'Prospect'}</span>
                    </div>
                  </div>

                  {/* SPONSORED BY GAREXCELL & BRANDING */}
                  <div className="border-t border-white/5 pt-3.5 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                      <span className="text-[7px] font-black uppercase text-gray-400 tracking-wider">Sponsored by</span>
                      <span className="text-xs font-black text-white tracking-tighter uppercase flex items-center gap-1">
                        Garexcell <span className="text-[7px] bg-red-600 px-1 py-0.5 rounded text-white font-bold tracking-normal">SPORTS</span>
                      </span>
                    </div>

                    {/* Social media tags on card */}
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-pink-400"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                        <span className="text-[8px] font-black">@garexcell</span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-2.5 h-2.5 text-blue-400"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                        <span className="text-[8px] font-black">@garexcell</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Tag reminder below card */}
          <p className="text-center text-xs text-slate-400 px-6 max-w-sm">
            ⚡ All cards designed using this free utility are officially licensed &amp; powered by <strong>Garexcell Elite Sports network</strong>.
          </p>
        </div>
      </div>

      {/* Free Limit Reached Modal Warning */}
      {limitWarning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-6 text-center shadow-2xl">
            <div className="w-16 h-16 bg-red-600/15 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <Flame className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Free Limit Reached!</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Guest accounts are allowed up to 2 free player card saves. Log in or create a free athlete account on FSMEC to unlock unlimited card designs, advanced themes, and scout visibility.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Link 
                to="/auth/signup" 
                className="w-full bg-white hover:bg-slate-100 text-black rounded-xl py-3.5 font-bold text-sm uppercase transition-colors"
              >
                Sign Up Free
              </Link>
              <Link 
                to="/auth/login" 
                className="w-full bg-slate-800 hover:bg-slate-755 text-white rounded-xl py-3.5 font-bold text-sm transition-colors"
              >
                Log In
              </Link>
              <button 
                onClick={() => setLimitWarning(false)}
                className="text-xs text-slate-500 hover:text-slate-300 font-bold underline transition-colors pt-2"
              >
                Go Back &amp; Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instagram Share Instructions Modal */}
      {isIgModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full space-y-5 text-center shadow-2xl relative">
            <button 
              onClick={() => setIsIgModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-850 hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 bg-pink-600/15 border border-pink-500/30 text-pink-500 rounded-full flex items-center justify-center mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black uppercase tracking-tight text-white">Saved &amp; Caption Copied!</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your premium player card has been successfully generated &amp; downloaded! Follow these quick steps to get featured on Instagram:
              </p>
            </div>

            {/* Instruction Steps */}
            <div className="bg-slate-850 border border-slate-800 rounded-2xl p-4 text-left space-y-3">
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-pink-600/20 text-pink-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">1</span>
                <p className="text-xs text-slate-300 leading-normal">
                  Open <strong>Instagram App</strong> on your device or browser.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-pink-600/20 text-pink-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">2</span>
                <p className="text-xs text-slate-300 leading-normal">
                  Create a new Feed Post or Story using your downloaded player card.
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-pink-600/20 text-pink-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">3</span>
                <p className="text-xs text-slate-300 leading-normal">
                  <strong>Paste the caption</strong> into the description field (already copied!).
                </p>
              </div>
              <div className="flex gap-2.5 items-start">
                <span className="w-5 h-5 rounded-full bg-pink-600/20 text-pink-400 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">4</span>
                <p className="text-xs text-slate-300 leading-normal">
                  Tag <strong className="text-white">@garexcell</strong> and use hashtag <strong className="text-white">#Garexcell</strong> to get shared &amp; noticed by scouts!
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={async () => {
                  const captionText = `Just created my premium recruit player card on @garexcell! Check out my athletic profile and stay tuned. Create yours free today at ${window.location.origin}! @garexcell #garexcell #FSMEC #Recruiting`;
                  await navigator.clipboard.writeText(captionText);
                  setCopiedCaption(true);
                  setTimeout(() => setCopiedCaption(false), 2000);
                }}
                className="w-full bg-slate-800 hover:bg-slate-750 text-white border border-slate-700/80 rounded-xl py-3 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5"
              >
                {copiedCaption ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Caption Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Copy Caption Again</span>
                  </>
                )}
              </button>

              <a 
                href="https://instagram.com" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white rounded-xl py-3 font-bold text-xs uppercase tracking-wider transition-colors text-center flex items-center justify-center gap-1.5"
              >
                <span>Open Instagram</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button 
                onClick={() => setIsIgModalOpen(false)}
                className="text-xs text-slate-500 hover:text-slate-300 font-bold underline transition-colors pt-1"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
