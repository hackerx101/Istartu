import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, AlertCircle, Loader2, CreditCard } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function CheckoutOrder() {
  const { SessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as any;
  const [status, setStatus] = useState<'pending' | 'approved' | 'cancelled'>('pending');

  useEffect(() => {
    if (!state?.player || !state?.amount) {
      navigate('/');
    }
  }, [state, navigate]);

  const handlePaymentApproved = async (details?: any) => {
    try {
      const currentCredits = state.player.wallet_credits || 0;
      const newCredits = currentCredits + Number(state.amount);
      await supabase.from('profiles').update({ wallet_credits: newCredits }).eq('user_id', state.player.user_id);
      setStatus('approved');
    } catch (e) {
      console.error(e);
      setStatus('cancelled');
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  const paypalClientId = "BAAgm7WLypmZjV4ZaGanVBrbH_58rx2_v67yaCz9AdeXZoH54JWIY3lOqKHYYBUrA_BcDRnL8Xd217aX80";

  if (!state) return null;

  if (status === 'approved') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 min-h-screen bg-gray-50">
        <Helmet><title>Payment Completed</title></Helmet>
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center gap-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          <h2 className="text-2xl font-bold">Payment Completed</h2>
          <p className="text-gray-500 text-sm">Successfully paid ${state.amount} for {state.player.full_name}. The funds have been added to their wallet.</p>
          <button onClick={() => navigate('/')} className="mt-4 bg-black text-white px-8 py-3 rounded-full font-medium w-full">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 min-h-screen bg-gray-50">
        <Helmet><title>Payment Cancelled</title></Helmet>
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold">Purchase Cancelled</h2>
          <p className="text-gray-500 text-sm">This payment has been cancelled.</p>
          <button onClick={() => setStatus('pending')} className="mt-4 bg-black text-white px-8 py-3 rounded-full font-medium w-full">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 min-h-screen bg-gray-50">
      <Helmet><title>Checkout - FSMEC</title></Helmet>
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-xl flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-center mb-2">Order Checkout</h2>
        
        <div className="bg-gray-50 p-6 rounded-2xl flex flex-col gap-4 border border-gray-100">
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-500 font-medium">Order For</span>
            <span className="font-bold text-gray-900">{state.player.full_name}</span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-gray-200">
            <span className="text-sm text-gray-500 font-medium">Session ID</span>
            <span className="font-mono text-xs text-gray-400">{SessionId}</span>
          </div>
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-gray-900 font-bold">Total Amount</span>
            <span className="text-2xl font-bold text-black">${state.amount}</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-4 min-h-[150px]">
          <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD" }}>
            <PayPalButtons 
              style={{ layout: "vertical", shape: "rect", label: "pay" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [
                    {
                      description: `FSMEC Payment for ${state.player.full_name}`,
                      amount: {
                        currency_code: "USD",
                        value: state.amount.toString(),
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
              onCancel={() => setStatus('cancelled')}
              onError={(err) => {
                console.error("PayPal Error:", err);
              }}
            />
          </PayPalScriptProvider>
          <button 
            onClick={handleCancel}
            className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
