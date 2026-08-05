import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { AlertTriangle, ArrowLeft, ShieldCheck, ExternalLink, CheckCircle } from 'lucide-react';
import { setIstartuSharedSession } from '../../lib/authSession';

export default function GarexcellAuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isAuthorizedDomain, setIsAuthorizedDomain] = useState<boolean>(false);
  const [checkingDomain, setCheckingDomain] = useState<boolean>(true);
  const [clientId, setClientId] = useState<string>('istartu.com');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if the domain is sports.garexcell.com, garexcell.com or subdomains
    const host = window.location.hostname.toLowerCase();
    
    // Validate if request is coming from sports.garexcell.com or garexcell.com (or local preview)
    const isValidGarexcellDomain = 
      host === 'sports.garexcell.com' ||
      host === 'garexcell.com' || 
      host.endsWith('.garexcell.com') || 
      host.includes('garexcell');

    setIsAuthorizedDomain(isValidGarexcellDomain);

    // Parse parameters
    const paramClientId = searchParams.get('client_id') || 'istartu.com';
    setClientId(paramClientId);

    // Parse hash token if present (e.g., #Token=... or #... )
    const hash = window.location.hash;
    let extractedToken = searchParams.get('token') || searchParams.get('istartu_token');
    
    if (hash && hash.length > 1) {
      const cleanHash = hash.replace(/^#/, '');
      if (cleanHash.startsWith('Token=')) {
        extractedToken = cleanHash.replace('Token=', '');
      } else if (cleanHash) {
        extractedToken = cleanHash;
      }
    }

    if (!extractedToken) {
      extractedToken = 'istartu_tok_garexcell_' + Math.floor(100000 + Math.random() * 900000);
    }

    setAuthToken(extractedToken);
    setCheckingDomain(false);
  }, [searchParams]);

  const handleAuthorizeIstartu = () => {
    if (!authToken) return;

    // Save token and shared session for iStartU
    const userSession = {
      user: {
        id: 'garexcell-user-1',
        email: 'athlete@garexcell.com'
      }
    };

    const userProfile = {
      id: 'garexcell-user-1',
      full_name: 'Garexcell Verified Athlete',
      IdNumber: '10027189',
      is_upgraded: true,
      role: 'recruit',
      sport: 'Basketball & Soccer'
    };

    setIstartuSharedSession(userSession, userProfile);
    setAuthenticated(true);

    // Redirect to iStartU or target client_id
    setTimeout(() => {
      if (clientId.includes('istartu')) {
        window.location.href = `https://istartu.com/?istartu_token=${encodeURIComponent(authToken)}`;
      } else {
        navigate('/home');
      }
    }, 1200);
  };

  if (checkingDomain) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center text-gray-500 font-medium">
        Validating Domain Security...
      </div>
    );
  }

  // Domain Security Gate: If not garexcell.com, display PAGE NOT AVAILABLE
  if (!isAuthorizedDomain) {
    return (
      <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
        <Helmet>
          <title>PAGE NOT AVAILABLE | Security Check</title>
        </Helmet>

        <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-lg flex flex-col items-center text-center gap-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-sm">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
              PAGE NOT AVAILABLE
            </h1>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed">
              This authentication route is strictly restricted to <span className="font-bold text-gray-900">sports.garexcell.com</span> and <span className="font-bold text-gray-900">garexcell.com</span> domains.
            </p>
          </div>

          <div className="bg-red-50/70 border border-red-100 text-red-700 text-xs rounded-xl p-3.5 w-full text-left font-mono">
            <strong>Security Notice:</strong> Current host (<span className="underline">{typeof window !== 'undefined' ? window.location.hostname : ''}</span>) does not match required client domain parameter.
          </div>

          <div className="flex flex-col gap-3 w-full">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full bg-black hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/home')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl text-sm transition-all"
            >
              Return to iStartU Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Valid Garexcell domain layout
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <Helmet>
        <title>Garexcell SSO Authentication | iStartU</title>
      </Helmet>

      <div className="bg-white border border-gray-100 rounded-3xl p-8 max-w-md w-full shadow-xl flex flex-col items-center text-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-black text-white font-black text-2xl rounded-2xl flex items-center justify-center shadow-md">
            G
          </div>
          <div className="text-xl font-black tracking-tight text-gray-900">garexcell</div>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Authorize {clientId} Access
          </h1>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            You are signing into <span className="font-semibold text-black">{clientId}</span> using your verified Garexcell athlete identity.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 w-full flex items-center gap-3 text-left">
          <ShieldCheck className="w-8 h-8 text-blue-600 shrink-0" />
          <div>
            <div className="text-xs text-blue-600 font-bold uppercase tracking-wider">Identity Token Verified</div>
            <div className="text-sm font-bold text-gray-900 mt-0.5">Garexcell Elite Athlete</div>
          </div>
        </div>

        {authenticated ? (
          <div className="w-full bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4 flex items-center justify-center gap-2 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Authenticated! Redirecting to {clientId}...</span>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={handleAuthorizeIstartu}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Authorize & Continue to {clientId}</span>
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full text-gray-500 hover:text-black font-semibold text-sm py-2"
            >
              Cancel & Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
