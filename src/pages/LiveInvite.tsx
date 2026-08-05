import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Video, Users } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function LiveInvite() {
  const { LiveId } = useParams();

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <Helmet>
        <title>Live Interview Invitation - FSMEC</title>
      </Helmet>

      <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-3xl p-8 flex flex-col items-center text-center gap-6 shadow-2xl">
        <div className="w-20 h-20 bg-red-900/30 text-red-500 rounded-full flex items-center justify-center">
          <Video className="w-10 h-10" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold mb-2">Live Interview Invitation</h1>
          <p className="text-gray-400 text-sm">You have been invited to join a live stream session.</p>
        </div>

        <div className="w-full bg-black rounded-xl p-4 border border-gray-800 font-mono text-sm text-gray-500">
          Session ID: {LiveId}
        </div>

        <div className="flex flex-col gap-3 w-full">
          <button className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
            <Users className="w-5 h-5" /> Join as Guest
          </button>
          <Link to="/" className="w-full bg-gray-800 text-white font-medium py-3.5 rounded-xl hover:bg-gray-700 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
