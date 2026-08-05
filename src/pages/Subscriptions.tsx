import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Check, X } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const PLANS = [
  {
    name: "Free Tier",
    basePrice: 0.00,
    features: [
      { text: "Basic Public Profile", included: true },
      { text: "Standard Roster Listing", included: true },
      { text: "0 Wallet Credits", included: true },
      { text: "AI Card Generation", included: false },
      { text: "Recruiter Direct Chat", included: false },
      { text: "Live HD Streaming", included: false }
    ]
  },
  {
    name: "Starter",
    basePrice: 11.99,
    features: [
      { text: "Public Profile", included: true },
      { text: "Watch Videos & Streams", included: true },
      { text: "15 AI credits", included: true },
      { text: "Player card", included: true },
      { text: "Messaging", included: false },
      { text: "HD Live Broadcasting", included: false }
    ]
  },
  {
    name: "Essential",
    basePrice: 19.99,
    features: [
      { text: "30 AI credits", included: true },
      { text: "Player cards editing", included: true },
      { text: "Upload post", included: true },
      { text: "Player certificate", included: true },
      { text: "Limited Messaging", included: true },
      { text: "Streaming", included: false }
    ]
  },
  {
    name: "Pro",
    basePrice: 23.99,
    features: [
      { text: "50 AI credits", included: true },
      { text: "3 player cards", included: true },
      { text: "Link socials", included: true },
      { text: "1 hour streaming", included: true },
      { text: "Unlimited messaging", included: true },
      { text: "Card shared on platform", included: true },
      { text: "Free event invites", included: true }
    ]
  },
  {
    name: "Premium Lite",
    basePrice: 50.99,
    features: [
      { text: "120 AI credits", included: true },
      { text: "Full page summary", included: true },
      { text: "Recruiter acknowledgement", included: true },
      { text: "High quality contents", included: true },
      { text: "Messaging", included: true },
      { text: "Player cards", included: true }
    ]
  },
  {
    name: "Premium Tier 1",
    basePrice: 70.00,
    features: [
      { text: "All Premium Lite benefits", included: true },
      { text: "Priority recruiter matching", included: true },
      { text: "Advanced analytics", included: true }
    ]
  },
  {
    name: "Premium Gold",
    basePrice: 100.99,
    features: [
      { text: "All Tier 1 benefits", included: true },
      { text: "1-on-1 career coaching", included: true },
      { text: "Highest profile visibility", included: true }
    ]
  },
  {
    name: "Enterprise",
    basePrice: 399.00,
    teamsOnly: true,
    features: [
      { text: "Team management dashboard", included: true },
      { text: "Bulk player profiles", included: true },
      { text: "Advanced team analytics", included: true }
    ]
  }
];

const CURRENCIES = {
  USD: { symbol: '$', rate: 1 },
  EUR: { symbol: '€', rate: 0.92 },
  POUND: { symbol: '£', rate: 0.79 },
  CAD: { symbol: 'C$', rate: 1.36 }
};

