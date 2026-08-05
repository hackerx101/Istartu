import React, { useState, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronDown, ChevronUp, MapPin, Calendar as CalendarIcon, Ticket, CheckCircle2, User, Share2, Search, Trophy, X, Filter, Sparkles, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Helmet } from 'react-helmet-async';

interface EventItem {
  id: string | number;
  title: string;
  sport: 'Basketball' | 'Soccer' | 'Basketball & Soccer';
  date: string;
  location: string;
  description: string;
  image: string;
  fee?: string;
  spots_remaining?: number;
  organizer?: string;
  registration_url?: string;
}

const INITIAL_EVENTS: EventItem[] = [
  {
    id: 'evt-101',
    title: "Global Scout Showcase 2026",
    sport: "Basketball & Soccer",
    date: "October 15, 2026",
    location: "Los Angeles, CA",
    fee: "Free for Verified Recruits",
    spots_remaining: 18,
    organizer: "FSMEC Global Network",
    registration_url: "https://fsmec.org/events/register/global-showcase-2026",
    description: "An exclusive invite-only event where top-tier Basketball and Soccer athletes showcase their skills in front of professional scouts and college recruiters. Includes metric testing, 5v5 scrimmages, and direct scout Q&A sessions.",
    image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 'evt-102',
    title: "Midwest High School Basketball National Camp",
    sport: "Basketball",
    date: "November 02, 2026",
    location: "Detroit, MI",
    fee: "$25 Athlete Pass",
    spots_remaining: 12,
    organizer: "Garexcell Scouting",
    registration_url: "https://garexcell.com/camps/register/midwest-basketball-2026",
    description: "Regional premier showcase for High School Basketball prospects (Classes 2027-2035). Includes official height/wing-span measurements, shooting drills, and live broadcast on FSMEC TV.",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop"
  }
];

