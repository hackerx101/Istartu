import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Tv, Loader2, ExternalLink } from 'lucide-react';
import { redirectToTV, getTVRedirectURL } from '../lib/authSession';

export default function TVRedirect() {
  useEffect(() => {
    // Redirect instantly to tv.istartu.com passing istartu_token & istartu_shared_session
    const timer = setTimeout(() => {
      redirectToTV();
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  const targetUrl = getTVRedirectURL();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-16 bg-gray-50 text-center">
      <Helmet>
        <title>iStartU TV & Live Broadcasts</title>
      </Helmet>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-xl flex flex-col items-center gap-6">
        <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-md">
          <Tv className="w-8 h-8" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Redirecting to iStartU TV</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            Connecting your account session across <span className="font-semibold text-black">tv.istartu.com</span>...
          </p>
        </div>

        <div className="flex items-center gap-3 text-blue-600 bg-blue-50 px-4 py-2.5 rounded-full text-xs font-bold">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Transferring istartu_token & session</span>
        </div>

        <a 
          href={targetUrl}
          className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3 px-6 rounded-xl text-sm transition-all flex items-center justify-center gap-2 mt-2 shadow-sm"
        >
          <span>Open iStartU TV Now</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
