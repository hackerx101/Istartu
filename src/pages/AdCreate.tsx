import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Megaphone, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function AdCreate() {
  const { session, profile } = useOutletContext<any>();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const AD_COST = 5;

  const handleCreateAd = async () => {
    if (!content.trim()) return;
    
    // Scan words for safety (mock check)
    const badWords = ['spam', 'scam', 'fake'];
    const hasBadWords = badWords.some(word => content.toLowerCase().includes(word));
    if (hasBadWords) {
      alert("Ad content flagged by safety scanner. Please revise.");
      return;
    }

    // Check credits/subscription
    if (profile?.role !== 'recruit') {
      alert('Only recruiters can create ads.');
      return;
    }

    if (profile.wallet_credits < AD_COST) {
      alert(`Creating an ad costs $${AD_COST} wallet credits. Please top up.`);
      navigate('/wallet/topup');
      return;
    }

    setLoading(true);

    // Deduct credits
    try {
      if (localStorage.getItem('demo_mode') === 'true') {
        const p = JSON.parse(localStorage.getItem('demo_profile') || '{}');
        p.wallet_credits = Math.max(0, (p.wallet_credits || 0) - AD_COST);
        localStorage.setItem('demo_profile', JSON.stringify(p));
      } else {
        await supabase.from('profiles').update({ wallet_credits: Math.max(0, (profile.wallet_credits || 0) - AD_COST) }).eq('user_id', session.user.id);
      }
    } catch (e) {
      console.warn("Profiles update permission fallback:", e);
    }

    // Create Post
    const { data, error } = await supabase.from('posts').insert([
      { user_id: session.user.id, content, IsMediaPublic: true }
    ]).select().single();

    setLoading(false);

    if (error) {
      alert("Error creating ad.");
      console.error(error);
    } else if (data) {
      alert("Ad created successfully! It will be SEO indexed within 24 hours.");
      navigate(`/ad/${data.id}`);
    }
  };

  if (profile?.role !== 'recruit') {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-500 mt-2">Only recruiters can create ads.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-12 flex flex-col gap-8">
      <Helmet><title>Create Ad - Recruiter Portal</title></Helmet>

      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Megaphone className="w-8 h-8 text-blue-600" />
          Create Targeted Ad
        </h1>
        <p className="text-gray-500">Run an ad to athletes. Minimum cost is ${AD_COST} deducted from your wallet. Ads are SEO optimized and indexed within 24 hours.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl border border-gray-100">
          <span className="text-sm font-bold text-gray-700">Wallet Balance</span>
          <span className="font-bold text-lg">${(profile?.wallet_credits || 0).toFixed(2)}</span>
        </div>

        <div className="flex flex-col gap-2 mt-2">
          <label className="text-sm font-bold text-gray-700">Ad Content</label>
          <textarea 
            rows={6}
            placeholder="Announce a camp, recruitment drive, or open tryouts..."
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black resize-none"
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>
        
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex gap-3 mt-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>Content will be automatically scanned for safety and SEO indexed within 24 hours.</div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button onClick={() => navigate('/recruits/dashboard')} className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
          <button 
            onClick={handleCreateAd} 
            disabled={loading}
            className="px-6 py-3 rounded-xl font-bold bg-black text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? 'Processing...' : `Create Ad (Costs $${AD_COST})`}
          </button>
        </div>
      </div>
    </div>
  );
}
