import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function RedirectPage() {
  const [searchParams] = useSearchParams();
  const url = searchParams.get('url');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!url) return;
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = url;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [url]);

  if (!url) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Invalid Link</h1>
          <p className="text-gray-500 mt-2">No redirect URL provided.</p>
        </div>
      </div>
    );
  }

  let domain = '';
  try {
    domain = new URL(url).hostname;
  } catch (e) {
    domain = url;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <Helmet><title>Redirecting - FSMEC</title></Helmet>
      
      <div className="w-full max-w-md bg-white border border-gray-100 rounded-3xl p-8 shadow-xl flex flex-col items-center text-center gap-6">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold">Leaving FSMEC</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            You are about to be redirected to an external website. Please be careful with your personal information.
          </p>
        </div>

        <div className="bg-gray-50 w-full p-4 rounded-xl border border-gray-200">
          <div className="text-sm font-bold text-gray-700">Destination</div>
          <div className="text-blue-600 font-medium truncate mt-1">{domain}</div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          <div className="text-sm font-medium">Redirecting in {countdown} seconds...</div>
        </div>
        
        <a 
          href={url}
          className="w-full bg-black text-white px-6 py-3.5 rounded-xl font-bold hover:bg-gray-800 transition-colors mt-2"
        >
          Continue Now
        </a>
      </div>
    </div>
  );
}
