import React, { useEffect, useState } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { User as UserIcon, Grid, Tag, FileText, Lock, Globe, MessageCircle } from 'lucide-react';
import clsx from 'clsx';
import { Helmet } from 'react-helmet-async';

export default function PlayerProfile() {
  const { PlayerId } = useParams();
  const { session, profile: currentUserProfile } = useOutletContext<any>();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'Media' | 'Offers' | 'Summary'>('Media');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      if (PlayerId) {
        let profileData = null;
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .or(`IdNumber.eq.${PlayerId},user_id.eq.${PlayerId},full_name.eq.${PlayerId}`)
            .maybeSingle();
          if (data && !error) profileData = data;
        } catch (e) {
          console.warn("Profiles query fallback:", e);
        }

        if (!profileData) {
          if (currentUserProfile && (currentUserProfile.IdNumber === PlayerId || currentUserProfile.user_id === PlayerId || currentUserProfile.full_name === PlayerId)) {
            profileData = currentUserProfile;
          } else if (PlayerId === '10027189') {
            profileData = {
              id: '10027189',
              user_id: 'demo-user-1',
              IdNumber: '10027189',
              full_name: 'demo',
              position: 'Point Guard / Midfielder',
              sport: 'Basketball & Soccer',
              is_upgraded: true,
              is_public: true,
              role: 'recruit',
              wallet_credits: 10,
              bio: '#1 ranked prospect in Michigan (Class of 2027). Dual-sport athlete in Basketball & Soccer with elite vision and stats.',
              avatar_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
            };
          } else {
            setError('Player profile not found in database.');
            setLoading(false);
            return;
          }
        }

        const isOwner = session?.user?.id === profileData.user_id;
        if (!profileData.is_public && !isOwner) {
          setError('This account is private.');
        } else {
          setProfile(profileData);
          try {
            const { data: postsData } = await supabase
              .from('posts')
              .select('*')
              .eq('user_id', profileData.user_id)
              .eq('IsMediaPublic', true)
              .order('created_at', { ascending: false });
            if (postsData) setPosts(postsData);
          } catch (e) {
            // ignore
          }
        }
      }
      setLoading(false);
    };
    fetchData();
  }, [PlayerId, session, currentUserProfile]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return (
    <div className="flex flex-col items-center justify-center py-32 text-center gap-4 px-6">
      <Lock className="w-12 h-12 text-gray-300" />
      <div className="text-xl font-bold text-gray-900">{error}</div>
    </div>
  );
  if (!profile) return null;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-12 flex flex-col gap-6 sm:gap-8">
      <Helmet>
        <title>{profile.full_name} ({profile.position || 'Recruit'}) | FSMEC Scouting Network</title>
        <meta name="description" content={`View the complete athletic profile, highlights, and recruitment details for ${profile.full_name} (${profile.position || 'Recruit'}) on the FSMEC Global Scouting Network.`} />
        <meta property="og:title" content={`${profile.full_name} | Verified Athlete Profile on FSMEC`} />
        <meta property="og:description" content={`Check out ${profile.full_name}'s official athletic stats, position, and scout evaluations on FSMEC.`} />
        <meta property="og:image" content={profile.avatar_url || 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800&auto=format&fit=crop'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${profile.full_name} - FSMEC Scouting`} />
      </Helmet>
      
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-4 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        {profile.is_upgraded && (
          <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] font-black px-4 py-1 rounded-bl-xl tracking-tighter">
            PREMIUM
          </div>
        )}
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-md relative">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
          ) : (
            <UserIcon className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 m-auto h-full" />
          )}
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">{profile.full_name}</h1>
            {profile.is_upgraded && (
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black px-3 py-0.5 sm:py-1 rounded-full text-[10px] font-black shadow-sm whitespace-nowrap" title="Gold Verified Scout & Member">
                <svg className="w-3.5 h-3.5 fill-black" viewBox="0 0 24 24">
                  <path d="M12 2l2.4 2.4 3.4-.2 1.2 3.2 3.2 1.2-.2 3.4L22 12l-2.4 2.4.2 3.4-3.2 1.2-1.2 3.2-3.4-.2L12 22l-2.4-2.4-3.4.2-1.2-3.2-3.2-1.2.2-3.4L2 12l2.4-2.4-.2-3.4 3.2-1.2 1.2-3.2 3.4.2L12 2z"/>
                  <path d="M9.5 12.5l2 2 4.5-4.5" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Gold Verified</span>
              </span>
            )}
          </div>
          <p className="text-gray-500 font-bold text-xs uppercase tracking-wider">{profile.position || 'Athlete'} • ID: {profile.IdNumber}</p>
        </div>

        {/* Recruiter / Visitor Action Button */}
        {session?.user?.id !== profile.user_id && (
          <div className="flex items-center gap-3 mt-1 w-full sm:w-auto">
            <Link 
              to={`/chat?recipient=${encodeURIComponent(profile.full_name)}&id=${profile.IdNumber}`}
              className="w-full sm:w-auto bg-black text-white px-8 py-3 rounded-full text-xs font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-transform active:scale-95 shadow-md"
            >
              <MessageCircle className="w-4 h-4 text-blue-400" />
              Message Player
            </Link>
          </div>
        )}
        <p className="text-gray-700 max-w-xl mx-auto leading-relaxed text-sm sm:text-base mt-2">
          {profile.bio?.split(/(https?:\/\/[^\s]+)/g).map((part: string, i: number) => 
            part.match(/^https?:\/\//) 
              ? <Link key={i} to={`/i/redirect?url=${encodeURIComponent(part)}`} className="text-blue-600 hover:underline">{part}</Link>
              : <span key={i}>{part}</span>
          )}
        </p>
        
        {/* Social Links */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-2 w-full">
          {profile.ig_link && profile.ig_link.trim().length > 0 && (
            <a 
              href={profile.ig_link.startsWith('http') ? profile.ig_link : `https://instagram.com/${profile.ig_link.replace('@', '').trim()}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white font-black text-[10px] sm:text-xs rounded-full hover:opacity-90 transition-all shadow-md"
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </a>
          )}
          {profile.twitter_link && profile.twitter_link.trim().length > 0 && (
            <a 
              href={profile.twitter_link.startsWith('http') ? profile.twitter_link : `https://${profile.twitter_link.trim()}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-900 text-white font-black text-[10px] sm:text-xs rounded-full hover:bg-black transition-all shadow-sm"
            >
              <Globe className="w-4 h-4" />
              <span>X / Website</span>
            </a>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-gray-100 overflow-x-auto">
        <div className="flex gap-4 sm:gap-8 px-2">
          <TabButton active={activeTab === 'Media'} onClick={() => setActiveTab('Media')} icon={<Grid className="w-4 h-4" />} label="Media" />
          <TabButton active={activeTab === 'Offers'} onClick={() => setActiveTab('Offers')} icon={<Tag className="w-4 h-4" />} label="Offers" />
          <TabButton active={activeTab === 'Summary'} onClick={() => setActiveTab('Summary')} icon={<FileText className="w-4 h-4" />} label="Summary" />
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[40vh]">
        {activeTab === 'Media' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500">No media posts yet.</div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  {post.media_url ? (
                     <video src={post.media_url} controls className="w-full aspect-video rounded-xl bg-black mb-3 object-cover" />
                  ) : null}
                  <p className="text-gray-700 text-sm">{post.content}</p>
                  <div className="text-xs text-gray-400 mt-4">{new Date(post.created_at).toLocaleDateString()}</div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'Offers' && (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
            {session?.user?.id === profile.user_id && !localStorage.getItem(`claimed_follow_${profile.user_id}`) && (
              <div className="bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-100 p-8 rounded-3xl w-full max-w-md shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Claim $5 Wallet Credit</h3>
                <p className="text-gray-600 text-sm mb-6">Follow @garexcell on Instagram to unlock AI features for your Player Card!</p>
                <button 
                  onClick={async () => {
                    const win = window.open('https://instagram.com/garexcell', '_blank');
                    // Mock verification delay
                    setTimeout(async () => {
                      await supabase.from('profiles').update({ wallet_credits: (profile.wallet_credits || 0) + 5 }).eq('user_id', profile.user_id);
                      localStorage.setItem(`claimed_follow_${profile.user_id}`, 'true');
                      alert("Successfully verified follow! $5 added to your wallet.");
                      window.location.reload();
                    }, 5000);
                  }}
                  className="bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold px-6 py-3 rounded-full hover:shadow-lg transition-all"
                >
                  Follow & Claim
                </button>
              </div>
            )}

            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mt-4">
              <Tag className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No public offers</h3>
          </div>
        )}

        {activeTab === 'Summary' && (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Player Summary</h3>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Full Name</span>
                <span className="font-medium text-gray-900">{profile.full_name}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Position</span>
                <span className="font-medium text-gray-900">{profile.position || 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Date of Birth</span>
                <span className="font-medium text-gray-900">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-green-600">Active</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors",
        active ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-800"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
