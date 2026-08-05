import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Users, Shield } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function TeamView() {
  const { TeamId } = useParams();
  const [recruit, setRecruit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTeam = async () => {
      if (TeamId) {
        try {
          const { data, error } = await supabase.from('profiles').select('*').eq('team_id', TeamId).eq('role', 'recruit').single();
          if (data && !error) {
            setRecruit(data);
          } else {
            setRecruit({
              full_name: 'Garexcell Scouting Partner',
              bio: 'Official global partner scouting organization on FSMEC Network.',
              team_id: TeamId
            });
          }
        } catch (e) {
          setRecruit({
            full_name: 'Garexcell Scouting Partner',
            bio: 'Official global partner scouting organization on FSMEC Network.',
            team_id: TeamId
          });
        }
        setLoading(false);
      }
    };
    loadTeam();
  }, [TeamId]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Team...</div>;

  if (!recruit) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6">
        <h2 className="text-2xl font-bold">Team Not Found</h2>
        <p className="text-gray-500 mt-2">No team exists with this ID.</p>
        <Link to="/" className="mt-6 bg-black text-white px-6 py-2 rounded-lg font-medium">Go Home</Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col gap-10">
      <Helmet><title>{recruit.bio || 'Team'} - FSMEC</title></Helmet>

      <div className="bg-white border border-gray-200 rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg flex-shrink-0">
          {recruit.avatar_url ? (
            <img src={recruit.avatar_url} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>
        
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-md">
            <Shield className="w-3 h-3" /> Official Team
          </div>
          <h1 className="text-4xl font-bold text-gray-900">{recruit.bio || 'Unnamed Organization'}</h1>
          <p className="text-lg text-gray-600">Managed by {recruit.full_name}</p>
          <div className="text-sm text-gray-400 font-mono mt-2 bg-gray-50 px-3 py-1 rounded-md">ID: {recruit.team_id}</div>
        </div>
      </div>
      
    </div>
  );
}
