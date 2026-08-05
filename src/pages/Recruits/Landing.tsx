import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { User, Shield, Briefcase, Mail, MapPin } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function RecruitsLanding() {
  return (
    <div className="flex flex-col items-center w-full max-w-7xl mx-auto px-6 py-20 gap-24">
      <Helmet>
        <title>For Recruits - FSMEC Global Scouting</title>
      </Helmet>

      <section className="flex flex-col items-center text-center max-w-3xl gap-8 mt-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-medium">
          <Briefcase className="w-4 h-4" />
          Scout Portal
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] text-gray-900">
          Find the Next <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Generation of Talent.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl">
          Join the elite network of college coaches, professional scouts, and recruiters. Access verified athlete data, create teams, run ads, and send direct feedback.
        </p>

        <div className="flex gap-4 mt-4">
          <Link to="/recruits/auth" className="bg-black text-white px-8 py-3.5 rounded-full font-bold hover:bg-gray-800 transition-colors shadow-lg">
            Create Recruiter Account
          </Link>
          <Link to="/" className="bg-white text-black border border-gray-200 px-8 py-3.5 rounded-full font-bold hover:bg-gray-50 transition-colors">
            Back to Main
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-10">
        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Verified Data</h3>
          <p className="text-gray-600 text-sm">Access authentic player measurements, academic info, and verified highlight tapes.</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-2">
            <User className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Direct Feedback</h3>
          <p className="text-gray-600 text-sm">Send private feedback to players to show your interest and guide their development.</p>
        </div>
        <div className="bg-white border border-gray-100 shadow-sm rounded-3xl p-8 flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-2">
            <MapPin className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold">Targeted Ads</h3>
          <p className="text-gray-600 text-sm">Run targeted promotional ads and open camp invites directly to athletes in our network.</p>
        </div>
      </section>
    </div>
  );
}
