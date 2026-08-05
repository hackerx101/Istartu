import { useOutletContext } from 'react-router-dom';
import { Tag, Users, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../lib/supabase';

export default function Offers() {
  const { session, profile } = useOutletContext<any>();
  const [copied, setCopied] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const offers: any[] = [];
  const [claimed, setClaimed] = useState(() => {
    return localStorage.getItem(`claimed_follow_${session?.user?.id || 'demo'}`) === 'true';
  });

  const handleCopyReferral = () => {
    if (profile?.IdNumber) {
      navigator.clipboard.writeText(`${window.location.origin}/refer/${profile.IdNumber}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClaimFollowOffer = async () => {
    // Open social page
    window.open('https://instagram.com/garexcell', '_blank');
    setIsClaiming(true);

    setTimeout(async () => {
      try {
        const userId = session?.user?.id;
        const currentCredits = profile?.wallet_credits || 0;
        const newCredits = currentCredits + 5.00;

        if (localStorage.getItem('demo_mode') === 'true') {
          const p = JSON.parse(localStorage.getItem('demo_profile') || '{}');
          p.wallet_credits = newCredits;
          localStorage.setItem('demo_profile', JSON.stringify(p));
        } else if (userId) {
          await supabase.from('profiles').update({ wallet_credits: newCredits }).eq('user_id', userId);
        }

        localStorage.setItem(`claimed_follow_${userId || 'demo'}`, 'true');
        setClaimed(true);
        setIsClaiming(false);
        alert('✨ $5.00 Wallet Credit claimed successfully! Check your Wallet balance.');
        window.location.reload();
      } catch (e) {
        console.error(e);
        setIsClaiming(false);
      }
    }, 1500);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-6 py-8 flex flex-col gap-10">
      <Helmet>
        <title>Recruiter Offers & Athlete Bonuses - FSMEC</title>
        <meta name="description" content="Claim exclusive athlete wallet credit bonuses, partner referral rewards, and college recruiter offers." />
        <meta property="og:title" content="Recruiter Offers & Athlete Bonuses | FSMEC" />
      </Helmet>
      
      {/* Social Follow Reward Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl">
            📲
          </div>
          <div>
            <div className="inline-block bg-white/20 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
              Official Bonus
            </div>
            <h2 className="text-2xl font-bold">Follow @garexcell on Social Media</h2>
            <p className="text-white/80 text-sm mt-1 max-w-md">
              Follow our official network page to receive your exclusive <strong>$5.00 Wallet Credit</strong> bonus immediately into your account.
            </p>
          </div>
        </div>

        <div>
          {claimed ? (
            <div className="bg-white/20 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-300" />
              $5.00 Credit Claimed
            </div>
          ) : (
            <button 
              onClick={handleClaimFollowOffer}
              disabled={isClaiming}
              className="bg-white text-black px-8 py-4 rounded-2xl font-black hover:bg-gray-100 transition-colors shadow-lg text-sm disabled:opacity-50"
            >
              {isClaiming ? 'Verifying Follow...' : 'Follow & Claim $5.00 Credit'}
            </button>
          )}
        </div>
      </section>

      {/* Refer Section */}
      <section className="bg-gradient-to-r from-gray-900 to-black text-white p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-gray-800">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Invite Players</h2>
            <p className="text-gray-400 text-sm mt-1">Get rewarded for inviting other talented athletes to FSMEC.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-black/50 p-2 rounded-xl border border-gray-700 w-full md:w-auto">
          <div className="px-4 font-mono text-sm text-gray-300 truncate max-w-[200px]">
            {window.location.origin}/refer/{profile?.IdNumber || 'YOUR_ID'}
          </div>
          <button 
            onClick={handleCopyReferral}
            className="bg-white text-black px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center gap-2 flex-shrink-0"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>

      {/* Offers Section */}
      <section className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Offers</h1>
        
        {offers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 bg-gray-50 rounded-3xl border border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center">
              <Tag className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No offers yet</h3>
            <p className="text-sm text-gray-500 max-w-sm">Keep your profile updated and active to attract scouts and receive recruitment offers.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {/* Map offers here */}
          </div>
        )}
      </section>
    </div>
  );
}
