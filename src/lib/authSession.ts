import { supabase } from './supabase';

export interface SharedSessionData {
  user: any;
  profile: any;
  token: string;
  updated_at: string;
}

/**
 * Persist tokens across istartu.com domain and localStorage
 */
export function setIstartuSharedSession(session: any, profile?: any) {
  if (!session) return null;

  const token = session.access_token || session.user?.id || 'istartu_tok_' + (profile?.IdNumber || '10027189');
  
  const sharedData: SharedSessionData = {
    user: session.user || { id: 'demo-user-1', email: 'test@demo.com' },
    profile: profile || JSON.parse(localStorage.getItem('demo_profile') || '{}'),
    token: token,
    updated_at: new Date().toISOString()
  };

  const sharedSessionStr = JSON.stringify(sharedData);

  // Store in localStorage & sessionStorage
  try {
    localStorage.setItem('istartu_token', token);
    localStorage.setItem('istartu_shared_session', sharedSessionStr);
    sessionStorage.setItem('istartu_token', token);
    sessionStorage.setItem('istartu_shared_session', sharedSessionStr);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }

  // Set cookies for .istartu.com domain and fallback current domain
  try {
    const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `istartu_token=${encodeURIComponent(token)}; expires=${expires}; path=/; domain=.istartu.com; SameSite=Lax`;
    document.cookie = `istartu_shared_session=${encodeURIComponent(sharedSessionStr)}; expires=${expires}; path=/; domain=.istartu.com; SameSite=Lax`;
    
    // Fallback cookie for current host/port
    document.cookie = `istartu_token=${encodeURIComponent(token)}; expires=${expires}; path=/; SameSite=Lax`;
    document.cookie = `istartu_shared_session=${encodeURIComponent(sharedSessionStr)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    console.warn('Cookie error:', e);
  }

  return { token, sharedSessionStr };
}

/**
 * Retrieve session from URL params, cookies, or localStorage
 */
export function getIstartuSharedSession() {
  if (typeof window === 'undefined') return null;

  // 1. Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('istartu_token');
  const urlSharedSession = urlParams.get('istartu_shared_session');

  if (urlToken && urlSharedSession) {
    try {
      const parsed = JSON.parse(decodeURIComponent(urlSharedSession));
      localStorage.setItem('istartu_token', urlToken);
      localStorage.setItem('istartu_shared_session', JSON.stringify(parsed));
      return { token: urlToken, sharedSession: parsed };
    } catch (e) {
      console.warn('Failed parsing URL shared session', e);
    }
  }

  // 2. Check localStorage
  const localToken = localStorage.getItem('istartu_token');
  const localShared = localStorage.getItem('istartu_shared_session');
  if (localToken && localShared) {
    try {
      return { token: localToken, sharedSession: JSON.parse(localShared) };
    } catch (e) {}
  }

  // 3. Check cookies
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split('; ').reduce((acc: any, current) => {
      const [name, ...value] = current.split('=');
      if (name) {
        acc[name.trim()] = decodeURIComponent(value.join('='));
      }
      return acc;
    }, {});

    if (cookies.istartu_token && cookies.istartu_shared_session) {
      try {
        const parsed = JSON.parse(cookies.istartu_shared_session);
        return { token: cookies.istartu_token, sharedSession: parsed };
      } catch (e) {}
    }
  }

  return null;
}

/**
 * Construct the target tv.istartu.com URL with attached session tokens
 */
export function getTVRedirectURL() {
  const existing = getIstartuSharedSession();
  let token = existing?.token || localStorage.getItem('istartu_token');
  let sharedSessionStr = existing?.sharedSession 
    ? JSON.stringify(existing.sharedSession) 
    : localStorage.getItem('istartu_shared_session');

  // Fallback demo tokens if no session logged in yet
  if (!token || !sharedSessionStr) {
    token = 'istartu_tok_demo_10027189';
    const demoData = {
      user: { id: 'demo-user-1', email: 'test@demo.com' },
      profile: {
        id: 'demo-user-1',
        full_name: 'Garexcell Elite Prospect',
        IdNumber: '10027189',
        is_upgraded: true,
        role: 'recruit'
      },
      token,
      updated_at: new Date().toISOString()
    };
    sharedSessionStr = JSON.stringify(demoData);
  }

  const tvBaseUrl = 'https://tv.istartu.com';
  const urlParams = new URLSearchParams();
  urlParams.set('istartu_token', token);
  urlParams.set('istartu_shared_session', sharedSessionStr);

  return `${tvBaseUrl}/?${urlParams.toString()}`;
}

/**
 * Perform instant browser redirect to tv.istartu.com
 */
export function redirectToTV() {
  const url = getTVRedirectURL();
  window.location.href = url;
}
