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
    const defaultProfile = {
      id: userId,
      user_id: userId,
      full_name: 'Athlete Prospect',
      IdNumber: '100' + Math.floor(10000 + Math.random() * 90000).toString(),
      is_upgraded: true,
      role: 'recruit',
      is_public: true,
      wallet_credits: 10.00
    };

    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).single();
      let activeProf = defaultProfile;
      if (data && !error) {
        activeProf = { ...defaultProfile, ...data };
      } else {
        const userEmail = session?.user?.email?.split('@')[0] || 'Athlete';
        activeProf = { ...defaultProfile, full_name: userEmail };
      }
      setProfile(activeProf);
      setIstartuSharedSession(session || { user: { id: userId } }, activeProf);
    } catch (e) {
      const userEmail = session?.user?.email?.split('@')[0] || 'Athlete';
      const activeProf = { ...defaultProfile, full_name: userEmail };
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
        <meta name="description" content="FSMEC is the premier platform that connects athletes, coaches, and scouts globally. Get recognized for recruitment and career development opportunities." />
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

      {/* Footer (shown on landing page or bottom of long pages) */}
      <footer className="bg-white border-t border-gray-100 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-500 text-xs flex flex-col md:flex-row gap-4 items-center">
            <span>&copy; {new Date().getFullYear()} FSMEC. All rights reserved.</span>
            <div className="flex gap-4">
              <Link to="/events" className="hover:text-black">Events</Link>
              <Link to="/rankings" className="hover:text-black">Rankings</Link>
              <Link to="/partners" className="hover:text-black">Partners</Link>
              <Link to="/tos" className="hover:text-black">Terms</Link>
              <Link to="/privacy" className="hover:text-black">Privacy</Link>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            {window.location.hostname.includes('istartu.com') && (
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest text-center px-4">
                International Sports Transformation and Athletic Ranking training unit
              </span>
            )}
            <div className="text-gray-900 font-black tracking-tight text-sm">
              by Garexcell
            </div>
          </div>

          <div className="flex items-center gap-4">
            <a href="https://instagram.com/garexcell" target="_blank" rel="noreferrer" className="text-gray-500 hover:text-black transition-colors flex items-center gap-2 text-sm font-bold">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              @garexcell
            </a>
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
