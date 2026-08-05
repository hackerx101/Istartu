import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';

export default function PartnerRequest() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-6 py-12">
      <Helmet><title>Request to be a Partner - FSMEC</title></Helmet>
      
      <div className="w-full max-w-2xl bg-white border border-gray-100 rounded-3xl p-8 shadow-xl flex flex-col gap-6 text-center">
        <h1 className="text-3xl font-bold">Partner with FSMEC</h1>
        <p className="text-gray-500 text-sm">Fill out the form below to apply for our official partner program. Verified partners receive special badges and priority placement.</p>
        
        {/* Placeholder for the user's form */}
        <div className="w-full h-[500px] bg-gray-50 rounded-2xl border border-gray-200 flex flex-col items-center justify-center p-6">
          <div className="text-gray-400 font-medium mb-2">Embed your Google Form, Typeform, or custom form here</div>
          <p className="text-xs text-gray-400">e.g. &lt;iframe src="YOUR_FORM_LINK" ... &gt;&lt;/iframe&gt;</p>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="bg-black text-white px-8 py-3.5 rounded-full font-bold hover:bg-gray-800 transition-colors mt-4 self-center"
        >
          Return Home (Done)
        </button>
      </div>
    </div>
  );
}
