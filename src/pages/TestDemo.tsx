import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TestDemo() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem('demo_mode', 'true');
    localStorage.setItem('demo_profile', JSON.stringify({
      id: 'demo-profile-1',
      user_id: 'demo-user-1',
      name: 'Demo Pro User',
      full_name: 'Demo Pro User',
      is_upgraded: true,
      wallet_credits: 50,
      IdNumber: '10027189',
      avatar_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=200&auto=format&fit=crop'
    }));
    localStorage.setItem('demo_subscription', JSON.stringify({
      id: 'demo-sub-1',
      user_id: 'demo-user-1',
      plan_name: 'Pro',
      is_upgraded: true,
      renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }));
    
    // Redirect to home
    window.location.href = '/home';
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-xl font-bold animate-pulse">Initializing Test Environment...</div>
    </div>
  );
}