export default function Subscriptions() {
  const { session, profile, subscription } = useOutletContext<any>();
  const navigate = useNavigate();
  const [currency, setCurrency] = useState<keyof typeof CURRENCIES>('USD');
  const [inTeam, setInTeam] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);

  useEffect(() => {
    if (session) {
      checkTeamStatus();
    }
  }, [session]);

  const checkTeamStatus = async () => {
    try {
      const { data: profileData } = await supabase.from('profiles').select('team_id').eq('user_id', session.user.id).single();
      if (profileData?.team_id) setInTeam(true);
    } catch (e) {
      // ignore permission error
    }
  };

  const handleSubscribe = async (plan: any) => {
    if (!session) {
      setSelectedPlan(plan);
      setShowAuthModal(true);
      return;
    }
    
    // Check if already purchased
    if (subscription?.plan_name === plan.name) {
      return;
    }

    const currentPlanObj = PLANS.find(p => p.name === subscription?.plan_name) || PLANS[0];

    // Check for DOWNGRADE scenario
    if (currentPlanObj.basePrice > plan.basePrice) {
      const unusedValue = currentPlanObj.basePrice - plan.basePrice;
      const confirmDowngrade = confirm(
        `You are downgrading from ${currentPlanObj.name} ($${currentPlanObj.basePrice}/mo) to ${plan.name} ($${plan.basePrice}/mo).\n\n` +
        `We will credit your unused plan balance of $${unusedValue.toFixed(2)} directly into your Wallet Credits so your money is preserved!\n\n` +
        `Do you want to proceed?`
      );

      if (!confirmDowngrade) return;

      try {
        const userId = session?.user?.id;
        const currentWalletCredits = ((profile?.wallet_credits || 0) + unusedValue);

        // Update Wallet credits and downgrade subscription
        if (localStorage.getItem('demo_mode') === 'true') {
          const p = JSON.parse(localStorage.getItem('demo_profile') || '{}');
          p.wallet_credits = currentWalletCredits;
          localStorage.setItem('demo_profile', JSON.stringify(p));

          const s = JSON.parse(localStorage.getItem('demo_subscription') || '{}');
          s.plan_name = plan.name;
          s.is_upgraded = plan.basePrice > 0;
          localStorage.setItem('demo_subscription', JSON.stringify(s));
        } else if (userId) {
          await supabase.from('profiles').update({ wallet_credits: currentWalletCredits }).eq('user_id', userId);
          await supabase.from('subscriptions').upsert({
            user_id: userId,
            plan_name: plan.name,
            is_upgraded: plan.basePrice > 0,
            renewal_date: plan.basePrice > 0 ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : null
          }, { onConflict: 'user_id' });
        }

        alert(`✨ Plan downgraded to ${plan.name}! $${unusedValue.toFixed(2)} in unused plan credit has been added to your Wallet balance so no money was wasted.`);
        window.location.href = '/home';
        return;
      } catch (e) {
        console.error("Downgrade error:", e);
      }
    }

    let convertedPrice = (plan.basePrice * CURRENCIES[currency].rate);
    let isUpgrade = false;
    
    if (subscription?.plan_name && subscription.plan_name !== 'Free Tier' && subscription.plan_name !== 'Starter') {
       convertedPrice = convertedPrice * 0.8;
       isUpgrade = true;
    }
    
    const formattedPrice = convertedPrice.toFixed(2);
    navigate(`/checkout?garexcell.com/plan=${formattedPrice}+${plan.name}${isUpgrade ? '&discount=true' : ''}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center flex flex-col gap-6">
            <h2 className="text-2xl font-bold text-gray-900">Do you already have an account?</h2>
            <p className="text-gray-500">Sign in to upgrade your existing profile, or create a new one to get started.</p>
            <div className="flex flex-col gap-3 mt-2">
              <button 
                onClick={() => navigate('/auth/login')}
                className="w-full bg-black text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                Yes, Log In
              </button>
              <button 
                onClick={() => navigate('/auth/signup')}
                className="w-full bg-gray-100 text-gray-900 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                No, Sign Up
              </button>
              <button 
                onClick={() => setShowAuthModal(false)}
                className="w-full bg-transparent text-gray-500 px-6 py-2 rounded-xl font-medium hover:text-gray-900 mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <Helmet>
        <title>Recruitment Subscription Plans & Scout Pricing - FSMEC</title>
        <meta name="description" content="Unlock AI player cards, direct recruiter messaging, HD live streaming, and verified gold badges with FSMEC subscription plans." />
        <meta property="og:title" content="FSMEC Subscription Plans & Scout Access" />
      </Helmet>
      <div className="text-center flex flex-col items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Upgrade Your Career</h1>
        <p className="text-gray-500 max-w-xl">Choose a plan that fits your career goals and unlock powerful tools to get recruited.</p>
        
        <div className="flex items-center gap-2 mt-4 bg-gray-50 p-1.5 rounded-full border border-gray-200">
          {(Object.keys(CURRENCIES) as Array<keyof typeof CURRENCIES>).map(c => (
            <button 
              key={c}
              onClick={() => setCurrency(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${currency === c ? 'bg-white shadow-sm border border-gray-200 text-black' : 'text-gray-500 hover:text-black'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {PLANS.filter(p => !p.teamsOnly || (p.teamsOnly && inTeam)).map(plan => {
          const isCurrentPlan = subscription?.plan_name === plan.name;
          const hasPlan = !!subscription?.plan_name;
          return (
          <div key={plan.name} className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col gap-6 shadow-sm hover:shadow-md transition-shadow relative">
            {plan.name === 'Pro' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-bold">{CURRENCIES[currency].symbol}{(plan.basePrice * CURRENCIES[currency].rate).toFixed(2)}</span>
                <span className="text-gray-500 text-sm">/mo</span>
              </div>
            </div>

            <button 
              onClick={() => handleSubscribe(plan)}
              disabled={isCurrentPlan}
              className={`w-full py-3 rounded-xl font-medium transition-colors ${
                isCurrentPlan 
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed border border-gray-300' 
                  : plan.name === 'Pro' 
                    ? 'bg-black text-white hover:bg-gray-800' 
                    : 'bg-gray-50 text-gray-900 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {isCurrentPlan ? 'Already Purchased' : hasPlan ? 'Upgrade Now' : 'Select Plan'}
            </button>

            <ul className="flex flex-col gap-3 flex-1 mt-4">
              {plan.features.map((feature, i) => (
                <li key={i} className={`flex items-start gap-3 text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400 line-through'}`}>
                  {feature.included ? <Check className="w-5 h-5 text-black shrink-0" /> : <X className="w-5 h-5 text-gray-300 shrink-0" />}
                  <span>{feature.text}</span>
                </li>
              ))}
            </ul>
          </div>
        )})}
      </div>
    </div>
  );
}
