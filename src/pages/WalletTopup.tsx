import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CreditCard, DollarSign, Loader2 } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function WalletTopup() {
  const { session, profile } = useOutletContext<any>();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);

  const handlePaymentApproved = async (details?: any) => {
    try {
      const currentCredits = profile?.wallet_credits || 0;
      const newCredits = currentCredits + Number(amount);
      await supabase.from('profiles').update({ wallet_credits: newCredits }).eq('user_id', session.user.id);
      
      alert(`Successfully added $${amount} to your wallet!`);
      navigate('/settings/wallet');
    } catch (e) {
      console.error(e);
      alert('Error updating wallet credits.');
    }
  };

  const paypalClientId = "BAAgm7WLypmZjV4ZaGanVBrbH_58rx2_v67yaCz9AdeXZoH54JWIY3lOqKHYYBUrA_BcDRnL8Xd217aX80";

  const generateRequestLink = () => {
    if (!amount || amount <= 0) {
      alert('Enter an amount to request.');
      return;
    }
    const sessionId = Math.random().toString(36).substring(2, 9).toUpperCase();
    const link = `${window.location.origin}/request/credits/${profile.IdNumber}?amount=${amount}&session=${sessionId}`;
    navigator.clipboard.writeText(link);
    alert('Request link copied to clipboard!');
  };

  return (
    <div className="w-full max-w-lg mx-auto px-6 py-12 flex flex-col gap-8">
      <div className="text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white">
          <CreditCard className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Top Up Wallet</h1>
        <p className="text-gray-500">Add funds to your wallet using PayPal. Maximum amount per transaction is $100.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col gap-6 shadow-sm">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-700">Enter Amount (USD)</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="number"
              min="1"
              max="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value ? Number(e.target.value) : '')}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black text-lg font-bold"
              placeholder="0.00"
            />
          </div>
        </div>
        
        <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 min-h-[150px]">
          {amount && Number(amount) > 0 && (
            <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD" }}>
              <PayPalButtons 
                style={{ layout: "vertical", shape: "rect", label: "pay" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                      {
                        description: `FSMEC Wallet Topup: $${amount}`,
                        amount: {
                          currency_code: "USD",
                          value: amount.toString(),
                        },
                      },
                    ],
                  });
                }}
                onApprove={async (data, actions) => {
                  if (actions.order) {
                    await actions.order.capture();
                    handlePaymentApproved();
                  }
                }}
                onError={(err) => {
                  console.error("PayPal Error:", err);
                }}
              />
            </PayPalScriptProvider>
          )}
          
          <button 
            onClick={generateRequestLink}
            className="w-full bg-gray-50 border border-gray-100 text-gray-500 py-3.5 rounded-xl font-bold hover:bg-gray-100 transition-colors flex justify-center items-center text-xs uppercase tracking-tight"
          >
            Request someone to pay
          </button>
        </div>
      </div>
    </div>
  );
}
