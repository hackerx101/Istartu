import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { UserPlus, Star } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function Referral() {
  const { PlayerId } = useParams();
  const [referrer, setReferrer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReferrer = async () => {
      if (PlayerId) {
        try {
          const { data, error } = await supabase.from('profiles').select('*').eq('IdNumber', PlayerId).single();
          if (data && !error) {
            setReferrer(data);
          } else {
            setReferrer({
              full_name: PlayerId ? `Athlete ${PlayerId}` : 'Athlete',
              IdNumber: PlayerId
            });
          }
        } catch (e) {
          setReferrer({
            full_name: PlayerId ? `Athlete ${PlayerId}` : 'Athlete',
            IdNumber: PlayerId
          });
        }
        setLoading(false);
      }
    };
    loadReferrer();
  }, [PlayerId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Helmet>
        <title>You've been invited! - FSMEC</title>
      </Helmet>

      {loading ? (
        <div className="text-gray-500">Loading invitation...</div>
      ) : referrer ? (
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center gap-6 shadow-xl">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border-4 border-white shadow-lg">
              {referrer.avatar_url ? (
                <img src={referrer.avatar_url} className="w-full h-full object-cover" />
              ) : (
                <UserPlus className="w-10 h-10 m-auto text-gray-400 mt-6" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-black text-white p-2 rounded-full shadow-md">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          </div>
          
          <div>
            <h1 className="text-2xl font-bold mb-2">{referrer.full_name} Invited You</h1>
            <p className="text-gray-500 text-sm">Join the global scouting network to connect, get recruited, and advance your athletic career.</p>
          </div>

          <Link to="/auth/signup" className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-md mt-4">
            Accept Invitation & Register
          </Link>
          <Link to="/" className="text-sm text-gray-500 hover:text-black">
            Learn more about FSMEC
          </Link>
        </div>
      ) : (
        <div className="text-center bg-white p-8 rounded-3xl border border-gray-200 shadow-sm max-w-md">
          <h2 className="text-xl font-bold mb-2">Invalid Invitation</h2>
          <p className="text-gray-500 text-sm mb-6">The referral link seems to be broken or the player does not exist.</p>
          <Link to="/" className="bg-black text-white px-6 py-2 rounded-lg font-medium">Go Home</Link>
        </div>
      )}
    </div>
  );
}
