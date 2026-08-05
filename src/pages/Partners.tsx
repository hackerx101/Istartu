import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ShieldCheck, ExternalLink, Handshake, ArrowRight, Star, Globe, Award } from 'lucide-react';

export default function Partners() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
      <Helmet>
        <title>Official Partners | iStartU Scouting & Athletic Network</title>
        <meta name="description" content="Meet the official scouting networks, media partners, and athletic organizations partnered with iStartU." />
      </Helmet>

      {/* Hero Header */}
      <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto">
        <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-lg">
          <Handshake className="w-7 h-7" />
        </div>
        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-800 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Verified Network Ecosystem</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-gray-900">
          Official Scouting Partners
        </h1>
        <p className="text-gray-500 text-sm sm:text-base font-medium leading-relaxed">
          iStartU collaborates with premier scouting networks and sports organizations to give prospects maximum exposure and verified recruitment opportunities.
        </p>
      </div>

      {/* Featured Partner Card - Partner 1: Garexcell */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black text-gray-400 uppercase tracking-widest">
            Featured Partner
          </h2>
          <span className="text-[10px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100 uppercase tracking-tight">
            Active Partner
          </span>
        </div>

        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border border-gray-800">
          {/* Subtle decorative glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="flex flex-col gap-4 max-w-2xl">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="w-12 h-12 bg-white text-black font-black text-2xl rounded-2xl flex items-center justify-center shadow-md shrink-0">
                  G
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                      Partner #1
                    </span>
                    <span className="text-xs text-gray-400 font-bold">• Official Premier Partner</span>
                  </div>
                  <h3 className="text-2xl sm:text-4xl font-black tracking-tight text-white mt-1">
                    Garexcell Scouting Network
                  </h3>
                </div>
              </div>

              <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-normal">
                Garexcell is the leading global scouting, video analysis, and recruitment placement network for elite basketball and soccer prospects. Providing verified player metrics, scout evaluations, and direct college & professional network placement.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-lg font-black text-white">#1</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Scouting Platform</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-lg font-black text-white">Global</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Recruit Reach</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                  <div className="text-lg font-black text-white">Verified</div>
                  <div className="text-[10px] text-gray-400 uppercase font-bold tracking-tight">Athlete Stats</div>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
              <a
                href="https://garexcell.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto bg-white hover:bg-gray-100 text-black font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 group active:scale-95"
              >
                <span>Visit Garexcell.com</span>
                <ExternalLink className="w-4 h-4 text-black group-hover:translate-x-0.5 transition-transform" />
              </a>

              <p className="text-[11px] text-gray-400 text-center font-medium">
                Official partner portal & scouting database
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Become a Partner Callout */}
      <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-left">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <Globe className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Become an Official iStartU Partner</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Are you an athletic academy, scouting service, or sports media organization? Apply to partner with us.
            </p>
          </div>
        </div>

        <Link
          to="/partner/request"
          className="w-full sm:w-auto bg-black hover:bg-gray-800 text-white font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-tight transition-all shrink-0 flex items-center justify-center gap-2"
        >
          <span>Apply to Partner</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
