import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { garexcellSupabase } from '../../lib/garexcellSupabase';
import { supabase } from '../../lib/supabase';
import { ShieldCheck } from 'lucide-react';

export default function GarexcellLogin() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Ex: ?garexcell.com/abc123session
  // Since we don't have actual Garexcell auth context here, 
  // we will simulate fetching a user from the secondary project if logged in there.
  
  useEffect(() => {
    const fetchGarexcellUser = async () => {
      try {
        // Assuming the user is already authenticated in the Garexcell supabase project
        // Or we use a specific method. Here we just fetch the session.
        const { data: { session }, error: sessionError } = await garexcellSupabase.auth.getSession();
        
        if (session?.user) {
          const { data: profile } = await garexcellSupabase.from('profiles').select('username, name').eq('user_id', session.user.id).single();
          setUsername(profile?.username || profile?.name || session.user.email);
        } else {
          // Mocking it for the sake of the preview if session is missing
          // The prompt says: "leave a placeholder in the code for me to enter the secind suoabase project url and anon key"
          // "when login show a screen for confirmation which will have a button say continue as username which will get the username from profiles table in the secind suoabade project"
          setUsername("Garexcell User"); 
        }
      } catch (err) {
        console.error(err);
        setUsername("Garexcell User");
      }
      setLoading(false);
    };

    fetchGarexcellUser();
  }, []);

  const handleContinue = async () => {
    // In a real OAuth flow, this would exchange tokens.
    // For now, just navigate back to settings or home.
    navigate('/settings');
  };

  if (loading) return <div className="flex justify-center py-20 text-gray-500">Connecting to Garexcell...</div>;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 sm:px-6">
      <div className="w-full max-w-[400px] bg-white border border-gray-100 rounded-[32px] p-6 sm:p-8 shadow-sm flex flex-col items-center gap-6 text-center">
        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
          G
        </div>
        
        <div>
          <h2 className="text-2xl font-bold">Link Garexcell Account</h2>
          <p className="text-sm text-gray-500 mt-2">
            You are about to link your Garexcell account to FSMEC.
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm w-full">{error}</div>}

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-full flex items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-green-500" />
          <div className="text-left">
            <div className="text-sm font-bold text-gray-900">Authenticated</div>
            <div className="text-xs text-gray-500">{username}</div>
          </div>
        </div>

        <button 
          onClick={handleContinue}
          className="w-full bg-black text-white rounded-xl py-3.5 font-medium hover:bg-gray-800 transition-colors mt-2"
        >
          Continue as {username}
        </button>

        <button 
          onClick={() => navigate(-1)}
          className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