export default function Events() {
  const context = useOutletContext<any>() || {};
  const { session, profile } = context;

  const [eventsList, setEventsList] = useState<EventItem[]>(INITIAL_EVENTS);
  const [loading, setLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string>("All Sports");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});
  
  // Registration modal state
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('user_registered_events');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Form states for modal
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regSport, setRegSport] = useState('Basketball');
  const [regRole, setRegRole] = useState('Athlete');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);

  useEffect(() => {
    fetchDbEvents();
  }, []);

  const fetchDbEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('events').select('*');
      if (data && !error && data.length > 0) {
        const mapped = data.map((d: any) => ({
          id: d.id,
          title: d.title || 'Athletic Showcase',
          sport: d.sport || 'Basketball & Soccer',
          date: d.date || 'Upcoming 2026',
          location: d.location || 'USA',
          description: d.description || 'Verified athlete scouting event.',
          image: d.image || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=800&auto=format&fit=crop',
          fee: d.fee || 'Free Registration',
          spots_remaining: d.spots_remaining || 20,
          organizer: d.organizer || 'FSMEC',
          registration_url: d.registration_url || d.link || `https://fsmec.org/events/register/${d.id}`
        }));
        
        // Combine DB events with initial active events without duplicates
        const existingIds = new Set(INITIAL_EVENTS.map(e => String(e.id)));
        const newDbEvents = mapped.filter((e: any) => !existingIds.has(String(e.id)));
        setEventsList([...INITIAL_EVENTS, ...newDbEvents]);
      }
    } catch (e) {
      console.warn("Db events fetch notice:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string | number) => {
    const key = String(id);
    setExpandedIds(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenRegisterModal = (evt: EventItem) => {
    setSelectedEvent(evt);
    setRegName(profile?.full_name || profile?.name || '');
    setRegEmail(session?.user?.email || '');
    setRegSport(evt.sport.includes('Soccer') ? 'Soccer' : 'Basketball');
    setRegRole(profile?.role === 'recruit' ? 'Scout / Recruiter' : 'Athlete');
    setSuccessTicket(null);
  };

  const handleConfirmRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setIsSubmitting(true);
    const ticketNo = 'FS-' + Math.floor(100000 + Math.random() * 900000);

    setTimeout(() => {
      const updated = [...registeredEventIds, String(selectedEvent.id)];
      setRegisteredEventIds(updated);
      localStorage.setItem('user_registered_events', JSON.stringify(updated));
      setIsSubmitting(false);
      setSuccessTicket(ticketNo);
    }, 500);
  };

  const handleShare = (evt: EventItem) => {
    if (navigator.share) {
      navigator.share({
        title: evt.title,
        text: `Check out ${evt.title} on FSMEC Scouting Network!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Event link copied to clipboard!');
    }
  };

  // Filter events
  const filteredEvents = eventsList.filter(evt => {
    const matchesSport = selectedSport === "All Sports" || 
      evt.sport.toLowerCase().includes(selectedSport.toLowerCase()) || 
      evt.sport === "Basketball & Soccer";
    
    const matchesQuery = !searchQuery.trim() || 
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      evt.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSport && matchesQuery;
  });

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8">
      <Helmet>
        <title>Upcoming Scout Showcase Events - FSMEC</title>
        <meta name="description" content="Register for upcoming Basketball and Soccer scouting events, combines, and national athletic showcases." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg mb-1">
          <CalendarIcon className="w-7 h-7" />
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          Scouting Events & Combines
        </h1>
        <p className="text-gray-500 max-w-xl text-xs sm:text-sm leading-relaxed">
          Discover verified athletic combines, regional tryouts, and scout showcases for Basketball and Soccer.
        </p>
      </div>

      {/* Search & Sport Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50 p-4 rounded-3xl border border-gray-200 shadow-sm">
        {/* Sport Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">Sport:</span>
          {["All Sports", "Basketball", "Soccer"].map(sport => (
            <button
              key={sport}
              onClick={() => setSelectedSport(sport)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                selectedSport === sport ? 'bg-black text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {sport}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events or location..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-800 placeholder-gray-400 outline-none focus:border-black transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Events List */}
      <div className="flex flex-col gap-6">
        {loading ? (
          <div className="text-center py-20 text-gray-400 font-medium">Loading events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 p-8">
            <p className="text-gray-500 text-sm font-semibold">No events match your current filter criteria.</p>
            <button
              onClick={() => { setSelectedSport("All Sports"); setSearchQuery(""); }}
              className="mt-3 px-4 py-2 bg-black text-white rounded-full text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredEvents.map((evt) => {
            const isRegistered = registeredEventIds.includes(String(evt.id));
            const isExpanded = !!expandedIds[String(evt.id)];

            return (
              <div 
                key={evt.id} 
                className="w-full bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col"
              >
                {/* Image Banner */}
                <div className="w-full h-52 sm:h-64 relative bg-gray-100 overflow-hidden">
                  <img 
                    src={evt.image} 
                    alt={evt.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Top Badges */}
                  <div className="absolute top-4 left-4 right-4 flex justify-between items-center gap-2">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-black font-extrabold text-[11px] rounded-full shadow-sm">
                      ⚽🏀 {evt.sport}
                    </span>
                    {evt.spots_remaining && (
                      <span className="px-3 py-1 bg-amber-400 text-black font-black text-[10px] rounded-full shadow-sm">
                        {evt.spots_remaining} Spots Left
                      </span>
                    )}
                  </div>

                  {/* Title Overlay */}
                  <div className="absolute bottom-4 left-6 right-6 text-white">
                    <h2 className="text-xl sm:text-2xl font-black tracking-tight">{evt.title}</h2>
                    <p className="text-xs text-gray-300 font-medium mt-0.5">Organized by {evt.organizer || 'FSMEC Official'}</p>
                  </div>
                </div>

                {/* Event Metadata & CTAs */}
                <div className="p-5 sm:p-6 flex flex-col gap-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-500" />
                      <span>{evt.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{evt.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-700 font-extrabold bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{evt.fee || 'Free Entry'}</span>
                    </div>
                  </div>

                  {/* Action Buttons Row - CALL TO ACTION FOR EVENTS THAT ARE THERE */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-3">
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                      {isRegistered ? (
                        <div className="flex items-center gap-2 px-5 py-3 bg-green-600 text-white rounded-2xl text-xs font-black shadow-sm">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Registered / Spot Reserved</span>
                        </div>
                      ) : (
                        <a
                          href={evt.registration_url || `https://fsmec.org/events/register/${evt.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-black text-white hover:bg-gray-800 rounded-2xl text-xs font-black shadow-md transition-all transform active:scale-95"
                        >
                          <Ticket className="w-4 h-4 text-yellow-400" />
                          <span>Register for Event</span>
                          <ExternalLink className="w-3.5 h-3.5 text-gray-400 ml-0.5" />
                        </a>
                      )}

                      <button
                        onClick={() => handleShare(evt)}
                        className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition-colors"
                        title="Share Event"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button 
                      onClick={() => toggleExpand(evt.id)} 
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-black py-2"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'Read Event Info'}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>
                  </div>

                  {/* Collapsible Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-gray-100 pt-4 mt-1 text-gray-600 text-xs sm:text-sm leading-relaxed"
                      >
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Event Evaluation Summary</h4>
                        <p className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-gray-700">
                          {evt.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Registration Modal (Available for both Guests and Logged In users) */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl relative border border-gray-100"
            >
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-5 right-5 p-2 text-gray-400 hover:text-black rounded-full bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>

              {successTicket ? (
                <div className="flex flex-col items-center text-center gap-4 py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900">Registration Confirmed!</h3>
                  <p className="text-xs text-gray-500 max-w-sm">
                    Your spot for <strong>{selectedEvent.title}</strong> has been saved. Present your ticket ID at the check-in gate.
                  </p>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-full my-2 flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Official Ticket Reference</span>
                    <span className="text-xl font-mono font-black text-black">{successTicket}</span>
                    <span className="text-xs text-gray-500 mt-1">{selectedEvent.date} • {selectedEvent.location}</span>
                  </div>

                  {!session && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-800 text-left w-full mt-1">
                      💡 <strong>Tip for Guests:</strong> <Link to="/auth/signup" className="underline font-bold">Create a free account</Link> to save your ticket directly to your athlete profile.
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-full mt-2 py-3 bg-black text-white rounded-2xl text-xs font-bold"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConfirmRegistration} className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 inline-block mb-1">
                      Event RSVP
                    </span>
                    <h3 className="text-xl font-black text-gray-900">{selectedEvent.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{selectedEvent.date} • {selectedEvent.location}</p>
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-black"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-black"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Primary Sport</label>
                        <select
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-black bg-white"
                          value={regSport}
                          onChange={(e) => setRegSport(e.target.value)}
                        >
                          <option value="Basketball">Basketball</option>
                          <option value="Soccer">Soccer</option>
                          <option value="Both">Both</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-gray-700 block mb-1">Role</label>
                        <select
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:border-black bg-white"
                          value={regRole}
                          onChange={(e) => setRegRole(e.target.value)}
                        >
                          <option value="Athlete">Athlete / Prospect</option>
                          <option value="Scout / Recruiter">Scout / Recruiter</option>
                          <option value="Spectator / Parent">Spectator / Parent</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-3 py-3.5 bg-black hover:bg-gray-800 text-white rounded-2xl text-xs font-black shadow-lg transition-all"
                  >
                    {isSubmitting ? 'Confirming Ticket...' : 'Confirm Registration'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
