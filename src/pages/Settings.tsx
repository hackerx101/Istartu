import React, { useEffect, useState } from 'react';
import { useOutletContext, Link, useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User, Lock, Link as LinkIcon, Activity, Users, CreditCard, Shield, Copy, CheckCircle, ArrowLeft, ChevronRight, LogOut, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Settings() {
  const { session, profile, subscription } = useOutletContext<any>();
  const { tab } = useParams<{ tab?: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<string>(tab || 'index');
  const [copiedId, setCopiedId] = useState(false);
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? true);
  const [searchOptimization, setSearchOptimization] = useState(profile?.search_optimization ?? true);
  const [socialLinks, setSocialLinks] = useState({ ig_link: profile?.ig_link || '', twitter_link: profile?.twitter_link || '' });

  useEffect(() => {
    if (tab) setActiveTab(tab);
    else setActiveTab('index');
  }, [tab]);

  useEffect(() => {
    setIsPublic(profile?.is_public ?? true);
    setSearchOptimization(profile?.search_optimization ?? true);
    setSocialLinks({ ig_link: profile?.ig_link || '', twitter_link: profile?.twitter_link || '' });
  }, [profile]);

  const handleCopyId = () => {
    if (profile?.IdNumber) {
      navigator.clipboard.writeText(profile.IdNumber);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const handleTogglePrivacy = async (pub: boolean) => {
    setIsPublic(pub);
    try {
      await supabase.from('profiles').update({ is_public: pub }).eq('user_id', session?.user?.id);
    } catch (e) {
      console.warn("Profiles update permission fallback:", e);
    }
  };

  const handleToggleSearchOptimization = async (enabled: boolean) => {
    setSearchOptimization(enabled);
    try {
      await supabase.from('profiles').update({ search_optimization: enabled }).eq('user_id', session?.user?.id);
    } catch (e) {
      console.warn("Profiles update permission fallback:", e);
    }
  };

  const handleSaveSocials = async () => {
    try {
      if (localStorage.getItem('demo_mode') === 'true' || !session?.user?.id) {
        const p = JSON.parse(localStorage.getItem('demo_profile') || '{}');
        p.ig_link = socialLinks.ig_link;
        p.twitter_link = socialLinks.twitter_link;
        localStorage.setItem('demo_profile', JSON.stringify(p));
      }
      if (session?.user?.id) {
        await supabase.from('profiles').update({ 
          ig_link: socialLinks.ig_link, 
          twitter_link: socialLinks.twitter_link 
        }).eq('user_id', session.user.id);
      }
    } catch (e) {
      console.warn("Profiles update permission fallback:", e);
    }
    alert('Instagram & social links saved successfully! Visitors can now view your Instagram to verify your profile.');
  };

  const handleLogout = async () => {
    if (localStorage.getItem('demo_mode') === 'true') {
      localStorage.removeItem('demo_mode');
      localStorage.removeItem('demo_profile');
      localStorage.removeItem('demo_subscription');
    }
    await supabase.auth.signOut();
    window.location.href = '/auth/login';
  };

  const selectTab = (t: string) => {
    setActiveTab(t);
    navigate(`/settings/${t}`);
  };

  // Dedicated Page for Account Center
  if (activeTab === 'account') {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        <button onClick={() => selectTab('index')} className="flex items-center gap-2 text-gray-500 hover:text-black font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Account Center</h1>
        
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">Personal & Athlete Details</h2>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-3 items-center">
              <span className="text-gray-500 font-medium">Player ID</span>
              <div className="flex items-center gap-2">
                <span className="font-mono bg-gray-100 px-3 py-1.5 rounded-lg text-gray-900 font-bold">{profile?.IdNumber || 'N/A'}</span>
                <button onClick={handleCopyId} className="text-gray-400 hover:text-black transition-colors" title="Copy ID">
                  {copiedId ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium">Full Name</span>
              <span className="font-bold text-gray-900">{profile?.full_name || session?.user?.user_metadata?.full_name || (session?.user?.email ? session.user.email.split('@')[0] : 'User')}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium">Email Address</span>
              <span className="font-bold text-gray-900">{session?.user?.email || 'Authenticated User'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium">Account Role</span>
              <span className="font-bold text-gray-900 capitalize">{profile?.role || 'Athlete'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium">Sport & Position</span>
              <span className="font-bold text-gray-900">{profile?.sport ? `${profile.sport}${profile?.position ? ` • ${profile.position}` : ''}` : 'Not set'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium">Membership Status</span>
              <span className={`font-bold px-2.5 py-0.5 rounded-full text-xs uppercase ${profile?.is_upgraded || subscription?.is_upgraded ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                {subscription?.plan_name || (profile?.is_upgraded ? 'Pro Tier' : 'Free Tier')}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium">Wallet Balance</span>
              <span className="font-bold text-gray-900">${(profile?.wallet_credits || 0).toFixed(2)}</span>
            </div>
          </div>

          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3 mt-4">Linked Accounts</h2>
          <div className="flex items-center justify-between border border-gray-200 rounded-2xl p-4 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-xl">G</div>
              <div>
                <div className="font-bold text-gray-900">Garexcell Global</div>
                <div className="text-xs text-gray-500">Connected to sync athlete roster</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Connected</span>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-end">
            <button onClick={handleLogout} className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors">
              <LogOut className="w-4 h-4" /> Log Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Page for Profile Settings
  if (activeTab === 'profile') {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        <button onClick={() => selectTab('index')} className="flex items-center gap-2 text-gray-500 hover:text-black font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 pb-3">Athlete Information</h2>
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium">Position</span>
              <span className="font-bold text-gray-900">{profile?.position || 'Not specified'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-3">
              <span className="text-gray-500 font-medium">Bio</span>
              <span className="font-medium text-gray-900">{profile?.bio || 'No bio written yet'}</span>
            </div>
          </div>

          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mt-4">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Instagram & Verification</h2>
            {(profile?.is_upgraded || profile?.role === 'recruit') && (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black px-2.5 py-1 rounded-full text-xs font-black shadow-sm">
                Gold Verified Active
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Add your Instagram link so recruiters and visitors can click and verify your official account and legitimacy.
          </p>
          <div className="flex flex-col gap-3 text-sm">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Instagram Link or Handle</label>
              <input 
                type="text" 
                placeholder="https://instagram.com/yourhandle or @yourhandle" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors" 
                value={socialLinks.ig_link} 
                onChange={e => setSocialLinks({...socialLinks, ig_link: e.target.value})} 
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Twitter / X Profile Link</label>
              <input 
                type="text" 
                placeholder="https://x.com/yourhandle" 
                className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors" 
                value={socialLinks.twitter_link} 
                onChange={e => setSocialLinks({...socialLinks, twitter_link: e.target.value})} 
              />
            </div>
            <button onClick={handleSaveSocials} className="self-end px-6 py-2.5 bg-black text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-colors">
              Save Instagram & Links
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Page for Wallet
  if (activeTab === 'wallet') {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        <button onClick={() => selectTab('index')} className="flex items-center gap-2 text-gray-500 hover:text-black font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Wallet & Credits</h1>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-black p-6 rounded-2xl text-white">
            <div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Wallet Balance</div>
              <div className="font-black text-3xl mt-1">${(profile?.wallet_credits || 0).toFixed(2)}</div>
            </div>
            <Link to="/wallet/topup" className="px-6 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">
              Top Up Credits
            </Link>
          </div>
          <p className="text-xs text-gray-500">Credits can be used to generate AI Player Cards or promote highlights to collegiate recruiters.</p>
        </div>
      </div>
    );
  }

  // Dedicated Page for Teams
  if (activeTab === 'teams') {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        <button onClick={() => selectTab('index')} className="flex items-center gap-2 text-gray-500 hover:text-black font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Teams & Organization</h1>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between bg-gray-50 p-5 rounded-2xl border border-gray-200">
            <div>
              <div className="font-bold text-gray-900">{profile?.team_id ? 'Active Team Joined' : 'No Team Association'}</div>
              <div className="text-xs text-gray-500 mt-1">Connect with your high school or club team roster</div>
            </div>
            <Link to="/join/team" className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
              Join Roster
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Page for Subscriptions
  if (activeTab === 'subscriptions') {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        <button onClick={() => selectTab('index')} className="flex items-center gap-2 text-gray-500 hover:text-black font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Subscription & Plan</h1>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200 flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Active Plan</span>
                <span className="font-black text-2xl text-gray-900">{subscription?.plan_name || 'Starter Plan'}</span>
              </div>
              <span className="text-xs bg-green-500 text-black font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {subscription?.is_upgraded ? 'Active Pro' : 'Free Tier'}
              </span>
            </div>

            {subscription?.renewal_date && (
              <div className="text-xs text-gray-500 border-t border-gray-200 pt-3">
                Renews on {new Date(subscription.renewal_date).toLocaleDateString()}
              </div>
            )}
            
            <div className="flex gap-3 mt-2">
              <Link to="/plans/subscription" className="px-5 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                Upgrade / Change Plan
              </Link>
              {subscription?.plan_name && (
                <button 
                  onClick={async () => {
                     if (confirm("Cancel current plan renewal?")) {
                       await supabase.from('subscriptions').delete().eq('user_id', session.user.id);
                       alert("Subscription cancelled.");
                       window.location.reload();
                     }
                  }}
                  className="px-4 py-2.5 bg-red-50 text-red-600 rounded-xl text-sm font-bold hover:bg-red-100 transition-colors"
                >
                  Cancel Plan
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Dedicated Page for Privacy
  if (activeTab === 'privacy') {
    return (
      <div className="w-full max-w-3xl mx-auto px-6 py-8 flex flex-col gap-6">
        <button onClick={() => selectTab('index')} className="flex items-center gap-2 text-gray-500 hover:text-black font-medium text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Settings
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Privacy & Access</h1>

        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Visibility Mode</h2>
            <div className="text-sm text-gray-700 flex items-center gap-6 bg-gray-50 p-4 rounded-2xl border border-gray-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="privacy" checked={isPublic} onChange={() => handleTogglePrivacy(true)} className="accent-black w-4 h-4" /> 
                <span className={isPublic ? "font-bold text-black" : "text-gray-500"}>Public Profile</span>
              </label>
              <span className="text-gray-300">|</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="privacy" checked={!isPublic} onChange={() => handleTogglePrivacy(false)} className="accent-black w-4 h-4" /> 
                <span className={!isPublic ? "font-bold text-black" : "text-gray-500"}>Private Profile</span>
              </label>
            </div>
            <p className="text-xs text-gray-500">When set to Private, unverified scouts cannot view your highlight reels or player card stats.</p>
          </div>

          <div className="flex flex-col gap-3 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-gray-900">Search Optimization</h2>
                  <p className="text-xs text-gray-500">Allow your profile to be indexed by search engines and FSMEC discovery tools.</p>
                </div>
              </div>
              <button 
                onClick={() => handleToggleSearchOptimization(!searchOptimization)}
                className={`w-12 h-6 rounded-full transition-colors relative ${searchOptimization ? 'bg-black' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${searchOptimization ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Settings Index View (Default list of separate pages)
  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-8 flex flex-col gap-8 pb-24">
      <Helmet>
        <title>Account Settings & Preferences - FSMEC</title>
        <meta name="description" content="Manage your FSMEC account preferences, profile visibility, subscriptions, and wallet credits." />
      </Helmet>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account preferences, profile, and subscriptions.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm flex flex-col divide-y divide-gray-100">
        
        <button onClick={() => selectTab('account')} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base">Account Center</div>
              <div className="text-xs text-gray-500">Personal details, player ID, and linked accounts</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={() => selectTab('profile')} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base">Profile</div>
              <div className="text-xs text-gray-500">Athlete info, bio, and social links</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={() => selectTab('wallet')} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base">Wallet & Credits</div>
              <div className="text-xs text-gray-500">Manage wallet balance and credit top-ups</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={() => selectTab('teams')} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base">Teams</div>
              <div className="text-xs text-gray-500">Manage team affiliation and roster connections</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={() => selectTab('subscriptions')} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base">Subscriptions</div>
              <div className="text-xs text-gray-500">Current plan status and upgrade options</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={() => selectTab('privacy')} className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-700 group-hover:bg-black group-hover:text-white transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-gray-900 text-base">Privacy</div>
              <div className="text-xs text-gray-500">Public visibility and scout access controls</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button onClick={handleLogout} className="flex items-center justify-between p-5 hover:bg-red-50/60 transition-colors text-left group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-red-600 text-base">Log Out</div>
              <div className="text-xs text-red-400">Sign out of your account on this device</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-red-300" />
        </button>

      </div>
    </div>
  );
}

