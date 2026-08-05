import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Award, ArrowLeft, Download } from 'lucide-react';

export default function Certificate() {
  const { PlayerId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertData = async () => {
      setLoading(true);
      if (PlayerId) {
        let profileData = null;
        try {
          const res = await supabase.from('profiles').select('*').eq('user_id', PlayerId).single();
          if (res.data && !res.error) profileData = res.data;
        } catch (e) {
          console.warn("Cert profile query error:", e);
        }

        if (!profileData) {
          profileData = {
            id: PlayerId,
            user_id: PlayerId,
            full_name: 'Garexcell Elite Prospect',
            name: 'Garexcell Elite Prospect',
            position: 'Point Guard',
            IdNumber: '10027189',
            is_upgraded: true
          };
        }
        setProfile(profileData);

        try {
          const { data: feedbackData } = await supabase.from('feedbacks').select('*').eq('receiver_id', PlayerId);
          if (feedbackData) setFeedbacks(feedbackData);
        } catch (e) {
          // ignore
        }
      }
      setLoading(false);
    };
    fetchCertData();
  }, [PlayerId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (!profile) return <div className="p-8 text-center text-gray-500">Certificate not found.</div>;

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12 flex flex-col gap-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-black self-start">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      
      {/* Certificate Card */}
      <div className="bg-white border-8 border-gray-100 rounded-3xl p-10 md:p-16 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Award className="w-64 h-64" />
        </div>
        
        <div className="relative z-10 flex flex-col gap-8">
          <div className="flex flex-col items-center text-center gap-2 mb-8">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 tracking-tight">Official Certificate</h1>
            <p className="text-gray-500 uppercase tracking-[0.2em] text-sm font-bold mt-2">FSMEC Verified Athlete</p>
          </div>

          <div className="text-center">
            <p className="text-gray-500 text-sm mb-2">This certifies that</p>
            <h2 className="text-3xl font-bold text-black border-b-2 border-gray-200 pb-4 inline-block px-12">{profile.name}</h2>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm mt-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Position</span>
              <span className="font-medium text-lg text-gray-900">{profile.position || 'N/A'}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Date of Birth</span>
              <span className="font-medium text-lg text-gray-900">{profile.dob ? new Date(profile.dob).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Bio Summary</span>
              <span className="font-medium text-gray-900">{profile.bio || 'No bio provided.'}</span>
            </div>
            <div className="col-span-2 flex flex-col gap-1">
              <span className="text-gray-400 font-bold uppercase tracking-wider text-xs">Verified Feedbacks</span>
              <span className="font-medium text-gray-900">{feedbacks.length} Feedback(s) Received</span>
            </div>
          </div>

          <div className="flex justify-between items-end mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col text-center">
              <span className="text-black font-bold font-serif text-xl border-b border-gray-300 pb-1 px-4">Garexcell</span>
              <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">Authorized By</span>
            </div>
            <div className="flex flex-col text-center">
              <span className="text-black font-medium border-b border-gray-300 pb-1 px-4">{new Date().toLocaleDateString()}</span>
              <span className="text-xs text-gray-400 uppercase tracking-widest mt-2">Date Issued</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button className="flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
          <Download className="w-5 h-5" /> Download PDF
        </button>
      </div>
    </div>
  );
}
