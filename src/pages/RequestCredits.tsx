import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CreditCard } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function RequestCredits() {
  const { PlayerId } = useParams();
  const [searchParams] = useSearchParams();
  const amount = searchParams.get('amount');
  const sessionId = searchParams.get('session');
  
  const navigate = useNavigate();
  const [player, setPlayer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPlayer = async () => {
      if (PlayerId) {
        try {
          const { data, error } = await supabase.from('profiles').select('*').eq('IdNumber', PlayerId).single();
          if (data && !error) {
            setPlayer(data);
          } else {
            setPlayer({
              full_name: 'Garexcell Athlete',
              IdNumber: PlayerId,
              user_id: `user-${PlayerId}`
            });
          }
        } catch (e) {
          setPlayer({
            full_name: 'Garexcell Athlete',
            IdNumber: PlayerId,
            user_id: `user-${PlayerId}`
          });
        }
        setLoading(false);
      }
    };
    loadPlayer();
  }, [PlayerId]);

  const handlePayNow = () => {
    // Navigate to checkout/order/:SessionId and pass player data
    navigate(`/checkout/order/${sessionId}`, { state: { player, amount } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <Helmet>
        <title>Payment Request - FSMEC</title>
      </Helmet>

      {loading ? (
        <div className="text-gray-500">Loading request...</div>
      ) : player ? (
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 flex flex-col items-center text-center gap-6 shadow-xl">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <CreditCard className="w-8 h-8" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold mb-2">{player.full_name} is asking you to pay for them</h1>
            <p className="text-gray-500 text-sm">They have requested funds to be added to their FSMEC Wallet.</p>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 w-full my-4">
            <div className="text-sm text-gray-500 font-medium mb-1">Requested Amount</div>
            <div className="text-4xl font-bold text-gray-900">${amount}</div>
          </div>

          <button 
            onClick={handlePayNow}
            className="w-full bg-black text-white font-bold py-3.5 rounded-xl hover:bg-gray-800 transition-colors shadow-md"
          >
            Pay Now
          </button>
        </div>
      ) : (
        <div className="text-center bg-white p-8 rounded-3xl border border-gray-200 shadow-sm max-w-md">
          <h2 className="text-xl font-bold mb-2">Invalid Request</h2>
          <p className="text-gray-500 text-sm mb-6">This payment request link is invalid or expired.</p>
          <button onClick={() => navigate('/')} className="bg-black text-white px-6 py-2 rounded-lg font-medium">Go Home</button>
        </div>
      )}
    </div>
  );
}
