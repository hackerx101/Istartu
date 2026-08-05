import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { CheckCircle2, AlertCircle, ScrollText, CreditCard, Loader2 } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

export default function Checkout() {
  const { session } = useOutletContext<any>();
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'pending' | 'approved' | 'cancelled'>('pending');
  const [policyRead, setPolicyRead] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [doNotShow, setDoNotShow] = useState(false);
  const [showPolicy, setShowPolicy] = useState(true);
  
  // Parse route query: ?garexcell.com/plan=11.99+Starter&discount=true
  const searchParams = new URLSearchParams(location.search);
  let rawPlanParam = '';
  for (const [key, value] of searchParams.entries()) {
    if (key === 'garexcell.com/plan') {
      rawPlanParam = value;
      break;
    }
  }

  const isDiscounted = searchParams.get('discount') === 'true';
  const [price, planName] = rawPlanParam ? rawPlanParam.split(' ') : ['19.99', 'Essential'];

  useEffect(() => {
    if (!session && localStorage.getItem('demo_mode') !== 'true') {
      navigate('/auth/login');
    }
    // Check if user previously checked "do not show again" in local storage
    if (localStorage.getItem('fsmec_policy_agreed') === 'true') {
      setShowPolicy(false);
      setAgreed(true);
    }
  }, [session, navigate]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const bottom = e.currentTarget.scrollHeight - e.currentTarget.scrollTop <= e.currentTarget.clientHeight + 50;
    if (bottom) {
      setPolicyRead(true);
    }
  };

  const handleContinue = () => {
    if (agreed) {
      if (doNotShow) {
        localStorage.setItem('fsmec_policy_agreed', 'true');
      }
      setShowPolicy(false);
    }
  };

  const handlePaymentApproved = async (details?: any) => {
    try {
      const userId = session?.user?.id;
      if (!userId) return;

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        plan_name: planName,
        is_upgraded: true,
        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }, { onConflict: 'user_id' });

      setStatus('approved');
    } catch (e) {
      console.error(e);
      setStatus('cancelled');
    }
  };

  const handleCancel = () => {
    setStatus('cancelled');
  };

  const paypalClientId = "BAAgm7WLypmZjV4ZaGanVBrbH_58rx2_v67yaCz9AdeXZoH54JWIY3lOqKHYYBUrA_BcDRnL8Xd217aX80";

  if (status === 'approved') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 min-h-[70vh]">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center gap-4">
          <CheckCircle2 className="w-16 h-16 text-green-500" />
          <h2 className="text-2xl font-bold">Payment Completed!</h2>
          <p className="text-gray-500 text-sm">Your subscription to <strong>{planName}</strong> has been activated. All plan perks are now unlocked for your athlete profile.</p>
          <button onClick={() => window.location.href = '/home'} className="mt-4 bg-black text-white px-8 py-3.5 rounded-xl font-bold w-full hover:bg-gray-800 transition-colors">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (status === 'cancelled') {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 min-h-[70vh]">
        <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold">Purchase Cancelled</h2>
          <p className="text-gray-500 text-sm">This checkout session was cancelled. No charges were made to your account.</p>
          <div className="flex flex-col gap-3 w-full mt-4">
            <button onClick={() => setStatus('pending')} className="bg-black text-white px-8 py-3.5 rounded-xl font-bold w-full hover:bg-gray-800 transition-colors">
              Try Again
            </button>
            <button onClick={() => navigate('/home')} className="bg-gray-100 text-gray-700 px-8 py-3.5 rounded-xl font-bold w-full hover:bg-gray-200 transition-colors">
              Cancel Order & Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showPolicy) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 min-h-[70vh]">
        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 text-center">
            <ScrollText className="w-10 h-10 mx-auto text-gray-700 mb-2" />
            <h2 className="text-xl font-bold">Purchase Policy Agreement</h2>
            <p className="text-sm text-gray-500">Please review terms before completing your PayPal purchase.</p>
          </div>
          
          <div 
            className="p-6 overflow-y-auto max-h-64 text-sm text-gray-600 space-y-4"
            onScroll={handleScroll}
          >
            <p><strong>1. Real Payment Authorization</strong><br/>All payments are processed securely via PayPal checkout services using genuine payment processing protocols.</p>
            <p><strong>2. Upgrade Discount Guarantee</strong><br/>If you are upgrading prior to your previous billing period ending, your pro-rated credit or upgrade discount has automatically been applied to the checkout total.</p>
            <p><strong>3. Cancellation Policy</strong><br/>No refunds are granted for partial monthly periods, but you may cancel at any time in Settings.</p>
            <div className="h-16"></div>
          </div>
          
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-4">
            <label className="flex items-start gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                disabled={!policyRead}
                className="mt-1 w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
              />
              <span className={`text-sm ${!policyRead ? 'text-gray-400' : 'text-gray-700'}`}>
                I have read and agree to the payment policy terms.
              </span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="checkbox" 
                checked={doNotShow}
                onChange={(e) => setDoNotShow(e.target.checked)}
                disabled={!agreed}
                className="w-4 h-4 text-black rounded border-gray-300 focus:ring-black"
              />
              <span className="text-sm text-gray-600">Do not show policy again</span>
            </label>
            
            <button 
              onClick={handleContinue}
              disabled={!agreed}
              className={`w-full py-3.5 rounded-xl font-bold transition-colors ${agreed ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              Proceed to PayPal Checkout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 min-h-[75vh]">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 shadow-xl flex flex-col gap-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">PayPal Secure Checkout</h2>
          <p className="text-xs text-gray-500 mt-1">Complete your subscription order safely via PayPal.</p>
        </div>
        
        {isDiscounted && (
          <div className="bg-green-50 text-green-800 px-4 py-3 rounded-2xl text-xs font-bold text-center border border-green-200 flex items-center justify-center gap-2">
            ✨ Upgrade Discount Applied! Saved 20% off original rate.
          </div>
        )}

        <div className="bg-gray-50 p-6 rounded-2xl flex justify-between items-center border border-gray-200">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Plan Selected</span>
            <span className="text-lg font-black text-gray-900">{planName}</span>
          </div>
          <div className="flex flex-col gap-1 text-right">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Due</span>
            <span className="text-xl font-black text-black">
              ${price}
            </span>
          </div>
        </div>

        {/* PayPal Buttons */}
        <div className="w-full flex flex-col gap-3 min-h-[150px]">
          <PayPalScriptProvider options={{ clientId: paypalClientId, currency: "USD" }}>
            <PayPalButtons 
              style={{ layout: "vertical", shape: "rect", label: "pay" }}
              createOrder={(data, actions) => {
                return actions.order.create({
                  intent: "CAPTURE",
                  purchase_units: [
                    {
                      description: `FSMEC Subscription: ${planName}`,
                      amount: {
                        currency_code: "USD",
                        value: price.toString(),
                      },
                    },
                  ],
                });
              }}
              onApprove={async (data, actions) => {
                if (actions.order) {
                  const details = await actions.order.capture();
                  handlePaymentApproved(details);
                } else {
                  handlePaymentApproved();
                }
              }}
              onCancel={() => handleCancel()}
              onError={(err) => {
                console.error("PayPal Error:", err);
                alert("There was an error with the PayPal payment. Please try again.");
              }}
            />
          </PayPalScriptProvider>
        </div>

        <button 
          onClick={handleCancel}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors text-xs"
        >
          Cancel Order
        </button>
      </div>
    </div>
  );
}

