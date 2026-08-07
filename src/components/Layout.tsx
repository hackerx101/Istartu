import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Home, Tag, MessageCircle, Calendar, Settings as SettingsIcon, Search, User, Globe, Camera, Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';
import AIFab from './AIFab';
import { setIstartuSharedSession, getIstartuSharedSession } from '../lib/authSession';

export default function Layout() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const host = window.location.hostname;
    const path = window.location.pathname;

    // Subdomain redirect logic for FSMEC TV
    if (host === 'istartu.com' && path.startsWith('/tv')) {
      const newPath = path.replace('/tv', '') || '/';
      window.location.href = `https://tv.istartu.com${newPath}`;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (localStorage.getItem('demo_mode') === 'true') {
      const demoUser = { id: 'demo-user-1', email: 'test@demo.com' };
      setSession({ user: demoUser });
      
      const defaultDemoProfile = {
        id: 'demo-user-1',
        user_id: 'demo-user-1',
        full_name: 'Garexcell Elite Prospect',
        IdNumber: '10027189',
        position: 'Point Guard / Midfielder',
        sport: 'Basketball & Soccer',
        is_upgraded: true,
        is_public: true,
        role: 'recruit',
        wallet_credits: 25.00,
        bio: 'Top ranked athlete prospect (Class of 2027). Dual-sport athlete in Basketball & Soccer.',
        avatar_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=200&auto=format&fit=crop',
        ig_link: 'garexcell',
        twitter_link: 'fsmec'
      };

      const defaultDemoSub = {
        id: 'sub-demo-1',
        user_id: 'demo-user-1',
        plan_name: 'Pro Scout Tier',
        is_upgraded: true,
        renewal_date: '2028-12-31'
      };

      try {
        const p = JSON.parse(localStorage.getItem('demo_profile') || '{}');
        const activeProfile = { ...defaultDemoProfile, ...p };
        setProfile(activeProfile);
        setIstartuSharedSession({ user: demoUser }, activeProfile);
      } catch (e) {
        setProfile(defaultDemoProfile);
        setIstartuSharedSession({ user: demoUser }, defaultDemoProfile);
      }

      try {
        const s = JSON.parse(localStorage.getItem('demo_subscription') || '{}');
        setSubscription({ ...defaultDemoSub, ...s });
      } catch (e) {
        setSubscription(defaultDemoSub);
      }
      return;
    }

    // Check cross-domain shared session or restore
    const restored = getIstartuSharedSession();

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      const activeSession = currentSession || (restored?.sharedSession?.user ? { user: restored.sharedSession.user, access_token: restored.token } : null);
      setSession(activeSession);
      if (activeSession) {
        fetchProfile(activeSession.user.id);
      }
    });

    const {
      data: { subscription: authSub },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (localStorage.getItem('demo_mode') === 'true') return;
      
      setSession(newSession);
      if (newSession) {
        fetchProfile(newSession.user.id);
      } else if (!restored?.token) {
        setProfile(null);
        setSubscription(null);
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const userEmail = session?.user?.email ? session.user.email.split('@')[0] : '';
    const metadataName = session?.user?.user_metadata?.full_name || metadataNameFallback();

    function metadataNameFallback() {
      if (userEmail) {
        return userEmail.charAt(0).toUpperCase() + userEmail.slice(1);
      }
      return 'User Account';
    }

    const defaultProfile = {
      id: userId,
      user_id: userId,
      full_name: metadataName,
      IdNumber: '100' + Math.floor(10000 + Math.random() * 90000).toString(),
      is_upgraded: false,
      role: 'recruit',
      is_public: true,
      wallet_credits: 0.00
    };

    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      let activeProf = defaultProfile;
      if (data && !error && data.full_name) {
        activeProf = { ...defaultProfile, ...data };
      } else if (data) {
        activeProf = { ...defaultProfile, ...data, full_name: data.full_name || metadataName };
      }
      setProfile(activeProf);
      setIstartuSharedSession(session || { user: { id: userId } }, activeProf);
    } catch (e) {
      const activeProf = { ...defaultProfile };
      setProfile(activeProf);
      setIstartuSharedSession(session || { user: { id: userId } }, activeProf);
    }

    try {
      const { data: subData } = await supabase.from('subscriptions').select('*').eq('user_id', userId).single();
      if (subData) {
        setSubscription(subData);
      } else {
        setSubscription({
          id: 'sub-1',
          user_id: userId,
          plan_name: 'Free Tier',
          is_upgraded: false,
          renewal_date: null
        });
      }
    } catch (e) {
      setSubscription({
        id: 'sub-1',
        user_id: userId,
        plan_name: 'Free Tier',
        is_upgraded: false,
        renewal_date: null
      });
    }
  };

  const handleLogout = async () => {
    if (localStorage.getItem('demo_mode') === 'true') {
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('demo_profile');
      localStorage.removeItem('demo_subscription');
      window.location.href = '/';
      return;
    }
    await supabase.auth.signOut();
    setShowDropdown(false);
    navigate('/');
  };

  // Determine if we show bottom bar (usually only when logged in and not on auth pages)
  const isAuthPage = location.pathname.startsWith('/auth');
  const isLandingPage = location.pathname === '/';
  const showBottomBar = session && !isAuthPage && !isLandingPage;

  const isSubscriptionExpired = () => {
    if (!subscription?.renewal_date) return false;
    // 1 day grace period
    const gracePeriodEnd = new Date(subscription.renewal_date).getTime() + (24 * 60 * 60 * 1000);
    return Date.now() > gracePeriodEnd;
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex flex-col">
      <Helmet>
        <title>FSMEC - Connect Athletes, Coaches & Scouts</title>
        <meta name="description" content="FSMEC (International Sports Transformation and Athletic ranking training unit) is the premier platform that connects athletes, coaches, and scouts globally. Get recognized for recruitment and career development opportunities." />
      </Helmet>

      {session && isSubscriptionExpired() && (
        <div className="bg-red-600 text-white text-center py-2 text-sm font-medium">
          Your subscription has ended. <Link to="/plans/subscription" className="underline font-bold">Renew now</Link> to retain access to premium features.
        </div>
      )}

      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <Link to={session ? "/home" : "/"} className="text-xl font-bold tracking-tight text-gray-900">
          FSMEC
        </Link>


        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden border-2 border-transparent hover:border-gray-900 transition-colors"
                >
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 m-auto text-gray-500" />
                  )}
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50">
                    <Link to="/tv" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">📺 TV & Streams</Link>
                    <Link to="/partners" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 font-medium">🤝 Official Partners</Link>
                    <Link to="/settings" onClick={() => setShowDropdown(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Manage Account</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">Log Out</button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth/login" className="px-4 py-2 text-xs font-bold text-gray-700 hover:text-gray-900 transition-colors">Log In</Link>
              <Link to="/auth/signup" className="px-4 py-2 text-xs font-bold bg-black text-white rounded-full hover:bg-gray-800 transition-colors">Sign Up</Link>
              
              <div className="relative ml-2">
                <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                  {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
                {showMobileMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg py-2 z-50">
                    <Link to="/tv" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50">📺 TV & Streams</Link>
                    <Link to="/plans/subscription" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50">Plans</Link>
                    <Link to="/partners" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 border-b border-gray-50">Partners</Link>
                    <Link to="/partner/request" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">Request to be a Partner</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 pb-20 md:pb-0">
        <Outlet context={{ session, profile, subscription }} />
      </main>

      {/* Beautifully Redesigned Modern Footer */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Columns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
            {/* Left Column: Brand Statement */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <span className="font-black text-xl tracking-tighter bg-black text-white px-3 py-1 rounded-xl">FSMEC</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Sports Network</span>
              </div>
              <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
                International Sports Transformation and Athletic Ranking training unit (FSMEC). Connecting prospective high school and youth basketball &amp; soccer recruits with worldwide scouts.
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-gray-50 text-gray-500 border border-gray-200">
                A Subsidiary of Garexcell Sports
              </div>
            </div>

            {/* Middle Column: Platform Links */}
            <div className="md:col-span-4 space-y-4">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Platform</h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
                <Link to="/events" className="text-gray-500 hover:text-black font-semibold transition-colors">Events</Link>
                <Link to="/rankings" className="text-gray-500 hover:text-black font-semibold transition-colors">Rankings</Link>
                <Link to="/showcase" className="text-gray-500 hover:text-black font-semibold transition-colors">Showcase</Link>
                <Link to="/plans/subscription" className="text-gray-500 hover:text-black font-semibold transition-colors">Plans</Link>
                <Link to="/partners" className="text-gray-500 hover:text-black font-semibold transition-colors">Partners</Link>
                <Link to="/tips" className="text-gray-500 hover:text-black font-semibold transition-colors">Recruiting Tips</Link>
                <a href="https://tv.istartu.com" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-black font-semibold transition-colors">FSMEC TV</a>
              </div>
            </div>

            {/* Right Column: Information & Assistance */}
            <div className="md:col-span-3 space-y-4">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest">Contact & Policy</h3>
              <div className="flex flex-col gap-2.5 text-xs text-gray-500">
                <Link to="/contact" className="hover:text-black font-semibold transition-colors">Contact Support</Link>
                <Link to="/tos" className="hover:text-black font-semibold transition-colors">Terms of Service</Link>
                <Link to="/privacy" className="hover:text-black font-semibold transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider text-center sm:text-left">
              &copy; {new Date().getFullYear()} FSMEC Sports • by Garexcell. All rights reserved.
            </div>

            {/* Social Media Link with IG having NO text beside it */}
            <div className="flex items-center gap-3">
              <a 
                href="https://instagram.com/garexcell" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-full bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-pink-200 text-gray-500 hover:text-pink-600 flex items-center justify-center transition-all"
                title="Instagram profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a 
                href="https://twitter.com/garexcell" 
                target="_blank" 
                rel="noreferrer" 
                className="w-9 h-9 rounded-full bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-gray-500 hover:text-blue-500 flex items-center justify-center transition-all"
                title="X (Twitter) profile"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Bar (Mobile Navigation) */}
      {showBottomBar && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-40 md:hidden pb-safe">
          <NavItem to="/home" icon={<Home />} label="Home" />
          <NavItem to="/offers" icon={<Tag />} label="Offers" />
          <NavItem to="/chat" icon={<MessageCircle />} label="Chat" />
          <NavItem to="/events" icon={<Calendar />} label="Events" />
          <NavItem to="/settings" icon={<SettingsIcon />} label="Settings" />
        </nav>
      )}
      
      {session && subscription?.is_upgraded && (
        <AIFab isUpgraded={subscription.is_upgraded} plan={subscription.plan_name} />
      )}
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  const location = useLocation();
  const isActive = location.pathname.startsWith(to);
  
  return (
    <Link to={to} className={clsx("flex flex-col items-center gap-1", isActive ? "text-black" : "text-gray-400 hover:text-gray-600")}>
      <div className={clsx("w-6 h-6", isActive && "stroke-[2.5px]")}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
